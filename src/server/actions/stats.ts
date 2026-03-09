'use server';

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IArticleStats } from '@/interfaces/schema';

// ===== TYPES =====

export interface IContentStats {
    views: number;
    likes: number;
}

// ===== ACTIONS =====

/**
 * Increment view count server-side — call via next/server after()
 * Uses atomic upsert so the document is created on first view
 */
export const incrementViews = async (slug: string): Promise<void> => {
    try {
        const collection = await getCollection<IArticleStats>(COLLECTIONS.articleStats);
        await collection.updateOne(
            { slug },
            {
                $inc: { views: 1 },
                $set: { lastViewedAt: new Date(), updatedAt: new Date() },
                $setOnInsert: { createdAt: new Date(), likes: 0, shares: 0 },
            },
            { upsert: true }
        );
    } catch (error) {
        console.error(`Failed to increment views for: ${slug}`, error);
    }
};

/**
 * Get current stats (views + likes) for a content slug
 * Callable directly from TanStack Query queryFn — no API route needed
 */
export const getContentStats = async (slug: string): Promise<IContentStats> => {
    try {
        const collection = await getCollection<IArticleStats>(COLLECTIONS.articleStats);
        const stats = await collection.findOne({ slug });
        return {
            views: stats?.views ?? 0,
            likes: stats?.likes ?? 0,
        };
    } catch (error) {
        console.error(`Failed to fetch stats for: ${slug}`, error);
        return { views: 0, likes: 0 };
    }
};

/**
 * Get stats for multiple slugs in a single query
 */
export const getBulkContentStats = async (slugs: string[]): Promise<Map<string, IContentStats>> => {
    const result = new Map<string, IContentStats>();
    if (slugs.length === 0) return result;

    try {
        const collection = await getCollection<IArticleStats>(COLLECTIONS.articleStats);
        const stats = await collection.find({ slug: { $in: slugs } }).toArray();
        
        for (const stat of stats) {
            result.set(stat.slug, { views: stat.views ?? 0, likes: stat.likes ?? 0 });
        }
        // Fill in missing slugs with zeros
        for (const slug of slugs) {
            if (!result.has(slug)) result.set(slug, { views: 0, likes: 0 });
        }
    } catch (error) {
        console.error('Failed to fetch bulk stats', error);
        for (const slug of slugs) result.set(slug, { views: 0, likes: 0 });
    }
    return result;
};
