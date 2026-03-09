'use server';

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IArticleStats } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';

/**
 * Like a post - increments like count (one-time, no unlike)
 * Works for all content types (articles, notes) via the unified article_stats collection
 */
export const likePost = async (slug: string): Promise<IApiResponse<number>> => {
    try {
        const collection = await getCollection<IArticleStats>(COLLECTIONS.articleStats);
        const result = await collection.findOneAndUpdate(
            { slug },
            {
                $inc: { likes: 1 },
                $set: { updatedAt: new Date() },
                $setOnInsert: { createdAt: new Date(), views: 0, shares: 0 },
            },
            { upsert: true, returnDocument: 'after' }
        );
        return { success: true, status: 200, data: result?.likes ?? 1 };
    } catch (error) {
        console.error('Failed to like post:', error);
        return { success: false, status: 500, error: 'Failed to save your like. Please try again.' };
    }
};
