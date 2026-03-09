import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IArticleStats, IComment } from '@/interfaces/schema';

/**
 * Get stats (views, likes) for any content slug
 * Unified across articles and notes via the article_stats collection
 */
export const getArticleStats = async (slug: string): Promise<IArticleStats | null> => {
    try {
        const collection = await getCollection<IArticleStats>(COLLECTIONS.articleStats);
        return await collection.findOne({ slug });
    } catch (error) {
        console.error(`Failed to fetch stats for: ${slug}`, error);
        return null;
    }
};

/**
 * Increment view count atomically and return new value
 */
export const getAndIncrementArticleViews = async (slug: string): Promise<number> => {
    try {
        const collection = await getCollection<IArticleStats>(COLLECTIONS.articleStats);

        const result = await collection.findOneAndUpdate(
            { slug },
            {
                $inc: { views: 1 },
                $set: { lastViewedAt: new Date(), updatedAt: new Date() },
                $setOnInsert: { createdAt: new Date(), likes: 0, shares: 0 },
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
 * Get approved comment count for a content slug
 */
export const getArticleCommentCount = async (slug: string): Promise<number> => {
    try {
        const collection = await getCollection<IComment>(COLLECTIONS.comments);
        return await collection.countDocuments({ articleSlug: slug, approved: true });
    } catch (error) {
        console.error(`Failed to get comment count for: ${slug}`, error);
        return 0;
    }
};

/**
 * Get most viewed content across all types
 */
export const getMostViewed = async (limit = 5): Promise<IArticleStats[]> => {
    try {
        const collection = await getCollection<IArticleStats>(COLLECTIONS.articleStats);

        return await collection
            .find({})
            .sort({ views: -1 })
            .limit(limit)
            .toArray();
    } catch (error) {
        console.error('Failed to fetch most viewed', error);
        return [];
    }
};
