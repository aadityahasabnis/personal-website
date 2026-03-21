'use server';

import { PUBLISH_STATUS } from '@/constants/schemaConstants';
import type { IApiResponse, IPaginatedResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import { ObjectId } from 'mongodb';
import type { PipelineStage } from 'mongoose';
import { buildSort, error, handleError, normalizePagination, paginated, success } from '../../../utils/helper';
import { getAdminId } from '../../shared';
import type { IArticleEdit, IArticleRow, IArticleTableQuery } from './types';

// ========================================================
// Queries
// ========================================================

export const getArticles = async (params: IArticleTableQuery = {}): Promise<IPaginatedResponse<IArticleRow>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const { offset, limit } = normalizePagination(params.pagination);
        const sort = buildSort(params.sort, { updatedAt: -1 });
        const match: Record<string, unknown> = { type: 'article' };

        if (typeof params.publishStatus === 'string') match.publishStatus = params.publishStatus;
        if (typeof params.featured === 'boolean') match.featured = params.featured;
        if (params.topicId) {
            if (!ObjectId.isValid(params.topicId)) return error('Invalid topic id', 400) as IPaginatedResponse<IArticleRow>;
            match.topicId = new ObjectId(params.topicId);
        }
        if (params.subtopicId) {
            if (!ObjectId.isValid(params.subtopicId)) return error('Invalid subtopic id', 400) as IPaginatedResponse<IArticleRow>;
            match.subtopicId = new ObjectId(params.subtopicId);
        }
        if (params.query?.trim()) {
            const q = params.query.trim();
            match.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } },
            ];
        }

        const pipeline: PipelineStage[] = [
            { $match: match },
            {
                $lookup: {
                    from: 'topics',
                    localField: 'topicId',
                    foreignField: '_id',
                    as: 'topic',
                    pipeline: [{ $project: { _id: 1, slug: 1, title: 1 } }],
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
            { $unwind: { path: '$subtopic', preserveNullAndEmptyArrays: true } },
            {
                $facet: {
                    rows: [
                        { $sort: sort },
                        { $skip: offset },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 0,
                                id: { $toString: '$_id' },
                                slug: 1,
                                title: 1,
                                description: 1,
                                topicId: { $toString: '$topicId' },
                                topicSlug: '$topic.slug',
                                topicTitle: '$topic.title',
                                subtopicId: {
                                    $cond: [
                                        { $ifNull: ['$subtopicId', false] },
                                        { $toString: '$subtopicId' },
                                        null,
                                    ],
                                },
                                subtopicSlug: { $ifNull: ['$subtopic.slug', null] },
                                subtopicTitle: { $ifNull: ['$subtopic.title', null] },
                                publishStatus: { $ifNull: ['$publishStatus', PUBLISH_STATUS.DRAFT] },
                                featured: { $ifNull: ['$featured', false] },
                                readingTime: { $ifNull: ['$readingTime', 0] },
                                order: { $ifNull: ['$order', 0] },
                                publishedAt: {
                                    $cond: [
                                        { $ifNull: ['$publishedAt', false] },
                                        { $dateToString: { date: '$publishedAt', format: '%Y-%m-%dT%H:%M:%S.%LZ' } },
                                        null,
                                    ],
                                },
                                updatedAt: { $dateToString: { date: '$updatedAt', format: '%Y-%m-%dT%H:%M:%S.%LZ' } },
                            },
                        },
                    ],
                    meta: [{ $count: 'total' }],
                },
            },
        ];

        const [result] = await Content.aggregate<{ rows: IArticleRow[]; meta: Array<{ total: number }> }>(pipeline);
        const rows = result?.rows ?? [];
        const total = result?.meta?.[0]?.total ?? 0;

        return paginated(rows, total, offset, limit);
    } catch (err) {
        return handleError(err, 'Failed to fetch articles') as IPaginatedResponse<IArticleRow>;
    }
};

export const getArticleForEdit = async (
    articleId: string,
): Promise<IApiResponse<IArticleEdit | null>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!ObjectId.isValid(articleId)) return error('Invalid article id', 400);

        await connectDB();

        const result = await Content.aggregate<IArticleEdit>([
            { $match: { type: 'article', _id: new ObjectId(articleId) } },
            {
                $lookup: {
                    from: 'topics',
                    localField: 'topicId',
                    foreignField: '_id',
                    as: 'topic',
                    pipeline: [{ $project: { _id: 1, slug: 1, title: 1 } }],
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
            { $unwind: { path: '$subtopic', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    id: { $toString: '$_id' },
                    slug: 1,
                    title: 1,
                    description: 1,
                    body: 1,
                    tags: { $ifNull: ['$tags', []] },
                    coverImage: { $ifNull: ['$coverImage', null] },
                    topicId: { $toString: '$topicId' },
                    topicSlug: '$topic.slug',
                    topicTitle: '$topic.title',
                    subtopicId: {
                        $cond: [{ $ifNull: ['$subtopicId', false] }, { $toString: '$subtopicId' }, null],
                    },
                    subtopicSlug: { $ifNull: ['$subtopic.slug', null] },
                    subtopicTitle: { $ifNull: ['$subtopic.title', null] },
                    publishStatus: { $ifNull: ['$publishStatus', PUBLISH_STATUS.DRAFT] },
                    featured: { $ifNull: ['$featured', false] },
                    readingTime: { $ifNull: ['$readingTime', 0] },
                    order: { $ifNull: ['$order', 0] },
                    publishedAt: {
                        $cond: [
                            { $ifNull: ['$publishedAt', false] },
                            { $dateToString: { date: '$publishedAt', format: '%Y-%m-%dT%H:%M:%S.%LZ' } },
                            null,
                        ],
                    },
                    seo: { $ifNull: ['$seo', null] },
                    updatedAt: { $dateToString: { date: '$updatedAt', format: '%Y-%m-%dT%H:%M:%S.%LZ' } },
                },
            },
            { $limit: 1 },
        ]);

        return success(result[0] ?? null);
    } catch (err) {
        return handleError(err, 'Failed to fetch article');
    }
};

/*
API Responses:
- getArticles
    - 200: Articles list returned with pagination metadata.
    - 400: Invalid topic id or subtopic id filter.
    - 500: Unexpected server/database error.
- getArticleForEdit
    - 200: Article edit payload returned (or null data when not found).
    - 400: Invalid article id.
    - 500: Unexpected server/database error.
*/
