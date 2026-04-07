'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Topic from '@/server/models/Topic';
import { handleError, normalizePagination, success } from '../../../utils/helper';
import { toStableSort } from '../shared';
import { toTopicSummary, type ITopicLean } from './shared';
import type { IArticleTopicQuery, IPublicTopicSummary } from './types';

// ========================================================
// Query: Published Topics
// ========================================================

export const getPublishedArticleTopics = async (
    params: IArticleTopicQuery = {},
): Promise<IApiResponse<IPublicTopicSummary[]>> => {
    try {
        await connectDB();
        const { offset, limit } = normalizePagination(params.pagination);

        const match: Record<string, unknown> = {
            published: true,
            contentCount: { $gt: 0 },
        };
        if (params.featuredOnly === true) match.featured = true;

        const topics = await Topic.find(match)
            .sort(toStableSort({ featured: -1, order: 1, updatedAt: -1 }))
            .skip(offset)
            .limit(limit)
            .select('_id slug title description coverImage order featured subTopicCount contentCount updatedAt')
            .lean<ITopicLean[]>();

        return success(topics.map(toTopicSummary));
    } catch (err) {
        return handleError(err, 'Failed to fetch published article topics');
    }
};

/*
API Responses:
- 200: Published article topics returned.
- 500: Unexpected server/database error.
*/
