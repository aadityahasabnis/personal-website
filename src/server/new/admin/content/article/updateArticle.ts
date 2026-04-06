'use server';

import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import { calculateReadingTime } from '@/lib/utils';
import Content from '@/server/models/Content';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { cleanUndefined, error, handleError, success, updatedNow } from '../../../utils/helper';
import { buildSeo, getAdminId, revalidateArticlePaths } from '../../shared';
import { isDuplicateSlugError } from '../helpers';
import type { IArticleUpdateInput } from './types';

interface IArticleUpdateBase {
    _id: ObjectId;
    slug: string;
    topicId: ObjectId;
    subtopicId: ObjectId | null;
    publishStatus: PublishStatusType;
    publishedAt: Date | null;
}

const isPublishedArticle = (article: IArticleUpdateBase): boolean => {
    return article.publishStatus === PUBLISH_STATUS.PUBLISHED;
};

// ========================================================
// Update
// ========================================================

export const updateArticle = async (
    articleId: string,
    input: IArticleUpdateInput,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(articleId)) return error('Invalid article id', 400);
        if (typeof input.topicId === 'string' && !ObjectId.isValid(input.topicId)) return error('Invalid topic id', 400);
        if (typeof input.subtopicId === 'string' && !ObjectId.isValid(input.subtopicId)) return error('Invalid subtopic id', 400);

        await connectDB();

        const admin = await getAdminId();
        if (!admin.success) return admin;

        const article = await Content.findOne({
            type: 'article',
            _id: articleId,
        }).select('_id slug topicId subtopicId publishStatus publishedAt').lean<IArticleUpdateBase | null>();

        if (!article) return error('Article not found', 404);

        const currentTopic = await Topic.findById(article.topicId).select('_id slug').lean();
        if (!currentTopic) return error('Topic not found', 404);

        const targetTopic = input.topicId && input.topicId !== article.topicId.toString()
            ? await Topic.findById(input.topicId).select('_id slug').lean()
            : currentTopic;

        if (!targetTopic) return error('Target topic not found', 404);

        const topicChanged = targetTopic._id.toString() !== article.topicId.toString();
        let targetSubtopicId = topicChanged ? null : (article.subtopicId ?? null);

        if (input.subtopicId === null) targetSubtopicId = null;
        if (typeof input.subtopicId === 'string') {
            const targetSubtopic = await Subtopic.findOne({
                topicId: targetTopic._id,
                _id: input.subtopicId,
            }).select('_id').lean();

            if (!targetSubtopic) return error('Target subtopic not found', 404);
            targetSubtopicId = targetSubtopic._id;
        }

        if (input.slug && input.slug !== article.slug) {
            const conflict = await Content.findOne({ type: 'article', slug: input.slug }).select('_id').lean();
            if (conflict && conflict._id.toString() !== article._id.toString()) {
                return error('Article with this slug already exists', 409);
            }
        }

        const currentPublished = isPublishedArticle(article);
        const nextPublishStatus: PublishStatusType = input.publishStatus ?? article.publishStatus;
        const nextPublished = nextPublishStatus === PUBLISH_STATUS.PUBLISHED;
        const subtopicChanged = String(targetSubtopicId ?? '') !== String(article.subtopicId ?? '');
        const nextPublishedAt = !currentPublished && nextPublished
            ? new Date()
            : currentPublished && !nextPublished
                ? null
                : undefined;

        const txnSession = await mongoose.startSession();
        try {
            await txnSession.withTransaction(async () => {
                await Content.updateOne(
                    { _id: article._id },
                    {
                        $set: cleanUndefined({
                            slug: input.slug,
                            title: input.title,
                            description: input.description,
                            body: input.body,
                            tags: input.tags,
                            coverImage: input.coverImage,
                            readingTime: input.body ? calculateReadingTime(input.body) : input.readingTime,
                            featured: input.featured,
                            seo: input.seo ? buildSeo(input.seo) : undefined,
                            topicId: targetTopic._id,
                            subtopicId: targetSubtopicId,
                            publishStatus: nextPublishStatus,
                            publishedAt: nextPublishedAt,
                            updatedBy: admin.data,
                            ...updatedNow(),
                        }),
                    },
                    { session: txnSession }
                );

                if (currentPublished !== nextPublished || topicChanged || subtopicChanged) {
                    if (currentPublished) {
                        await Promise.all([
                            Topic.updateOne({ _id: article.topicId }, { $inc: { contentCount: -1 } }, { session: txnSession }),
                            article.subtopicId
                                ? Subtopic.updateOne({ _id: article.subtopicId }, { $inc: { contentCount: -1 } }, { session: txnSession })
                                : Promise.resolve(),
                        ]);
                    }
                    if (nextPublished) {
                        await Promise.all([
                            Topic.updateOne({ _id: targetTopic._id }, { $inc: { contentCount: 1 } }, { session: txnSession }),
                            targetSubtopicId
                                ? Subtopic.updateOne({ _id: targetSubtopicId }, { $inc: { contentCount: 1 } }, { session: txnSession })
                                : Promise.resolve(),
                        ]);
                    }
                }
            });
        } finally {
            await txnSession.endSession();
        }

        revalidateArticlePaths(currentTopic.slug, article.slug);
        revalidateArticlePaths(targetTopic.slug, input.slug ?? article.slug);

        return success(true, 'Article updated successfully');
    } catch (err) {
        if (isDuplicateSlugError(err)) return error('Article with this slug already exists', 409);
        return handleError(err, 'Failed to update article');
    }
};

/*
API Responses:
- 200: Article updated successfully.
- 400: Invalid article/topic/subtopic id.
- 404: Article, current topic, target topic, or target subtopic not found.
- 409: Article slug conflict.
- 500: Unexpected server/database error.
*/
