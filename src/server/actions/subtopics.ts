'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { ISubtopic, IApiResponse } from '@/interfaces';

// ===== VALIDATION SCHEMAS =====

const subtopicInputSchema = z.object({
    topicSlug: z.string().min(1, 'Topic is required'),
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max),
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only'),
    description: z.string().max(500).optional(),
    order: z.number().int().min(0).default(0),
    published: z.boolean().default(false),
});

const subtopicUpdateSchema = subtopicInputSchema.partial().extend({
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern).optional(),
});

type SubtopicInput = z.infer<typeof subtopicInputSchema>;
type SubtopicUpdate = z.infer<typeof subtopicUpdateSchema>;

// ===== HELPER FUNCTIONS =====

const revalidateSubtopicPaths = (topicSlug: string): void => {
    revalidatePath('/articles');
    revalidatePath(`/articles/${topicSlug}`);
};

// ===== SERVER ACTIONS =====

/**
 * Create a new subtopic
 */
export const createSubtopic = async (data: SubtopicInput): Promise<IApiResponse<string>> => {
    try {
        const parsed = subtopicInputSchema.safeParse(data);
        if (!parsed.success) {
            return {
                success: false,
                status: 400,
                error: parsed.error.issues[0]?.message ?? 'Invalid input',
            };
        }

        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);

        // Check if slug already exists within this topic
        const existing = await collection.findOne({ 
            topicSlug: parsed.data.topicSlug, 
            slug: parsed.data.slug 
        });
        if (existing) {
            return {
                success: false,
                status: 409,
                error: 'A subtopic with this slug already exists in this topic',
            };
        }

        // Verify parent topic exists
        const topicsCollection = await getCollection(COLLECTIONS.topics);
        const parentTopic = await topicsCollection.findOne({ slug: parsed.data.topicSlug });
        if (!parentTopic) {
            return {
                success: false,
                status: 400,
                error: 'Parent topic not found',
            };
        }

        const now = new Date();
        const subtopic: Omit<ISubtopic, '_id'> = {
            ...parsed.data,
            metadata: {
                articleCount: 0,
            },
            createdAt: now,
            updatedAt: now,
        };

        const result = await collection.insertOne(subtopic as ISubtopic);

        revalidateSubtopicPaths(parsed.data.topicSlug);

        return {
            success: true,
            status: 201,
            data: result.insertedId.toString(),
            message: 'Subtopic created successfully',
        };
    } catch (error) {
        console.error('Failed to create subtopic:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to create subtopic. Please try again.',
        };
    }
};

/**
 * Update an existing subtopic
 */
export const updateSubtopic = async (
    topicSlug: string, 
    slug: string, 
    data: SubtopicUpdate
): Promise<IApiResponse<void>> => {
    try {
        const parsed = subtopicUpdateSchema.safeParse(data);
        if (!parsed.success) {
            return {
                success: false,
                status: 400,
                error: parsed.error.issues[0]?.message ?? 'Invalid input',
            };
        }

        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);

        // Check if subtopic exists
        const existing = await collection.findOne({ topicSlug, slug });
        if (!existing) {
            return {
                success: false,
                status: 404,
                error: 'Subtopic not found',
            };
        }

        // If changing slug, check for conflicts
        if (parsed.data.slug && parsed.data.slug !== slug) {
            const slugConflict = await collection.findOne({ 
                topicSlug: parsed.data.topicSlug || topicSlug,
                slug: parsed.data.slug 
            });
            if (slugConflict) {
                return {
                    success: false,
                    status: 409,
                    error: 'A subtopic with this slug already exists',
                };
            }
        }

        // If changing topic, verify new topic exists
        if (parsed.data.topicSlug && parsed.data.topicSlug !== topicSlug) {
            const topicsCollection = await getCollection(COLLECTIONS.topics);
            const newTopic = await topicsCollection.findOne({ slug: parsed.data.topicSlug });
            if (!newTopic) {
                return {
                    success: false,
                    status: 400,
                    error: 'New parent topic not found',
                };
            }
        }

        const updateData = {
            ...parsed.data,
            updatedAt: new Date(),
        };

        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key as keyof typeof updateData] === undefined) {
                delete updateData[key as keyof typeof updateData];
            }
        });

        await collection.updateOne({ topicSlug, slug }, { $set: updateData });

        // Revalidate paths
        revalidateSubtopicPaths(topicSlug);
        if (parsed.data.topicSlug && parsed.data.topicSlug !== topicSlug) {
            revalidateSubtopicPaths(parsed.data.topicSlug);
        }

        return {
            success: true,
            status: 200,
            message: 'Subtopic updated successfully',
        };
    } catch (error) {
        console.error('Failed to update subtopic:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update subtopic. Please try again.',
        };
    }
};

