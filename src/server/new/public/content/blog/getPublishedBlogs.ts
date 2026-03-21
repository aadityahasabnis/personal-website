'use server';

import { PUBLISH_STATUS } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import { handleError, normalizePagination, success } from '../../../utils/helper';
import { toPublicBlogListItem, type IBlogLean } from './shared';
import type { IBlogListQuery, IPublicBlogListItem } from './types';

// ========================================================
// Query: Published Blogs
// ========================================================

export const getPublishedBlogs = async (
    params: IBlogListQuery = {},
): Promise<IApiResponse<IPublicBlogListItem[]>> => {
    try {
        await connectDB();

        const { offset, limit } = normalizePagination(params.pagination);
        const match: Record<string, unknown> = {
            type: 'blog',
            publishStatus: PUBLISH_STATUS.PUBLISHED,
        };

        if (params.featuredOnly === true) {
            match.featured = true;
        }

        const rows = await Content
            .find(match)
            .sort({ featured: -1, publishedAt: -1, updatedAt: -1 })
            .skip(offset)
            .limit(limit)
            .select('_id slug title description body html tags coverImage readingTime featured publishedAt updatedAt seo')
            .lean<IBlogLean[]>();

        return success(rows.map(toPublicBlogListItem));
    } catch (err) {
        return handleError(err, 'Failed to fetch published blogs');
    }
};

/*
API Responses:
- 200: Published blogs list returned.
- 500: Unexpected server/database error.
*/
