'use server';

/**
 * Publish / Unpublish Article – Admin Server Actions
 *
 * Uses Mongoose document finders + instance methods for publish/unpublish/schedule.
 * Uses Content model directly for toggle/featured/reorder operations.
 */

import type { IApiResponse } from '@/interfaces/IApiResponse';
import {
    ensureConnection,
    Content,
    findArticle,
    findArticleDoc,
    notFoundError,
    okVoid,
    ok,
    handleError,
    updateContentCounts,
    revalidateContentPaths,
} from '../../../utils';

// ============================================================
// Publish
// ============================================================

export async function publishArticle(
    topicSlug: string,
    slug: string,
): Promise<IApiResponse<void>> {
    try {
        const article = await findArticle(topicSlug, slug);
        if (!article) return notFoundError('Article');

        if (article.published) {
            return okVoid('Article is already published');
        }

        // Use document finder + instance method
        const doc = await findArticleDoc(topicSlug, slug);
        if (!doc) return notFoundError('Article');
        await doc.publish();

        // Increment denormalized counts
        await updateContentCounts(topicSlug, article.subtopicSlug, 1);

        revalidateContentPaths('article', slug, topicSlug);

        return okVoid('Article published successfully');
    } catch (err) {
        return handleError(err, 'Failed to publish article');
    }
}

// ============================================================
// Unpublish
// ============================================================

export async function unpublishArticle(
    topicSlug: string,
    slug: string,
): Promise<IApiResponse<void>> {
    try {
        const article = await findArticle(topicSlug, slug);
        if (!article) return notFoundError('Article');

        if (!article.published) {
            return okVoid('Article is already unpublished');
        }

        // Use document finder + instance method
        const doc = await findArticleDoc(topicSlug, slug);
        if (!doc) return notFoundError('Article');
        await doc.unpublish();

        // Decrement denormalized counts
        await updateContentCounts(topicSlug, article.subtopicSlug, -1);

        revalidateContentPaths('article', slug, topicSlug);

        return okVoid('Article unpublished successfully');
    } catch (err) {
        return handleError(err, 'Failed to unpublish article');
    }
}

// ============================================================
// Toggle Published
// ============================================================

export async function toggleArticlePublished(
    topicSlug: string,
    slug: string,
): Promise<IApiResponse<boolean>> {
    try {
        const article = await findArticle(topicSlug, slug);
        if (!article) return notFoundError('Article');

        if (article.published) {
            await unpublishArticle(topicSlug, slug);
            return ok(false, 'Article unpublished');
        } else {
            await publishArticle(topicSlug, slug);
            return ok(true, 'Article published');
        }
    } catch (err) {
        return handleError(err, 'Failed to toggle article published status');
    }
}

// ============================================================
// Toggle Featured
// ============================================================

export async function toggleArticleFeatured(
    topicSlug: string,
    slug: string,
): Promise<IApiResponse<boolean>> {
    try {
        await ensureConnection();
        const article = await findArticle(topicSlug, slug);
        if (!article) return notFoundError('Article');

        const newFeatured = !article.featured;
        await Content.updateOne(
            { type: 'article', topicSlug, slug },
            { $set: { featured: newFeatured, updatedAt: new Date() } },
        );

        revalidateContentPaths('article', slug, topicSlug);

        return ok(newFeatured, newFeatured ? 'Article featured' : 'Article unfeatured');
    } catch (err) {
        return handleError(err, 'Failed to toggle article featured status');
    }
}

// ============================================================
// Schedule
// ============================================================

export async function scheduleArticle(
    topicSlug: string,
    slug: string,
    scheduledAt: Date,
): Promise<IApiResponse<void>> {
    try {
        const doc = await findArticleDoc(topicSlug, slug);
        if (!doc) return notFoundError('Article');

        await doc.schedule(scheduledAt);

        revalidateContentPaths('article', slug, topicSlug);

        return okVoid('Article scheduled successfully');
    } catch (err) {
        return handleError(err, 'Failed to schedule article');
    }
}

// ============================================================
// Reorder
// ============================================================

export async function reorderArticles(
    topicSlug: string,
    subtopicSlug: string | null,
    slugs: string[],
): Promise<IApiResponse<void>> {
    try {
        if (!slugs.length) return okVoid('Nothing to reorder');

        await ensureConnection();

        const ops = slugs.map((s, index) => ({
            updateOne: {
                filter: { type: 'article' as const, topicSlug, slug: s },
                update: { $set: { order: index, updatedAt: new Date() } },
            },
        }));

        await Content.bulkWrite(ops);

        revalidateContentPaths('article', undefined, topicSlug);

        return okVoid('Articles reordered successfully');
    } catch (err) {
        return handleError(err, 'Failed to reorder articles');
    }
}
