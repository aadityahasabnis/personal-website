'use server';

import { CONTENT_TYPES } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import { handleError, success } from '../../../utils/helper';
import { buildPublishedContentMatch } from '../shared';
import type { IArticleStaticPath } from './types';

// ========================================================
// Query: Article Static Paths
// ========================================================

export const getPublishedArticleStaticPaths = async (): Promise<IApiResponse<IArticleStaticPath[]>> => {
    try {
        await connectDB();

        const rows = await Content.aggregate<{
            contentId: string;
            topicSlug: string;
            articleSlug: string;
        }>([
            {
                $match: buildPublishedContentMatch(CONTENT_TYPES.ARTICLE, { topicId: { $ne: null } }),
            },
            {
                $lookup: {
                    from: 'topics',
                    localField: 'topicId',
                    foreignField: '_id',
                    as: 'topic',
                    pipeline: [
                        {
                            $match: { published: true },
                        },
                        {
                            $project: {
                                _id: 0,
                                slug: 1,
                            },
                        },
                    ],
                },
            },
            { $unwind: '$topic' },
            {
                $project: {
                    _id: 0,
                    contentId: { $toString: '$_id' },
                    topicSlug: '$topic.slug',
                    articleSlug: '$slug',
                },
            },
            {
                $sort: { topicSlug: 1, articleSlug: 1 },
            },
        ]);

        return success(rows);
    } catch (err) {
        return handleError(err, 'Failed to fetch article static paths');
    }
};

/*
API Responses:
- 200: Published article static path rows returned.
- 500: Unexpected server/database error.
*/
