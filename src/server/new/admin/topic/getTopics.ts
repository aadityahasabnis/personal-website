'use server';

import type { IApiResponse, IPaginatedResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import type { PipelineStage } from 'mongoose';
import { buildSort, error, handleError, normalizePagination, paginated, success } from '../../utils/helper';
import type { ITopicEdit, ITopicRow, ITopicTableQuery } from './types';

// ========================================================
// Queries
// ========================================================

export const getTopics = async (params: ITopicTableQuery = {}): Promise<IPaginatedResponse<ITopicRow>> => {
    try {
        await connectDB();
        const { offset, limit } = normalizePagination(params.pagination);
        const sort = buildSort(params.sort, { order: 1, updatedAt: -1 });
        const match: Record<string, unknown> = {};

        if (typeof params.published === 'boolean') match.published = params.published;
        if (typeof params.featured === 'boolean') match.featured = params.featured;
        if (params.query?.trim()) {
            const q = params.query.trim();
            match.$or = [
                { title: { $regex: q, $options: 'i' } },
                { slug: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
            ];
        }

        const pipeline: PipelineStage[] = [
            { $match: match },
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
                                coverImage: { $ifNull: ['$coverImage', null] },
                                order: { $ifNull: ['$order', 0] },
                                published: { $ifNull: ['$published', false] },
                                featured: { $ifNull: ['$featured', false] },
                                subTopicCount: { $ifNull: ['$subTopicCount', 0] },
                                contentCount: { $ifNull: ['$contentCount', 0] },
                                createdAt: { $dateToString: { date: '$createdAt', format: '%Y-%m-%dT%H:%M:%S.%LZ' } },
                                updatedAt: { $dateToString: { date: '$updatedAt', format: '%Y-%m-%dT%H:%M:%S.%LZ' } },
                            },
                        },
                    ],
                    meta: [{ $count: 'total' }],
                },
            },
        ];

        const [result] = await Topic.aggregate<{ rows: ITopicRow[]; meta: Array<{ total: number }> }>(pipeline);
        const rows = result?.rows ?? [];
        const total = result?.meta?.[0]?.total ?? 0;

        return paginated(rows, total, offset, limit);
    } catch (err) {
        return handleError(err, 'Failed to fetch topics') as IPaginatedResponse<ITopicRow>;
    }
};

export const getTopicForEdit = async (topicId: string): Promise<IApiResponse<ITopicEdit | null>> => {
    try {
        if (!ObjectId.isValid(topicId)) return error('Invalid topic id', 400);

        await connectDB();
        const topic = await Topic.findById(topicId)
            .select('slug title description coverImage order published featured subTopicCount contentCount createdAt updatedAt')
            .lean();
        if (!topic) return success(null);

        return success({
            _id: topic._id.toString(),
            slug: topic.slug,
            title: topic.title,
            description: topic.description,
            coverImage: topic.coverImage ?? null,
            order: topic.order ?? 0,
            published: Boolean(topic.published),
            featured: Boolean(topic.featured),
            subTopicCount: topic.subTopicCount ?? 0,
            contentCount: topic.contentCount ?? 0,
            createdAt: topic.createdAt.toISOString(),
            updatedAt: topic.updatedAt.toISOString(),
        });
    } catch (err) {
        return handleError(err, 'Failed to fetch topic');
    }
};

/*
API Responses:
- 200: Topics list/topic edit payload returned.
- 400: Invalid topic id.
- 500: Unexpected server/database error.
*/
