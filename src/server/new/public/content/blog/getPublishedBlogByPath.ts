'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import { handleError, success } from '../../../utils/helper';
import { getPublishedBlogBySlug, toPublicBlogDetail } from './shared';
import type { IPublicBlogDetail } from './types';

// ========================================================
// Query: Blog By Path
// ========================================================

export const getPublishedBlogByPath = async (
    blogSlug: string,
): Promise<IApiResponse<IPublicBlogDetail | null>> => {
    try {
        await connectDB();

        const row = await getPublishedBlogBySlug(blogSlug);
        if (!row) return success(null);

        return success(toPublicBlogDetail(row));
    } catch (err) {
        return handleError(err, 'Failed to fetch blog');
    }
};

/*
API Responses:
- 200: Published blog payload returned (or null when not found/published).
- 500: Unexpected server/database error.
*/
