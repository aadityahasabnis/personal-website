'use server';

import { PUBLISH_STATUS } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../../utils/helper';
import type { IPublicArticleDetail } from './types';

// ========================================================
// Query: Article By Id
// ========================================================

export const getPublishedArticleById = async (
    contentId: string,
): Promise<IApiResponse<IPublicArticleDetail | null>> => {
    try {
        const objectId = ObjectId.isValid(contentId) ? new ObjectId(contentId) : null;
        if (!objectId) return error('Invalid content id', 400);

        await connectDB();

        const row = await Content.aggregate<{
            id: string;
            slug: string;
            title: string;
            description: string;
            body: string;
            html: string | null;
            tags: string[];
            coverImage: string | null;
            readingTime: number;
            featured: boolean;
            publishedAt: string | null;
            updatedAt: string;
            topic: { id: string; slug: string; title: string };
            subtopic: { id: string; slug: string; title: string } | null;
            seo: IPublicArticleDetail['seo'];
        }>([
            {
                $match: {
                    _id: objectId,
                    type: 'article',
                    publishStatus: PUBLISH_STATUS.PUBLISHED,
                },
            },
            {
                $lookup: {
                    from: 'topics',
                    localField: 'topicId',
                    foreignField: '_id',
                    as: 'topic',
                    pipeline: [
                        { $match: { published: true } },
                        { $project: { _id: 1, slug: 1, title: 1 } },
                    ],
                },
            },
            { $unwind: '$topic' },
            {
                $lookup: {
                    from: 'subtopics',
                    localField: 'subtopicId',
                    foreignField: '_id',
                    as: 'subtopic',
                    pipeline: [{ $project: { _id: 1, slug: 1, title: 1 } }],
                },
            },
            {
                $unwind: {
                    path: '$subtopic',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    id: { $toString: '$_id' },
                    slug: 1,
                    title: 1,
                    description: 1,
                    body: 1,
                    html: { $ifNull: ['$html', null] },
                    tags: { $ifNull: ['$tags', []] },
                    coverImage: { $ifNull: ['$coverImage', null] },
                    readingTime: { $ifNull: ['$readingTime', 0] },
                    featured: { $ifNull: ['$featured', false] },
                    publishedAt: {
                        $cond: [
                            { $ifNull: ['$publishedAt', false] },
                            { $dateToString: { date: '$publishedAt', format: '%Y-%m-%dT%H:%M:%S.%LZ' } },
                            null,
                        ],
                    },
                    updatedAt: { $dateToString: { date: '$updatedAt', format: '%Y-%m-%dT%H:%M:%S.%LZ' } },
                    topic: {
                        id: { $toString: '$topic._id' },
                        slug: '$topic.slug',
                        title: '$topic.title',
                    },
                    subtopic: {
                        $cond: [
                            { $ifNull: ['$subtopic._id', false] },
                            {
                                id: { $toString: '$subtopic._id' },
                                slug: '$subtopic.slug',
                                title: '$subtopic.title',
                            },
                            null,
                        ],
                    },
                    seo: {
                        $cond: [
                            { $ifNull: ['$seo', false] },
                            {
                                title: { $ifNull: ['$seo.title', null] },
                                description: { $ifNull: ['$seo.description', null] },
                                keywords: { $ifNull: ['$seo.keywords', []] },
                                ogImage: { $ifNull: ['$seo.ogImage', null] },
                                canonicalUrl: { $ifNull: ['$seo.canonicalUrl', null] },
                                noIndex: { $ifNull: ['$seo.noIndex', false] },
                            },
                            null,
                        ],
                    },
                },
            },
        ]);

        return success(row[0] ?? null);
    } catch (err) {
        return handleError(err, 'Failed to fetch article by id');
    }
};

/*
API Responses:
- 200: Published article payload returned by content id (or null when not found/published).
- 400: Invalid content id.
- 500: Unexpected server/database error.
*/
