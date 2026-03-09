'use server';

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ITopic } from '@/interfaces/schema';
import type { ActionResponse } from '../utils';
import { handleError } from '../utils';

// ===== RESPONSE TYPE =====

export interface UpdateTopicCountResponse extends ActionResponse<void> {}

// ===== SERVER ACTION =====

export const updateTopicArticleCount = async (slug: string, delta: number): Promise<UpdateTopicCountResponse> => {
    try {
        const collection = await getCollection<ITopic>(COLLECTIONS.topics);
        await collection.updateOne(
            { slug },
            { $inc: { 'metadata.articleCount': delta }, $set: { 'metadata.lastUpdated': new Date(), updatedAt: new Date() } }
        );
        return { success: true };
    } catch (err) {
        return handleError(err, 'Failed to update article count');
    }
};
