'use server';

import type { IApiResponse, IPaginatedResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subtopic from '@/server/models/Subtopic';
import type { PipelineStage } from 'mongoose';
import { buildSort, handleError, normalizePagination, paginated, success } from '../../../utils/helper';
import type { ISubtopicEdit, ISubtopicRow, ISubtopicTableQuery } from './types';

// ========================================================
// Queries
// ========================================================

export const getSubtopics = async (params: ISubtopicTableQuery = {}): Promise<IPaginatedResponse<ISubtopicRow>> => {
    try {
        await connectDB();
        const { offset, limit } = normalizePagination(params.pagination);
        const sort = buildSort(params.sort, { order: 1, updatedAt: -1 });
        const match: Record<string, unknown> = {};

        if (typeof params.published === 'boolean') match.published = params.published;
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
                $facet: {
                    rows: [
                        { $sort: sort },
                        { $skip: offset },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 0,
                                id: { $toString: '$_id' },
                                topicId: { $toString: '$topicId' },
                                topicSlug: '$topic.slug',
                                topicTitle: '$topic.title',
                                slug: 1,
                                title: 1,
                                description: { $ifNull: ['$description', null] },
                                order: { $ifNull: ['$order', 0] },
                                published: { $ifNull: ['$published', false] },
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

        const [result] = await Subtopic.aggregate<{ rows: ISubtopicRow[]; meta: Array<{ total: number }> }>(pipeline);
        const rows = result?.rows ?? [];
        const total = result?.meta?.[0]?.total ?? 0;

        return paginated(rows, total, offset, limit);
    } catch (err) {
        return handleError(err, 'Failed to fetch subtopics') as IPaginatedResponse<ISubtopicRow>;
    }
};

export const getSubtopicForEdit = async (
    topicSlug: string,
    slug: string,
): Promise<IApiResponse<ISubtopicEdit | null>> => {
    try {
        await connectDB();

        const result = await Subtopic.aggregate<ISubtopicEdit>([
            { $match: { slug } },
            {
                $lookup: {
                    from: 'topics',
                    localField: 'topicId',
                    foreignField: '_id',
                    as: 'topic',
                    pipeline: [{ $project: { slug: 1 } }],
                },
            },
            { $unwind: '$topic' },
            { $match: { 'topic.slug': topicSlug } },
            {
                $project: {
                    _id: { $toString: '$_id' },
                    topicId: { $toString: '$topicId' },
                    topicSlug: '$topic.slug',
                    slug: 1,
                    title: 1,
                    description: { $ifNull: ['$description', null] },
                    order: { $ifNull: ['$order', 0] },
                    published: { $ifNull: ['$published', false] },
                    contentCount: { $ifNull: ['$contentCount', 0] },
                    createdAt: { $dateToString: { date: '$createdAt', format: '%Y-%m-%dT%H:%M:%S.%LZ' } },
                    updatedAt: { $dateToString: { date: '$updatedAt', format: '%Y-%m-%dT%H:%M:%S.%LZ' } },
                },
            },
        ]);

        return success(result[0] ?? null);
    } catch (err) {
        return handleError(err, 'Failed to fetch subtopic');
    }
};
