'use server';

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IPageStats, IApiResponse } from '@/interfaces';

/**
 * Like a post - increments like count
 */
export const likePost = async (slug: string): Promise<IApiResponse<number>> => {
    try {
        const collection = await getCollection<IPageStats>(COLLECTIONS.pageStats);

        const result = await collection.findOneAndUpdate(
            { slug },
            {
                $inc: { likes: 1 },
                $set: { updatedAt: new Date() },
                $setOnInsert: { createdAt: new Date(), views: 0 },
            },
            {
                upsert: true,
                returnDocument: 'after',
            }
        );

        return {
            success: true,
            status: 200,
            data: result?.likes ?? 1,
        };
    } catch (error) {
        console.error('Failed to like post:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to save your like. Please try again.',
        };
    }
};
