'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import { calculateReadingTime } from '@/lib/utils';
import Content from '@/server/models/Content';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { cleanUndefined, created, error, handleError, timestamps } from '../../../../utils/helper';
import { buildSeo, getAdminId, revalidateArticlePaths } from '../../shared';
import type { IArticleCreateInput } from './types';

// ========================================================
// Create
// ========================================================

export const createArticle = async (input: IArticleCreateInput): Promise<IApiResponse<string>> => {
    try {
        await connectDB();

        const admin = await getAdminId();
        if (!admin.success) return admin;

        const topic = await Topic.findOne({ slug: input.topicSlug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        let subtopicId = null;
        if (input.subtopicSlug) {
            const subtopic = await Subtopic.findOne({ topicId: topic._id, slug: input.subtopicSlug }).select('_id').lean();
            if (!subtopic) return error('Subtopic not found', 404);
            subtopicId = subtopic._id;
        }

        const existing = await Content.findOne({ type: 'article', slug: input.slug }).select('_id').lean();
        if (existing) return error('Article with this slug already exists', 409);

        const now = timestamps();
        const published = input.published ?? false;

        const createdArticle = await Content.create(
            cleanUndefined({
                type: 'article',
                slug: input.slug,
                title: input.title,
                description: input.description,
                body: input.body,
                tags: input.tags ?? [],
                coverImage: input.coverImage ?? null,
                readingTime: input.readingTime ?? calculateReadingTime(input.body),
                published,
                publishedAt: published ? new Date() : null,
                scheduledAt: null,
                featured: input.featured ?? false,
                seo: buildSeo(input.seo),
                topicId: topic._id,
                subtopicId,
                order: input.order ?? 0,
                createdBy: admin.data,
                updatedBy: admin.data,
                ...now,
            })
        );

        if (published) {
            await Promise.all([
                Topic.updateOne({ _id: topic._id }, { $inc: { contentCount: 1 } }),
                subtopicId ? Subtopic.updateOne({ _id: subtopicId }, { $inc: { contentCount: 1 } }) : Promise.resolve(),
            ]);
        }

        revalidateArticlePaths(input.topicSlug, input.slug);
        return created(createdArticle._id.toString(), 'Article created successfully');
    } catch (err) {
        return handleError(err, 'Failed to create article');
    }
};
