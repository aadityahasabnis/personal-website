'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { ITopic, IApiResponse } from '@/interfaces';

// ===== VALIDATION SCHEMAS =====

const topicInputSchema = z.object({
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max),
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only'),
    description: z.string().max(500),
    icon: z.string().optional(),
    coverImage: z.string().url().optional().or(z.literal('')),
    order: z.number().int().min(0).default(0),
    published: z.boolean().default(false),
    featured: z.boolean().default(false),
});

const topicUpdateSchema = topicInputSchema.partial().extend({
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern).optional(),
});

type TopicInput = z.infer<typeof topicInputSchema>;
type TopicUpdate = z.infer<typeof topicUpdateSchema>;

// ===== HELPER FUNCTIONS =====

const revalidateTopicPaths = (slug?: string): void => {
    revalidatePath('/articles');
    revalidatePath('/admin/topics'); // Admin list page
    revalidatePath('/admin/articles'); // Articles depend on topics
    if (slug) {
        revalidatePath(`/articles/${slug}`);
        revalidatePath(`/admin/topics/${slug}/edit`);
    }
};

// ===== SERVER ACTIONS =====

/**
 * Create a new topic
 */
export const createTopic = async (data: TopicInput): Promise<IApiResponse<string>> => {
    try {
        const parsed = topicInputSchema.safeParse(data);
        if (!parsed.success) {
            return {
                success: false,
                status: 400,
                error: parsed.error.issues[0]?.message ?? 'Invalid input',
            };
        }

        const collection = await getCollection<ITopic>(COLLECTIONS.topics);

        // Check if slug already exists
        const existing = await collection.findOne({ slug: parsed.data.slug });
        if (existing) {
            return {
                success: false,
                status: 409,
                error: 'A topic with this slug already exists',
            };
        }

        const now = new Date();
        const topic: Omit<ITopic, '_id'> = {
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            metadata: {
                articleCount: 0,
                lastUpdated: now,
            },
            createdAt: now,
            updatedAt: now,
        };

        const result = await collection.insertOne(topic as ITopic);

        revalidateTopicPaths(parsed.data.slug);

        return {
            success: true,
            status: 201,
            data: result.insertedId.toString(),
            message: 'Topic created successfully',
        };
    } catch (error) {
        console.error('Failed to create topic:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to create topic. Please try again.',
        };
    }
};

/**
 * Update an existing topic
 */
export const updateTopic = async (slug: string, data: TopicUpdate): Promise<IApiResponse<void>> => {
    try {
        const parsed = topicUpdateSchema.safeParse(data);
        if (!parsed.success) {
            return {
                success: false,
                status: 400,
                error: parsed.error.issues[0]?.message ?? 'Invalid input',
            };
        }

        const collection = await getCollection<ITopic>(COLLECTIONS.topics);

        // Check if topic exists
        const existing = await collection.findOne({ slug });
        if (!existing) {
            return {
                success: false,
                status: 404,
                error: 'Topic not found',
            };
        }

        // If changing slug, check for conflicts
        if (parsed.data.slug && parsed.data.slug !== slug) {
            const slugConflict = await collection.findOne({ slug: parsed.data.slug });
            if (slugConflict) {
                return {
                    success: false,
                    status: 409,
                    error: 'A topic with this slug already exists',
                };
            }
        }

        const updateData = {
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            updatedAt: new Date(),
            'metadata.lastUpdated': new Date(),
        };

        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key as keyof typeof updateData] === undefined) {
                delete updateData[key as keyof typeof updateData];
            }
        });

        await collection.updateOne({ slug }, { $set: updateData });

        // Revalidate both old and new paths if slug changed
        revalidateTopicPaths(slug);
        if (parsed.data.slug && parsed.data.slug !== slug) {
            revalidateTopicPaths(parsed.data.slug);
        }

        return {
            success: true,
            status: 200,
            message: 'Topic updated successfully',
        };
    } catch (error) {
        console.error('Failed to update topic:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update topic. Please try again.',
        };
    }
};

/**
 * Delete a topic (and optionally its subtopics/articles)
 */
