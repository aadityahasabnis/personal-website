'use server';

/**
 * Public Page Stats – Server Actions
 *
 * These actions handle view and like tracking for public content pages.
 * They are deliberately separate from the content collection for write-performance
 * isolation — high-frequency writes (views) never contend with content reads.
 *
 * All operations are atomic ($inc / $findOneAndUpdate) and upsert-safe.
 * These should be called from client components or API routes, never from
 * static/ISR page generation (views/likes are dynamic by definition).
 */

import type { IApiResponse } from '@/interfaces/actionHelper';
import {
    decrementLikes as _decrementLikes,
    incrementLikes as _incrementLikes,
    incrementViews as _incrementViews,
    getStats,
    handleError,
    ok,
} from '../../utils';

// ============================================================
// Types
// ============================================================

export interface PageStatsData {
    views: number;
    likes: number;
}

// ============================================================
// Queries
// ============================================================

/**
 * Get current view and like counts for a content page.
 * Returns { views: 0, likes: 0 } if no stats document exists yet.
 */
export async function getPageStats(
    slug: string,
): Promise<IApiResponse<PageStatsData>> {
    try {
        if (!slug) {
            return { success: false, status: 400, error: 'Slug is required' };
        }
        const stats = await getStats(slug);
        return ok(stats);
    } catch (err) {
        return handleError(err, 'Failed to get page stats');
    }
}

/**
 * Get stats for multiple slugs in a single call.
 * Useful for list pages that show view counts on cards.
 */
export async function getBatchPageStats(
    slugs: string[],
): Promise<IApiResponse<Record<string, PageStatsData>>> {
    try {
        if (!slugs.length) {
            return ok({});
        }

        const results = await Promise.all(
            slugs.map(async (slug) => {
                const stats = await getStats(slug);
                return [slug, stats] as const;
            }),
        );

        const statsMap: Record<string, PageStatsData> = {};
        for (const [slug, stats] of results) {
            statsMap[slug] = stats;
        }

        return ok(statsMap);
    } catch (err) {
        return handleError(err, 'Failed to get batch page stats');
    }
}

// ============================================================
// Mutations
// ============================================================

/**
 * Record a page view for a content page.
 *
 * Creates the stats document if it doesn't exist (upsert).
 * Returns the updated stats after incrementing.
 *
 * NOTE: For production, consider adding session/IP-based deduplication
 * via Redis or a short-TTL set to avoid inflating counts on refresh.
 */
export async function recordView(
    slug: string,
): Promise<IApiResponse<PageStatsData>> {
    try {
        if (!slug) {
            return { success: false, status: 400, error: 'Slug is required' };
        }

        const result = await _incrementViews(slug);
        return ok({
            views: result?.views ?? 1,
            likes: result?.likes ?? 0,
        });
    } catch (err) {
        return handleError(err, 'Failed to record view');
    }
}

/**
 * Record a like for a content page.
 *
 * Creates the stats document if it doesn't exist (upsert).
 * Returns the updated stats after incrementing.
 *
 * NOTE: For production, add per-user or per-session like limits.
 */
export async function recordLike(
    slug: string,
): Promise<IApiResponse<PageStatsData>> {
    try {
        if (!slug) {
            return { success: false, status: 400, error: 'Slug is required' };
        }

        const result = await _incrementLikes(slug);
        return ok({
            views: result?.views ?? 0,
            likes: result?.likes ?? 1,
        });
    } catch (err) {
        return handleError(err, 'Failed to record like');
    }
}

/**
 * Remove a like from a content page.
 *
 * Will not go below 0 (the helper uses a $gt: 0 guard).
 * Returns the updated stats, or current stats if already at 0.
 */
export async function removeLike(
    slug: string,
): Promise<IApiResponse<PageStatsData>> {
    try {
        if (!slug) {
            return { success: false, status: 400, error: 'Slug is required' };
        }

        const result = await _decrementLikes(slug);

        // If result is null, likes was already 0 — return current stats
        if (!result) {
            const stats = await getStats(slug);
            return ok(stats);
        }

        return ok({
            views: result.views ?? 0,
            likes: result.likes ?? 0,
        });
    } catch (err) {
        return handleError(err, 'Failed to remove like');
    }
}
