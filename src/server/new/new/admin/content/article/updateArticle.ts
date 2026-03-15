'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import { calculateReadingTime } from '@/lib/utils';
import Content from '@/server/models/Content';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { cleanUndefined, error, handleError, success, updatedNow } from '../../../../utils/helper';
import { buildSeo, getAdminId, revalidateArticlePaths } from '../../shared';
import type { IArticleUpdateInput } from './types';

interface IArticleUpdateBase {
    _id: ObjectId;
    slug: string;
    topicId: ObjectId;
    subtopicId: ObjectId | null;
    published: boolean;
}

// ========================================================
// Update
// ========================================================

export const updateArticle = async (
    topicSlug: string,
    articleSlug: string,
    input: IArticleUpdateInput,
): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();

        const admin = await getAdminId();
        if (!admin.success) return admin;

        const currentTopic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
        if (!currentTopic) return error('Topic not found', 404);

        const article = await Content.findOne({
            type: 'article',
            slug: articleSlug,
            topicId: currentTopic._id,
        }).select('_id slug topicId subtopicId published').lean<IArticleUpdateBase | null>();

        if (!article) return error('Article not found', 404);

        const targetTopic = input.topicSlug && input.topicSlug !== topicSlug
            ? await Topic.findOne({ slug: input.topicSlug }).select('_id').lean()
            : currentTopic;

        if (!targetTopic) return error('Target topic not found', 404);

        let targetSubtopicId = article.subtopicId ?? null;
        if (input.subtopicSlug === null) targetSubtopicId = null;
        if (typeof input.subtopicSlug === 'string') {
            const targetSubtopic = await Subtopic.findOne({
                topicId: targetTopic._id,
                slug: input.subtopicSlug,
            }).select('_id').lean();

            if (!targetSubtopic) return error('Target subtopic not found', 404);
            targetSubtopicId = targetSubtopic._id;
        }

        if (input.slug && input.slug !== articleSlug) {
            const conflict = await Content.findOne({ type: 'article', slug: input.slug }).select('_id').lean();
            if (conflict && conflict._id.toString() !== article._id.toString()) {
                return error('Article with this slug already exists', 409);
            }
        }

        const nextPublished = typeof input.published === 'boolean' ? input.published : article.published;
        const topicChanged = targetTopic._id.toString() !== article.topicId.toString();
        const subtopicChanged = String(targetSubtopicId ?? '') !== String(article.subtopicId ?? '');

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
                    order: input.order,
                    published: nextPublished,
                    publishedAt: nextPublished ? new Date() : null,
                    updatedBy: admin.data,
                    ...updatedNow(),
                }),
            }
        );

        if (article.published !== nextPublished || topicChanged || subtopicChanged) {
            if (article.published) {
                await Promise.all([
                    Topic.updateOne({ _id: article.topicId }, { $inc: { contentCount: -1 } }),
                    article.subtopicId ? Subtopic.updateOne({ _id: article.subtopicId }, { $inc: { contentCount: -1 } }) : Promise.resolve(),
                ]);
            }
            if (nextPublished) {
                await Promise.all([
                    Topic.updateOne({ _id: targetTopic._id }, { $inc: { contentCount: 1 } }),
                    targetSubtopicId ? Subtopic.updateOne({ _id: targetSubtopicId }, { $inc: { contentCount: 1 } }) : Promise.resolve(),
                ]);
            }
        }

        revalidateArticlePaths(topicSlug, articleSlug);
        revalidateArticlePaths(input.topicSlug ?? topicSlug, input.slug ?? articleSlug);

        return success(true, 'Article updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update article');
    }
};