export const deleteTopic = async (slug: string, cascade: boolean = false): Promise<IApiResponse<void>> => {
    try {
        const collection = await getCollection<ITopic>(COLLECTIONS.topics);

        // Check if topic exists
        const existing = await collection.findOne({ slug });
        if (!existing) {
            return {
                success: false,
                status: 404,
                error: 'Topic not found',
            };
        }

        if (cascade) {
            // Delete all subtopics belonging to this topic
            const subtopicsCollection = await getCollection(COLLECTIONS.subtopics);
            await subtopicsCollection.deleteMany({ topicSlug: slug });

            // Delete all articles belonging to this topic
            const contentCollection = await getCollection(COLLECTIONS.content);
            await contentCollection.deleteMany({ topicSlug: slug, type: 'article' });
        }

        await collection.deleteOne({ slug });

        revalidateTopicPaths(slug);

        return {
            success: true,
            status: 200,
            message: cascade ? 'Topic and all related content deleted' : 'Topic deleted successfully',
        };
    } catch (error) {
        console.error('Failed to delete topic:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to delete topic. Please try again.',
        };
    }
};

/**
 * Reorder topics by providing an array of slugs in the desired order
 */
export const reorderTopics = async (slugs: string[]): Promise<IApiResponse<void>> => {
    try {
        if (!Array.isArray(slugs) || slugs.length === 0) {
            return {
                success: false,
                status: 400,
                error: 'Invalid slugs array',
            };
        }

        const collection = await getCollection<ITopic>(COLLECTIONS.topics);

        // Update order for each topic
        const bulkOps = slugs.map((slug, index) => ({
            updateOne: {
                filter: { slug },
                update: { $set: { order: index, updatedAt: new Date() } },
            },
        }));

        await collection.bulkWrite(bulkOps);

        revalidateTopicPaths();

        return {
            success: true,
            status: 200,
            message: 'Topics reordered successfully',
        };
    } catch (error) {
        console.error('Failed to reorder topics:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to reorder topics. Please try again.',
        };
    }
};

/**
 * Toggle topic published status
 */
export const toggleTopicPublished = async (slug: string): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getCollection<ITopic>(COLLECTIONS.topics);

        const topic = await collection.findOne({ slug });
        if (!topic) {
            return {
                success: false,
                status: 404,
                error: 'Topic not found',
            };
        }

        const newPublished = !topic.published;
        await collection.updateOne(
            { slug },
            { $set: { published: newPublished, updatedAt: new Date() } }
        );

        revalidateTopicPaths(slug);

        return {
            success: true,
            status: 200,
            data: newPublished,
            message: newPublished ? 'Topic published' : 'Topic unpublished',
        };
    } catch (error) {
        console.error('Failed to toggle topic published:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update topic. Please try again.',
        };
    }
};

/**
 * Toggle topic featured status
 */
export const toggleTopicFeatured = async (slug: string): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getCollection<ITopic>(COLLECTIONS.topics);

        const topic = await collection.findOne({ slug });
        if (!topic) {
            return {
                success: false,
                status: 404,
                error: 'Topic not found',
            };
        }

        const newFeatured = !topic.featured;
        await collection.updateOne(
            { slug },
            { $set: { featured: newFeatured, updatedAt: new Date() } }
        );

        revalidateTopicPaths(slug);

        return {
            success: true,
            status: 200,
            data: newFeatured,
            message: newFeatured ? 'Topic featured' : 'Topic unfeatured',
        };
    } catch (error) {
        console.error('Failed to toggle topic featured:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update topic. Please try again.',
        };
    }
};

/**
 * Update topic article count (called internally when articles are added/removed)
 */
export const updateTopicArticleCount = async (slug: string, delta: number): Promise<IApiResponse<void>> => {
    try {
        const collection = await getCollection<ITopic>(COLLECTIONS.topics);

        await collection.updateOne(
            { slug },
            {
                $inc: { 'metadata.articleCount': delta },
                $set: { 'metadata.lastUpdated': new Date(), updatedAt: new Date() },
            }
        );

        return {
            success: true,
            status: 200,
        };
    } catch (error) {
        console.error('Failed to update topic article count:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update article count',
        };
    }
};
