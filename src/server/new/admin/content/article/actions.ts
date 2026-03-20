'use server';

import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, success, updatedNow } from '../../../utils/helper';
import { revalidateArticlePaths } from '../../shared';
import { deleteArticle } from './deleteArticle';
import { changeArticlePublishStatus } from './publishArticle';

interface IArticleActionBase {
    _id: ObjectId;
    slug: string;
    topicId: ObjectId;
    publishStatus: PublishStatusType;
    featured: boolean;
}

// ========================================================
// Quick Actions
// ========================================================

export const setArticleStatus = async (
    articleId: string,
    status: PublishStatusType,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(articleId)) return error('Invalid article id', 400);
        if (!Object.values(PUBLISH_STATUS).includes(status)) return error('Invalid publish status', 400);
        return changeArticlePublishStatus(articleId, status);
    } catch (err) {
        return handleError(err, 'Failed to set article status');
    }
};

export const toggleArticleFeatured = async (
    articleId: string,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(articleId)) return error('Invalid article id', 400);

        await connectDB();

        const article = await Content.findOne({ type: 'article', _id: articleId })
            .select('featured')
            .lean<Pick<IArticleActionBase, 'featured'> | null>();

        if (!article) return error('Article not found', 404);
        return setArticleFeatured(articleId, !article.featured);
    } catch (err) {
        return handleError(err, 'Failed to toggle article featured');
    }
};

export const setArticleFeatured = async (
    articleId: string,
    featured: boolean,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(articleId)) return error('Invalid article id', 400);

        await connectDB();

        const article = await Content.findOne({ type: 'article', _id: articleId })
            .select('_id topicId slug featured')
            .lean<Pick<IArticleActionBase, '_id' | 'topicId' | 'slug' | 'featured'> | null>();
        if (!article) return error('Article not found', 404);

        const topic = await Topic.findById(article.topicId).select('slug').lean();

        if (article.featured === featured) {
            return success(featured, featured ? 'Article already featured' : 'Article already unfeatured');
        }

        await Content.updateOne({ _id: article._id }, { $set: { featured, ...updatedNow() } });
        revalidateArticlePaths(topic?.slug, article.slug);

        return success(featured, featured ? 'Article featured' : 'Article unfeatured');
    } catch (err) {
        return handleError(err, 'Failed to set article featured state');
    }
};

// ========================================================
// Bulk Actions
// ========================================================

export const bulkDeleteArticles = async (
    articleIds: string[],
): Promise<IApiResponse<boolean>> => {
    try {
        if (!articleIds.every((id) => ObjectId.isValid(id))) return error('One or more article ids are invalid', 400);

        for (const articleId of articleIds) {
            const result = await deleteArticle(articleId);
            if (!result.success) return result;
        }
        return success(true, 'Articles deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk delete articles');
    }
};

export const bulkPublishArticles = async (
    articleIds: string[],
): Promise<IApiResponse<boolean>> => {
    return bulkSetArticleStatus(articleIds, PUBLISH_STATUS.PUBLISHED);
};

export const bulkSetArticleStatus = async (
    articleIds: string[],
    status: PublishStatusType,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!articleIds.every((id) => ObjectId.isValid(id))) return error('One or more article ids are invalid', 400);
        if (!Object.values(PUBLISH_STATUS).includes(status)) return error('Invalid publish status', 400);

        for (const articleId of articleIds) {
            const result = await changeArticlePublishStatus(articleId, status);
            if (!result.success) return result;
        }
        return success(true, `Articles status changed to ${status}`);
    } catch (err) {
        return handleError(err, 'Failed to bulk set article status');
    }
};

export const bulkArchiveArticles = async (
    articleIds: string[],
): Promise<IApiResponse<boolean>> => {
    return bulkSetArticleStatus(articleIds, PUBLISH_STATUS.ARCHIVED);
};

export const bulkDraftArticles = async (
    articleIds: string[],
): Promise<IApiResponse<boolean>> => {
    return bulkSetArticleStatus(articleIds, PUBLISH_STATUS.DRAFT);
};

/*
API Responses:
- setArticleStatus/setArticleFeatured/toggleArticleFeatured
    - 200: Action completed successfully.
    - 400: Invalid article id.
    - 404: Article not found.
    - 500: Unexpected server/database error.
- bulkDeleteArticles/bulkSetArticleStatus/bulkPublishArticles/bulkArchiveArticles/bulkDraftArticles
    - 200: Bulk action completed successfully.
    - 400: One or more article ids are invalid.
    - 404: Any requested article not found.
    - 500: Unexpected server/database error.
*/
