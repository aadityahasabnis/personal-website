'use server';

import { CONTENT_TYPES } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import { handleError, success } from '../../../utils/helper';
import { buildPublishedContentMatch, toStableSort } from '../shared';
import type { IBlogStaticPath } from './types';

// ========================================================
// Query: Blog Static Paths
// ========================================================

export const getPublishedBlogStaticPaths = async (): Promise<IApiResponse<IBlogStaticPath[]>> => {
    try {
        await connectDB();

        const rows = await Content.find(buildPublishedContentMatch(CONTENT_TYPES.BLOG))
            .sort(toStableSort({ slug: 1 }))
            .select('_id slug')
            .lean<{ _id: { toString(): string }; slug: string }[]>();

        return success(
            rows.map((row) => ({
                contentId: row._id.toString(),
                blogSlug: row.slug,
            }))
        );
    } catch (err) {
        return handleError(err, 'Failed to fetch blog static paths');
    }
};

/*
API Responses:
- 200: Published blog static path rows returned.
- 500: Unexpected server/database error.
*/
