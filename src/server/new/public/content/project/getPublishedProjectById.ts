'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import { error, handleError, success } from '../../../utils/helper';
import { parsePublicContentObjectId } from '../shared';
import { getPublishedProjectByObjectId, toPublicProjectDetail } from './shared';
import type { IPublicProjectDetail } from './types';

// ========================================================
// Query: Project By Id
// ========================================================

export const getPublishedProjectById = async (
    contentId: string,
): Promise<IApiResponse<IPublicProjectDetail | null>> => {
    try {
        const objectId = parsePublicContentObjectId(contentId);
        if (!objectId) return error('Invalid content id', 400);

        await connectDB();

        const row = await getPublishedProjectByObjectId(objectId);
        if (!row) return success(null);

        return success(toPublicProjectDetail(row));
    } catch (err) {
        return handleError(err, 'Failed to fetch project by id');
    }
};

/*
API Responses:
- 200: Published project payload returned by content id (or null when not found/published).
- 400: Invalid content id.
- 500: Unexpected server/database error.
*/
