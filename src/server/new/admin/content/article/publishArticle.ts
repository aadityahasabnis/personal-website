'use server';

import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { error, handleError, success, updatedNow } from '../../../utils/helper';
import { revalidateArticlePaths } from '../../shared';

interface IArticlePublishBase {
    _id: ObjectId;
    slug: string;
    topicId: ObjectId;
    subtopicId: ObjectId | null;
    publishStatus: PublishStatusType;
}

const isPublishedArticle = (article: IArticlePublishBase): boolean => article.publishStatus === PUBLISH_STATUS.PUBLISHED;

// ========================================================
// Status Change
// ========================================================

export const changeArticlePublishStatus = async (
    articleId: string,
    nextStatus: PublishStatusType,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(articleId)) return error('Invalid article id', 400);
        if (!Object.values(PUBLISH_STATUS).includes(nextStatus)) return error('Invalid publish status', 400);

        await connectDB();

        const article = await Content.findOne({
            type: 'article',
            _id: articleId,
        }).select('_id slug topicId subtopicId publishStatus').lean<IArticlePublishBase | null>();

        if (!article) return error('Article not found', 404);
        if (article.publishStatus === nextStatus) {
            return success(true, `Article already ${nextStatus}`);
        }

        const topic = await Topic.findById(article.topicId).select('slug').lean();
        const wasPublished = isPublishedArticle(article);
        const willBePublished = nextStatus === PUBLISH_STATUS.PUBLISHED;
        const nextPublishedAt = !wasPublished && willBePublished
            ? new Date()
            : wasPublished && !willBePublished
                ? null
                : undefined;

        const txnSession = await mongoose.startSession();
        try {
            await txnSession.withTransaction(async () => {
                await Content.updateOne(
                    { _id: article._id },
                    {
                        $set: {
                            publishStatus: nextStatus,
                            publishedAt: nextPublishedAt,
                            ...updatedNow(),
                        },
                    },
                    { session: txnSession }
                );

                if (wasPublished !== willBePublished) {
                    const delta = willBePublished ? 1 : -1;
                    await Promise.all([
                        Topic.updateOne({ _id: article.topicId }, { $inc: { contentCount: delta } }, { session: txnSession }),
                        article.subtopicId
                            ? Subtopic.updateOne({ _id: article.subtopicId }, { $inc: { contentCount: delta } }, { session: txnSession })
                            : Promise.resolve(),
                    ]);
                }
            });
        } finally {
            await txnSession.endSession();
        }

        revalidateArticlePaths(topic?.slug, article.slug);
        return success(true, `Article status changed to ${nextStatus}`);
    } catch (err) {
        return handleError(err, 'Failed to change article status');
    }
};

export const setArticlePublished = async (articleId: string): Promise<IApiResponse<boolean>> => {
    return changeArticlePublishStatus(articleId, PUBLISH_STATUS.PUBLISHED);
};

export const setArticleDraft = async (articleId: string): Promise<IApiResponse<boolean>> => {
    return changeArticlePublishStatus(articleId, PUBLISH_STATUS.DRAFT);
};

export const setArticleArchived = async (articleId: string): Promise<IApiResponse<boolean>> => {
    return changeArticlePublishStatus(articleId, PUBLISH_STATUS.ARCHIVED);
};

/*
API Responses:
- changeArticlePublishStatus/setArticlePublished/setArticleDraft/setArticleArchived
    - 200: Action completed successfully.
    - 400: Invalid article id.
    - 404: Article not found.
    - 500: Unexpected server/database error.
*/
