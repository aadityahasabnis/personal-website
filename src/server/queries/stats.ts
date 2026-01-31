import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IPageStats } from '@/interfaces';

/**
 * Get page stats (views, likes) for a slug
 */
export const getPageStats = async (slug: string): Promise<IPageStats | null> => {
    try {
        const collection = await getCollection<IPageStats>(COLLECTIONS.pageStats);
        return await collection.findOne({ slug });
    } catch (error) {
        console.error(`Failed to fetch stats for: ${slug}`, error);
        return null;
    }
};

/**
 * Increment view count and return new value
 * Uses atomic update for accuracy
 */
export const getAndIncrementViews = async (slug: string): Promise<number> => {
    try {
        const collection = await getCollection<IPageStats>(COLLECTIONS.pageStats);

        const result = await collection.findOneAndUpdate(
            { slug },
            {
                $inc: { views: 1 },
                $set: { lastViewedAt: new Date(), updatedAt: new Date() },
                $setOnInsert: { createdAt: new Date(), likes: 0 },
            },
            {
                upsert: true,
                returnDocument: 'after',
            }
        );

        return result?.views ?? 1;
    } catch (error) {
        console.error(`Failed to increment views for: ${slug}`, error);
        return 0;
    }
};

/**
 * Get most viewed articles
 */
export const getMostViewed = async (limit = 5): Promise<IPageStats[]> => {
    try {
        const collection = await getCollection<IPageStats>(COLLECTIONS.pageStats);

        const stats = await collection
            .find({})
            .sort({ views: -1 })
            .limit(limit)
            .toArray();

        return stats;
    } catch (error) {
        console.error('Failed to fetch most viewed', error);
        return [];
    }
};
