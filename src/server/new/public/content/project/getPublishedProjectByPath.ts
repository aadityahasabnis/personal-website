'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import { handleError, success } from '../../../utils/helper';
import { getPublishedProjectBySlug, toPublicProjectDetail } from './shared';
import type { IPublicProjectDetail } from './types';

// ========================================================
// Query: Project By Path
// ========================================================

export const getPublishedProjectByPath = async (
    projectSlug: string,
): Promise<IApiResponse<IPublicProjectDetail | null>> => {
    try {
        await connectDB();

        const row = await getPublishedProjectBySlug(projectSlug);
        if (!row) return success(null);

        return success(toPublicProjectDetail(row));
    } catch (err) {
        return handleError(err, 'Failed to fetch project');
    }
};

/*
API Responses:
- 200: Published project payload returned (or null when not found/published).
- 500: Unexpected server/database error.
*/
