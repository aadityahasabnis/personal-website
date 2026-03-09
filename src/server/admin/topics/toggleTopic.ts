'use server';

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants/siteConstants';
import type { ITopic } from '@/interfaces/schema';
import type { ActionResponse } from '../utils';
import { success, notFound, error, handleError, logUpdate, logReorder } from '../utils';

// ===== RESPONSE TYPES =====

export interface ToggleTopicResponse extends ActionResponse<boolean> {}
export interface ReorderTopicsResponse extends ActionResponse<void> {}
export interface UpdateCountResponse extends ActionResponse<void> {}

// ===== HELPERS =====

const getTopicsCollection = () => getCollection<ITopic>(COLLECTIONS.topics);
const findTopic = async (slug: string) => (await getTopicsCollection()).findOne({ slug });

const revalidateTopicPaths = (slug?: string): void => {
    ['/articles', '/admin/topics', '/admin/articles'].forEach(p => revalidatePath(p));
    if (slug) revalidatePath(`/articles/${slug}`);
};

// ===== SERVER ACTIONS =====

export const toggleTopicPublished = async (slug: string): Promise<ToggleTopicResponse> => {
    try {
        const collection = await getTopicsCollection();
        const topic = await findTopic(slug);
        if (!topic) return notFound('Topic');

        const newPublished = !topic.published;
        await collection.updateOne({ slug }, { $set: { published: newPublished, updatedAt: new Date() } });
        revalidateTopicPaths(slug);
        
        await logUpdate('topic', topic.title, topic._id?.toString(), { published: newPublished });

        return success(newPublished, newPublished ? 'Topic published' : 'Topic unpublished');
    } catch (err) {
        return handleError(err, 'Failed to update topic');
    }
};

export const toggleTopicFeatured = async (slug: string): Promise<ToggleTopicResponse> => {
    try {
        const collection = await getTopicsCollection();
        const topic = await findTopic(slug);
        if (!topic) return notFound('Topic');

        const newFeatured = !topic.featured;
        await collection.updateOne({ slug }, { $set: { featured: newFeatured, updatedAt: new Date() } });
        revalidateTopicPaths(slug);
        
        await logUpdate('topic', topic.title, topic._id?.toString(), { featured: newFeatured });

        return success(newFeatured, newFeatured ? 'Topic featured' : 'Topic unfeatured');
    } catch (err) {
        return handleError(err, 'Failed to update topic');
    }
};

export const reorderTopics = async (slugs: string[]): Promise<ReorderTopicsResponse> => {
    try {
        if (!Array.isArray(slugs) || slugs.length === 0) return error('Invalid slugs array');

        const collection = await getTopicsCollection();
        await collection.bulkWrite(slugs.map((slug, index) => ({
            updateOne: { filter: { slug }, update: { $set: { order: index, updatedAt: new Date() } } },
        })));

        revalidateTopicPaths();
        
        await logReorder('topic', { count: slugs.length });
        
        return success(undefined, 'Topics reordered successfully');
    } catch (err) {
        return handleError(err, 'Failed to reorder topics');
    }
};
