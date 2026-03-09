'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { ISubtopic } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import { createErrorResponse, createSuccessResponse, notFoundError, duplicateError } from '@/server/lib/action-utils';

// ===== SCHEMAS =====

const subtopicInputSchema = z.object({
    topicSlug: z.string().min(1, 'Topic is required'),
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max),
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only'),
    description: z.string().max(500).optional(),
    order: z.number().int().min(0).default(0),
    published: z.boolean().default(false),
});

const subtopicUpdateSchema = subtopicInputSchema.partial();

type SubtopicInput = z.infer<typeof subtopicInputSchema>;
type SubtopicUpdate = z.infer<typeof subtopicUpdateSchema>;

// ===== HELPERS =====

const getSubtopicsCollection = () => getCollection<ISubtopic>(COLLECTIONS.subtopics);

const revalidateSubtopicPaths = (topicSlug: string): void => {
    ['/articles', '/admin/subtopics', '/admin/articles', `/articles/${topicSlug}`].forEach(p => revalidatePath(p));
};

const findSubtopic = async (topicSlug: string, slug: string) => 
    (await getSubtopicsCollection()).findOne({ topicSlug, slug });

// ===== SERVER ACTIONS =====

export const createSubtopic = async (data: SubtopicInput): Promise<IApiResponse<string>> => {
    try {
        const parsed = subtopicInputSchema.safeParse(data);
        if (!parsed.success) return createErrorResponse(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getSubtopicsCollection();
        if (await collection.findOne({ topicSlug: parsed.data.topicSlug, slug: parsed.data.slug })) {
            return duplicateError('A subtopic with this slug already exists in this topic');
        }

        const topicsCollection = await getCollection(COLLECTIONS.topics);
        if (!(await topicsCollection.findOne({ slug: parsed.data.topicSlug }))) {
            return createErrorResponse('Parent topic not found', 400);
        }

        const now = new Date();
        const subtopic: Omit<ISubtopic, '_id'> = {
            ...parsed.data,
            metadata: { articleCount: 0 },
            createdAt: now,
            updatedAt: now,
        };

        const result = await collection.insertOne(subtopic as ISubtopic);
        revalidateSubtopicPaths(parsed.data.topicSlug);

        return { success: true, status: 201, data: result.insertedId.toString(), message: 'Subtopic created successfully' };
    } catch (error) {
        console.error('Failed to create subtopic:', error);
        return createErrorResponse('Failed to create subtopic. Please try again.', 500);
    }
};

export const updateSubtopic = async (topicSlug: string, slug: string, data: SubtopicUpdate): Promise<IApiResponse<void>> => {
    try {
        const parsed = subtopicUpdateSchema.safeParse(data);
        if (!parsed.success) return createErrorResponse(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getSubtopicsCollection();
        if (!(await findSubtopic(topicSlug, slug))) return notFoundError('Subtopic');

        if (parsed.data.slug && parsed.data.slug !== slug) {
            if (await collection.findOne({ topicSlug: parsed.data.topicSlug || topicSlug, slug: parsed.data.slug })) {
                return duplicateError('A subtopic with this slug');
            }
        }

        if (parsed.data.topicSlug && parsed.data.topicSlug !== topicSlug) {
            const topicsCollection = await getCollection(COLLECTIONS.topics);
            if (!(await topicsCollection.findOne({ slug: parsed.data.topicSlug }))) {
                return createErrorResponse('New parent topic not found', 400);
            }
        }

        const updateData = { ...parsed.data, updatedAt: new Date() };
        Object.keys(updateData).forEach(k => updateData[k as keyof typeof updateData] === undefined && delete updateData[k as keyof typeof updateData]);

        await collection.updateOne({ topicSlug, slug }, { $set: updateData });
        revalidateSubtopicPaths(topicSlug);
        if (parsed.data.topicSlug && parsed.data.topicSlug !== topicSlug) revalidateSubtopicPaths(parsed.data.topicSlug);

        return createSuccessResponse(undefined, 'Subtopic updated successfully');
    } catch (error) {
        console.error('Failed to update subtopic:', error);
        return createErrorResponse('Failed to update subtopic. Please try again.', 500);
    }
};

export const deleteSubtopic = async (topicSlug: string, slug: string, cascade = false): Promise<IApiResponse<void>> => {
    try {
        const collection = await getSubtopicsCollection();
        if (!(await findSubtopic(topicSlug, slug))) return notFoundError('Subtopic');

        if (cascade) {
            const contentCollection = await getCollection(COLLECTIONS.content);
            await contentCollection.deleteMany({ topicSlug, subtopicSlug: slug, type: 'article' });
        }

        await collection.deleteOne({ topicSlug, slug });
        revalidateSubtopicPaths(topicSlug);

        return createSuccessResponse(undefined, cascade ? 'Subtopic and all related articles deleted' : 'Subtopic deleted successfully');
    } catch (error) {
        console.error('Failed to delete subtopic:', error);
        return createErrorResponse('Failed to delete subtopic. Please try again.', 500);
    }
};

export const reorderSubtopics = async (topicSlug: string, slugs: string[]): Promise<IApiResponse<void>> => {
    try {
        if (!Array.isArray(slugs) || slugs.length === 0) return createErrorResponse('Invalid slugs array');

        const collection = await getSubtopicsCollection();
        await collection.bulkWrite(slugs.map((slug, index) => ({
            updateOne: { filter: { topicSlug, slug }, update: { $set: { order: index, updatedAt: new Date() } } },
        })));

        revalidateSubtopicPaths(topicSlug);
        return createSuccessResponse(undefined, 'Subtopics reordered successfully');
    } catch (error) {
        console.error('Failed to reorder subtopics:', error);
        return createErrorResponse('Failed to reorder subtopics. Please try again.', 500);
    }
};

export const toggleSubtopicPublished = async (topicSlug: string, slug: string): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getSubtopicsCollection();
        const subtopic = await findSubtopic(topicSlug, slug);
        if (!subtopic) return notFoundError('Subtopic');

        const newPublished = !subtopic.published;
        await collection.updateOne({ topicSlug, slug }, { $set: { published: newPublished, updatedAt: new Date() } });
        revalidateSubtopicPaths(topicSlug);

        return createSuccessResponse(newPublished, newPublished ? 'Subtopic published' : 'Subtopic unpublished');
    } catch (error) {
        console.error('Failed to toggle subtopic published:', error);
        return createErrorResponse('Failed to update subtopic. Please try again.', 500);
    }
};

export const updateSubtopicArticleCount = async (topicSlug: string, slug: string, delta: number): Promise<IApiResponse<void>> => {
    try {
        const collection = await getSubtopicsCollection();
        await collection.updateOne(
            { topicSlug, slug },
            { $inc: { 'metadata.articleCount': delta }, $set: { updatedAt: new Date() } }
        );
        return { success: true, status: 200 };
    } catch (error) {
        console.error('Failed to update subtopic article count:', error);
        return createErrorResponse('Failed to update article count', 500);
    }
};
