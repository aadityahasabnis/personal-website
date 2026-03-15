'use server';

import type { IApiResponse, IPaginatedResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import type { PipelineStage } from 'mongoose';
import { buildSort, handleError, normalizePagination, paginated, success } from '../../../../utils/helper';
import type { IArticleEdit, IArticleRow, IArticleTableQuery } from './types';

// ========================================================
// Queries
// ========================================================

export const getArticles = async (params: IArticleTableQuery = {}): Promise<IPaginatedResponse<IArticleRow>> => {
    try {
        await connectDB();

        const { offset, limit } = normalizePagination(params.pagination);
        const sort = buildSort(params.sort, { updatedAt: -1 });
        const match: Record<string, unknown> = { type: 'article' };

        if (typeof params.published === 'boolean') match.published = params.published;
        if (typeof params.featured === 'boolean') match.featured = params.featured;
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
            ...(params.topicSlug ? [{ $match: { 'topic.slug': params.topicSlug } } as PipelineStage] : []),
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
            ...(params.subtopicSlug ? [{ $match: { 'subtopic.slug': params.subtopicSlug } } as PipelineStage] : []),
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
                                published: { $ifNull: ['$published', false] },
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
    topicSlug: string,
    articleSlug: string,
): Promise<IApiResponse<IArticleEdit | null>> => {
    try {
        await connectDB();

        const result = await Content.aggregate<IArticleEdit>([
            { $match: { type: 'article', slug: articleSlug } },
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
            { $match: { 'topic.slug': topicSlug } },
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
                    published: { $ifNull: ['$published', false] },
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
                    scheduledAt: {
                        $cond: [
                            { $ifNull: ['$scheduledAt', false] },
                            { $dateToString: { date: '$scheduledAt', format: '%Y-%m-%dT%H:%M:%S.%LZ' } },
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
