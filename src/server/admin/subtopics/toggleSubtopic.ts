'use server';

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ISubtopic } from '@/interfaces';
import type { ActionResponse } from '../utils';
import { success, notFound, error, handleError, logUpdate, logReorder } from '../utils';

// ===== RESPONSE TYPES =====

export interface ToggleSubtopicResponse extends ActionResponse<boolean> {}
export interface ReorderSubtopicsResponse extends ActionResponse<void> {}

// ===== HELPERS =====

const getSubtopicsCollection = () => getCollection<ISubtopic>(COLLECTIONS.subtopics);
const findSubtopic = async (topicSlug: string, slug: string) => 
    (await getSubtopicsCollection()).findOne({ topicSlug, slug });

const revalidateSubtopicPaths = (topicSlug: string): void => {
    ['/admin/subtopics', '/admin/articles', `/articles/${topicSlug}`].forEach(p => revalidatePath(p));
};

// ===== SERVER ACTIONS =====

export const toggleSubtopicPublished = async (topicSlug: string, slug: string): Promise<ToggleSubtopicResponse> => {
    try {
        const collection = await getSubtopicsCollection();
        const subtopic = await findSubtopic(topicSlug, slug);
        if (!subtopic) return notFound('Subtopic');

        const newPublished = !subtopic.published;
        await collection.updateOne({ topicSlug, slug }, { $set: { published: newPublished, updatedAt: new Date() } });
        revalidateSubtopicPaths(topicSlug);
        
        await logUpdate('subtopic', subtopic.title, subtopic._id?.toString(), { published: newPublished });

        return success(newPublished, newPublished ? 'Subtopic published' : 'Subtopic unpublished');
    } catch (err) {
        return handleError(err, 'Failed to update subtopic');
    }
};

export const reorderSubtopics = async (topicSlug: string, slugs: string[]): Promise<ReorderSubtopicsResponse> => {
    try {
        if (!Array.isArray(slugs) || slugs.length === 0) return error('Invalid slugs array');

        const collection = await getSubtopicsCollection();
        await collection.bulkWrite(slugs.map((slug, index) => ({
            updateOne: { filter: { topicSlug, slug }, update: { $set: { order: index, updatedAt: new Date() } } },
        })));

        revalidateSubtopicPaths(topicSlug);
        
        await logReorder('subtopic', { topicSlug, count: slugs.length });
        
        return success(undefined, 'Subtopics reordered successfully');
    } catch (err) {
        return handleError(err, 'Failed to reorder subtopics');
    }
};