/**
 * Delete a subtopic (and optionally its articles)
 */
export const deleteSubtopic = async (
    topicSlug: string, 
    slug: string, 
    cascade: boolean = false
): Promise<IApiResponse<void>> => {
    try {
        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);

        // Check if subtopic exists
        const existing = await collection.findOne({ topicSlug, slug });
        if (!existing) {
            return {
                success: false,
                status: 404,
                error: 'Subtopic not found',
            };
        }

        if (cascade) {
            // Delete all articles belonging to this subtopic
            const contentCollection = await getCollection(COLLECTIONS.content);
            await contentCollection.deleteMany({ 
                topicSlug, 
                subtopicSlug: slug, 
                type: 'article' 
            });
        }

        await collection.deleteOne({ topicSlug, slug });

        revalidateSubtopicPaths(topicSlug);

        return {
            success: true,
            status: 200,
            message: cascade ? 'Subtopic and all related articles deleted' : 'Subtopic deleted successfully',
        };
    } catch (error) {
        console.error('Failed to delete subtopic:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to delete subtopic. Please try again.',
        };
    }
};

/**
 * Reorder subtopics within a topic
 */
export const reorderSubtopics = async (
    topicSlug: string, 
    slugs: string[]
): Promise<IApiResponse<void>> => {
    try {
        if (!Array.isArray(slugs) || slugs.length === 0) {
            return {
                success: false,
                status: 400,
                error: 'Invalid slugs array',
            };
        }

        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);

        // Update order for each subtopic
        const bulkOps = slugs.map((slug, index) => ({
            updateOne: {
                filter: { topicSlug, slug },
                update: { $set: { order: index, updatedAt: new Date() } },
            },
        }));

        await collection.bulkWrite(bulkOps);

        revalidateSubtopicPaths(topicSlug);

        return {
            success: true,
            status: 200,
            message: 'Subtopics reordered successfully',
        };
    } catch (error) {
        console.error('Failed to reorder subtopics:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to reorder subtopics. Please try again.',
        };
    }
};

/**
 * Toggle subtopic published status
 */
export const toggleSubtopicPublished = async (
    topicSlug: string, 
    slug: string
): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);

        const subtopic = await collection.findOne({ topicSlug, slug });
        if (!subtopic) {
            return {
                success: false,
                status: 404,
                error: 'Subtopic not found',
            };
        }

        const newPublished = !subtopic.published;
        await collection.updateOne(
            { topicSlug, slug },
            { $set: { published: newPublished, updatedAt: new Date() } }
        );

        revalidateSubtopicPaths(topicSlug);

        return {
            success: true,
            status: 200,
            data: newPublished,
            message: newPublished ? 'Subtopic published' : 'Subtopic unpublished',
        };
    } catch (error) {
        console.error('Failed to toggle subtopic published:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update subtopic. Please try again.',
        };
    }
};

/**
 * Update subtopic article count (called internally when articles are added/removed)
 */
export const updateSubtopicArticleCount = async (
    topicSlug: string, 
    slug: string, 
    delta: number
): Promise<IApiResponse<void>> => {
    try {
        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);

        await collection.updateOne(
            { topicSlug, slug },
            {
                $inc: { 'metadata.articleCount': delta },
                $set: { updatedAt: new Date() },
            }
        );

        return {
            success: true,
            status: 200,
        };
    } catch (error) {
        console.error('Failed to update subtopic article count:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update article count',
        };
    }
};
