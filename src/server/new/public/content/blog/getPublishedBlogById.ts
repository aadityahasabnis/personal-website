'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import { error, handleError, success } from '../../../utils/helper';
import { parsePublicContentObjectId } from '../shared';
import { getPublishedBlogByObjectId, toPublicBlogDetail } from './shared';
import type { IPublicBlogDetail } from './types';

// ========================================================
// Query: Blog By Id
// ========================================================

export const getPublishedBlogById = async (
    contentId: string,
): Promise<IApiResponse<IPublicBlogDetail | null>> => {
    try {
        const objectId = parsePublicContentObjectId(contentId);
        if (!objectId) return error('Invalid content id', 400);

        await connectDB();

        const row = await getPublishedBlogByObjectId(objectId);
        if (!row) return success(null);

        return success(toPublicBlogDetail(row));
    } catch (err) {
        return handleError(err, 'Failed to fetch blog by id');
    }
};

/*
API Responses:
- 200: Published blog payload returned by content id (or null when not found/published).
- 400: Invalid content id.
- 500: Unexpected server/database error.
*/
