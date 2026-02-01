import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IPageStats, IArticleStats, IComment } from '@/interfaces';

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

// ===== ARTICLE STATS (for topic-based articles) =====

/**
 * Get article stats for a topic-based article slug
 * @param slug - Full path slug like "dsa/logic-building-problems"
 */
export const getArticleStats = async (slug: string): Promise<IArticleStats | null> => {
    try {
        const collection = await getCollection<IArticleStats>(COLLECTIONS.articleStats);
        return await collection.findOne({ slug });
    } catch (error) {
        console.error(`Failed to fetch article stats for: ${slug}`, error);
        return null;
    }
};

/**
 * Increment article view count and return new value
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
        console.error(`Failed to increment article views for: ${slug}`, error);
        return 0;
    }
};

/**
 * Get comment count for an article
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
