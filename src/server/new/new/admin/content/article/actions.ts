'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import Topic from '@/server/models/Topic';
import { error, handleError, success, updatedNow } from '../../../../utils/helper';
import { revalidateArticlePaths } from '../../shared';
import { deleteArticle } from './deleteArticle';
import { publishArticle, unpublishArticle } from './publishArticle';

// ========================================================
// Quick Actions
// ========================================================

export const toggleArticlePublished = async (
    topicSlug: string,
    articleSlug: string,
): Promise<IApiResponse<boolean>> => {
    await connectDB();
    const topic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
    if (!topic) return error('Topic not found', 404);

    const article = await Content.findOne({ type: 'article', topicId: topic._id, slug: articleSlug }).select('published').lean();
    if (!article) return error('Article not found', 404);

    return article.published
        ? unpublishArticle(topicSlug, articleSlug)
        : publishArticle(topicSlug, articleSlug);
};

export const toggleArticleFeatured = async (
    topicSlug: string,
    articleSlug: string,
): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();
        const topic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        const article = await Content.findOne({ type: 'article', topicId: topic._id, slug: articleSlug }).select('_id featured').lean();
        if (!article) return error('Article not found', 404);

        const featured = !article.featured;
        await Content.updateOne({ _id: article._id }, { $set: { featured, ...updatedNow() } });
        revalidateArticlePaths(topicSlug, articleSlug);

        return success(featured, featured ? 'Article featured' : 'Article unfeatured');
    } catch (err) {
        return handleError(err, 'Failed to toggle article featured');
    }
};

// ========================================================
// Bulk Actions
// ========================================================

export const bulkDeleteArticles = async (
    items: Array<{ topicSlug: string; articleSlug: string }>,
): Promise<IApiResponse<boolean>> => {
    try {
        for (const item of items) {
            const result = await deleteArticle(item.topicSlug, item.articleSlug);
            if (!result.success) return result;
        }
        return success(true, 'Articles deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk delete articles');
    }
};

export const bulkPublishArticles = async (
    items: Array<{ topicSlug: string; articleSlug: string }>,
): Promise<IApiResponse<boolean>> => {
    try {
        for (const item of items) {
            const result = await publishArticle(item.topicSlug, item.articleSlug);
            if (!result.success) return result;
        }
        return success(true, 'Articles published successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk publish articles');
    }
};

export const bulkUnpublishArticles = async (
    items: Array<{ topicSlug: string; articleSlug: string }>,
): Promise<IApiResponse<boolean>> => {
    try {
        for (const item of items) {
            const result = await unpublishArticle(item.topicSlug, item.articleSlug);
            if (!result.success) return result;
        }
        return success(true, 'Articles unpublished successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk unpublish articles');
    }
};
