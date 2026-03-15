'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, success, updatedNow } from '../../../../utils/helper';
import { revalidateArticlePaths } from '../../shared';

interface IArticlePublishBase {
    _id: ObjectId;
    topicId: ObjectId;
    subtopicId: ObjectId | null;
    published: boolean;
}

// ========================================================
// Publish
// ========================================================

export const publishArticle = async (topicSlug: string, articleSlug: string): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();

        const topic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        const article = await Content.findOne({
            type: 'article',
            slug: articleSlug,
            topicId: topic._id,
        }).select('_id topicId subtopicId published').lean<IArticlePublishBase | null>();

        if (!article) return error('Article not found', 404);
        if (article.published) return success(true, 'Article already published');

        await Promise.all([
            Content.updateOne(
                { _id: article._id },
                { $set: { published: true, publishedAt: new Date(), scheduledAt: null, ...updatedNow() } }
            ),
            Topic.updateOne({ _id: article.topicId }, { $inc: { contentCount: 1 } }),
            article.subtopicId ? Subtopic.updateOne({ _id: article.subtopicId }, { $inc: { contentCount: 1 } }) : Promise.resolve(),
        ]);

        revalidateArticlePaths(topicSlug, articleSlug);
        return success(true, 'Article published successfully');
    } catch (err) {
        return handleError(err, 'Failed to publish article');
    }
};

export const unpublishArticle = async (topicSlug: string, articleSlug: string): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();

        const topic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        const article = await Content.findOne({
            type: 'article',
            slug: articleSlug,
            topicId: topic._id,
        }).select('_id topicId subtopicId published').lean<IArticlePublishBase | null>();

        if (!article) return error('Article not found', 404);
        if (!article.published) return success(true, 'Article already unpublished');

        await Promise.all([
            Content.updateOne(
                { _id: article._id },
                { $set: { published: false, publishedAt: null, ...updatedNow() } }
            ),
            Topic.updateOne({ _id: article.topicId }, { $inc: { contentCount: -1 } }),
            article.subtopicId ? Subtopic.updateOne({ _id: article.subtopicId }, { $inc: { contentCount: -1 } }) : Promise.resolve(),
        ]);

        revalidateArticlePaths(topicSlug, articleSlug);
        return success(true, 'Article unpublished successfully');
    } catch (err) {
        return handleError(err, 'Failed to unpublish article');
    }
};

export const scheduleArticle = async (
    topicSlug: string,
    articleSlug: string,
    scheduledAt: Date,
): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();

        const topic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        const article = await Content.findOne({
            type: 'article',
            slug: articleSlug,
            topicId: topic._id,
        }).select('_id topicId subtopicId published').lean<IArticlePublishBase | null>();

        if (!article) return error('Article not found', 404);

        await Content.updateOne(
            { _id: article._id },
            {
                $set: {
                    published: false,
                    publishedAt: null,
                    scheduledAt,
                    ...updatedNow(),
                },
            }
        );

        if (article.published) {
            await Promise.all([
                Topic.updateOne({ _id: article.topicId }, { $inc: { contentCount: -1 } }),
                article.subtopicId ? Subtopic.updateOne({ _id: article.subtopicId }, { $inc: { contentCount: -1 } }) : Promise.resolve(),
            ]);
        }

        revalidateArticlePaths(topicSlug, articleSlug);
        return success(true, 'Article scheduled successfully');
    } catch (err) {
        return handleError(err, 'Failed to schedule article');
    }
};
