'use server';

import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import Content from '@/server/models/Content';
import PageStats from '@/server/models/PageStats';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { error, handleError, success } from '../../../utils/helper';
import { getAdminId, revalidateArticlePaths } from '../../shared';

interface IArticleDeleteBase {
    _id: ObjectId;
    topicId: ObjectId;
    subtopicId: ObjectId | null;
    publishStatus: PublishStatusType;
}

const isPublishedArticle = (article: IArticleDeleteBase): boolean => {
    return article.publishStatus === PUBLISH_STATUS.PUBLISHED;
};

// ========================================================
// Delete
// ========================================================

export const deleteArticle = async (articleId: string): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!ObjectId.isValid(articleId)) return error('Invalid article id', 400);

        await connectDB();

        const article = await Content.findOne({
            type: 'article',
            _id: articleId,
        }).select('_id slug topicId subtopicId publishStatus').lean<(IArticleDeleteBase & { slug: string }) | null>();

        if (!article) return error('Article not found', 404);

        const topic = await Topic.findById(article.topicId).select('slug').lean();

        const txnSession = await mongoose.startSession();
        try {
            await txnSession.withTransaction(async () => {
                await Promise.all([
                    Content.deleteOne({ _id: article._id }, { session: txnSession }),
                    PageStats.deleteOne({ contentId: article._id as ObjectId }, { session: txnSession }),
                    Comment.deleteMany({ contentId: article._id as ObjectId }, { session: txnSession }),
                ]);

                if (isPublishedArticle(article)) {
                    await Promise.all([
                        Topic.updateOne({ _id: article.topicId }, { $inc: { contentCount: -1 } }, { session: txnSession }),
                        article.subtopicId
                            ? Subtopic.updateOne({ _id: article.subtopicId }, { $inc: { contentCount: -1 } }, { session: txnSession })
                            : Promise.resolve(),
                    ]);
                }
            });
        } finally {
            await txnSession.endSession();
        }

        revalidateArticlePaths(topic?.slug, article.slug);
        return success(true, 'Article deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete article');
    }
};

/*
API Responses:
- 200: Article deleted successfully.
- 400: Invalid article id.
- 404: Article not found.
- 500: Unexpected server/database error.
*/
