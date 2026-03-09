'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { ITopic } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import { createErrorResponse, createSuccessResponse, notFoundError, duplicateError } from '@/server/lib/action-utils';

// ===== SCHEMAS =====

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

const topicUpdateSchema = topicInputSchema.partial();

type TopicInput = z.infer<typeof topicInputSchema>;
type TopicUpdate = z.infer<typeof topicUpdateSchema>;

// ===== HELPERS =====

const getTopicsCollection = () => getCollection<ITopic>(COLLECTIONS.topics);

const revalidateTopicPaths = (slug?: string): void => {
    ['/articles', '/admin/topics', '/admin/articles'].forEach(p => revalidatePath(p));
    if (slug) {
        revalidatePath(`/articles/${slug}`);
        revalidatePath(`/admin/topics/${slug}/edit`);
    }
};

const findTopic = async (slug: string) => (await getTopicsCollection()).findOne({ slug });

// ===== SERVER ACTIONS =====

export const createTopic = async (data: TopicInput): Promise<IApiResponse<string>> => {
    try {
        const parsed = topicInputSchema.safeParse(data);
        if (!parsed.success) return createErrorResponse(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getTopicsCollection();
        if (await collection.findOne({ slug: parsed.data.slug })) return duplicateError('A topic with this slug');

        const now = new Date();
        const topic: Omit<ITopic, '_id'> = {
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            metadata: { articleCount: 0, lastUpdated: now },
            createdAt: now,
            updatedAt: now,
        };

        const result = await collection.insertOne(topic as ITopic);
        revalidateTopicPaths(parsed.data.slug);

        return { success: true, status: 201, data: result.insertedId.toString(), message: 'Topic created successfully' };
    } catch (error) {
        console.error('Failed to create topic:', error);
        return createErrorResponse('Failed to create topic. Please try again.', 500);
    }
};

export const updateTopic = async (slug: string, data: TopicUpdate): Promise<IApiResponse<void>> => {
    try {
        const parsed = topicUpdateSchema.safeParse(data);
        if (!parsed.success) return createErrorResponse(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getTopicsCollection();
        if (!(await findTopic(slug))) return notFoundError('Topic');

        if (parsed.data.slug && parsed.data.slug !== slug) {
            if (await collection.findOne({ slug: parsed.data.slug })) return duplicateError('A topic with this slug');
        }

        const updateData = {
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            updatedAt: new Date(),
            'metadata.lastUpdated': new Date(),
        };
        Object.keys(updateData).forEach(k => updateData[k as keyof typeof updateData] === undefined && delete updateData[k as keyof typeof updateData]);

        await collection.updateOne({ slug }, { $set: updateData });
        revalidateTopicPaths(slug);
        if (parsed.data.slug && parsed.data.slug !== slug) revalidateTopicPaths(parsed.data.slug);

        return createSuccessResponse(undefined, 'Topic updated successfully');
    } catch (error) {
        console.error('Failed to update topic:', error);
        return createErrorResponse('Failed to update topic. Please try again.', 500);
    }
};

export const deleteTopic = async (slug: string, cascade = false): Promise<IApiResponse<void>> => {
    try {
        const collection = await getTopicsCollection();
        if (!(await findTopic(slug))) return notFoundError('Topic');

        if (cascade) {
            const [subtopicsCollection, contentCollection] = await Promise.all([
                getCollection(COLLECTIONS.subtopics),
                getCollection(COLLECTIONS.content),
            ]);
            await Promise.all([
                subtopicsCollection.deleteMany({ topicSlug: slug }),
                contentCollection.deleteMany({ topicSlug: slug, type: 'article' }),
            ]);
        }

        await collection.deleteOne({ slug });
        revalidateTopicPaths(slug);

        return createSuccessResponse(undefined, cascade ? 'Topic and all related content deleted' : 'Topic deleted successfully');
    } catch (error) {
        console.error('Failed to delete topic:', error);
        return createErrorResponse('Failed to delete topic. Please try again.', 500);
    }
};

export const reorderTopics = async (slugs: string[]): Promise<IApiResponse<void>> => {
    try {
        if (!Array.isArray(slugs) || slugs.length === 0) return createErrorResponse('Invalid slugs array');

        const collection = await getTopicsCollection();
        await collection.bulkWrite(slugs.map((slug, index) => ({
            updateOne: { filter: { slug }, update: { $set: { order: index, updatedAt: new Date() } } },
        })));

        revalidateTopicPaths();
        return createSuccessResponse(undefined, 'Topics reordered successfully');
    } catch (error) {
        console.error('Failed to reorder topics:', error);
        return createErrorResponse('Failed to reorder topics. Please try again.', 500);
    }
};

export const toggleTopicPublished = async (slug: string): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getTopicsCollection();
        const topic = await findTopic(slug);
        if (!topic) return notFoundError('Topic');

        const newPublished = !topic.published;
        await collection.updateOne({ slug }, { $set: { published: newPublished, updatedAt: new Date() } });
        revalidateTopicPaths(slug);

        return createSuccessResponse(newPublished, newPublished ? 'Topic published' : 'Topic unpublished');
    } catch (error) {
        console.error('Failed to toggle topic published:', error);
        return createErrorResponse('Failed to update topic. Please try again.', 500);
    }
};

export const toggleTopicFeatured = async (slug: string): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getTopicsCollection();
        const topic = await findTopic(slug);
        if (!topic) return notFoundError('Topic');

        const newFeatured = !topic.featured;
        await collection.updateOne({ slug }, { $set: { featured: newFeatured, updatedAt: new Date() } });
        revalidateTopicPaths(slug);

        return createSuccessResponse(newFeatured, newFeatured ? 'Topic featured' : 'Topic unfeatured');
    } catch (error) {
        console.error('Failed to toggle topic featured:', error);
        return createErrorResponse('Failed to update topic. Please try again.', 500);
    }
};

export const updateTopicArticleCount = async (slug: string, delta: number): Promise<IApiResponse<void>> => {
    try {
        const collection = await getTopicsCollection();
        await collection.updateOne(
            { slug },
            { $inc: { 'metadata.articleCount': delta }, $set: { 'metadata.lastUpdated': new Date(), updatedAt: new Date() } }
        );
        return { success: true, status: 200 };
    } catch (error) {
        console.error('Failed to update topic article count:', error);
        return createErrorResponse('Failed to update article count', 500);
    }
};
