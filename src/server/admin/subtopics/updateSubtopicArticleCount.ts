'use server';

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ISubtopic } from '@/interfaces/schema';
import type { ActionResponse } from '../utils';
import { handleError } from '../utils';

// ===== RESPONSE TYPE =====

export interface UpdateSubtopicCountResponse extends ActionResponse<void> {}

// ===== SERVER ACTION =====

export const updateSubtopicArticleCount = async (topicSlug: string, slug: string, delta: number): Promise<UpdateSubtopicCountResponse> => {
    try {
        const collection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);
        await collection.updateOne(
            { topicSlug, slug },
            { $inc: { 'metadata.articleCount': delta }, $set: { updatedAt: new Date() } }
        );
        return { success: true };
    } catch (err) {
        return handleError(err, 'Failed to update article count');
    }
};
