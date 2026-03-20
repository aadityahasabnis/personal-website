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
import { cleanUndefined, created, error, handleError, timestamps } from '../../../utils/helper';
import { buildSeo, getAdminId, revalidateArticlePaths } from '../../shared';
import { isDuplicateSlugError } from '../helpers';
import type { IArticleCreateInput } from './types';

// ========================================================
// Create
// ========================================================

export const createArticle = async (input: IArticleCreateInput): Promise<IApiResponse<string>> => {
    try {
        if (!ObjectId.isValid(input.topicId)) return error('Invalid topic id', 400);
        if (typeof input.subtopicId === 'string' && !ObjectId.isValid(input.subtopicId)) {
            return error('Invalid subtopic id', 400);
        }

        await connectDB();

        const admin = await getAdminId();
        if (!admin.success) return admin;

        const topic = await Topic.findById(input.topicId).select('_id slug').lean();
        if (!topic) return error('Topic not found', 404);

        let subtopicId = null;
        if (typeof input.subtopicId === 'string') {
            const subtopic = await Subtopic.findOne({ _id: input.subtopicId, topicId: topic._id }).select('_id').lean();
            if (!subtopic) return error('Subtopic not found', 404);
            subtopicId = subtopic._id;
        }

        const existing = await Content.findOne({ type: 'article', slug: input.slug }).select('_id').lean();
        if (existing) return error('Article with this slug already exists', 409);

        const now = timestamps();
        const publishStatus: PublishStatusType = input.publishStatus
            ?? PUBLISH_STATUS.DRAFT;

        const txnSession = await mongoose.startSession();
        let createdArticleId = '';

        try {
            await txnSession.withTransaction(async () => {
                const createdArticle = new Content(
                    cleanUndefined({
                        type: 'article',
                        slug: input.slug,
                        title: input.title,
                        description: input.description,
                        body: input.body,
                        tags: input.tags ?? [],
                        coverImage: input.coverImage ?? null,
                        readingTime: input.readingTime ?? calculateReadingTime(input.body),
                        publishStatus,
                        publishedAt: publishStatus === PUBLISH_STATUS.PUBLISHED ? new Date() : null,
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

                await createdArticle.save({ session: txnSession });
                createdArticleId = createdArticle._id.toString();

                if (publishStatus === PUBLISH_STATUS.PUBLISHED) {
                    await Promise.all([
                        Topic.updateOne({ _id: topic._id }, { $inc: { contentCount: 1 } }, { session: txnSession }),
                        subtopicId
                            ? Subtopic.updateOne({ _id: subtopicId }, { $inc: { contentCount: 1 } }, { session: txnSession })
                            : Promise.resolve(),
                    ]);
                }
            });
        } finally {
            await txnSession.endSession();
        }

        revalidateArticlePaths(topic.slug, input.slug);
        return created(createdArticleId, 'Article created successfully');
    } catch (err) {
        if (isDuplicateSlugError(err)) return error('Article with this slug already exists', 409);
        return handleError(err, 'Failed to create article');
    }
};

/*
API Responses:
- 201: Article created successfully.
- 400: Invalid topic id or subtopic id.
- 404: Topic or subtopic not found.
- 409: Article slug already exists.
- 500: Unexpected server/database error.
*/
