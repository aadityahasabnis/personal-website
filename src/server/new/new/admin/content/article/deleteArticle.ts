'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import Content from '@/server/models/Content';
import PageStats from '@/server/models/PageStats';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../../../utils/helper';
import { revalidateArticlePaths } from '../../shared';

interface IArticleDeleteBase {
    _id: ObjectId;
    topicId: ObjectId;
    subtopicId: ObjectId | null;
    published: boolean;
}

// ========================================================
// Delete
// ========================================================

export const deleteArticle = async (topicSlug: string, articleSlug: string): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();

        const topic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        const article = await Content.findOne({
            type: 'article',
            slug: articleSlug,
            topicId: topic._id,
        }).select('_id topicId subtopicId published').lean<IArticleDeleteBase | null>();

        if (!article) return error('Article not found', 404);

        await Promise.all([
            Content.deleteOne({ _id: article._id }),
            PageStats.deleteOne({ contentId: article._id as ObjectId }),
            Comment.deleteMany({ contentId: article._id as ObjectId }),
        ]);

        if (article.published) {
            await Promise.all([
                Topic.updateOne({ _id: article.topicId }, { $inc: { contentCount: -1 } }),
                article.subtopicId ? Subtopic.updateOne({ _id: article.subtopicId }, { $inc: { contentCount: -1 } }) : Promise.resolve(),
            ]);
        }

        revalidateArticlePaths(topicSlug, articleSlug);
        return success(true, 'Article deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete article');
    }
};
