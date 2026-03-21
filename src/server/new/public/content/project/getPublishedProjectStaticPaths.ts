'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import { handleError, success } from '../../../utils/helper';
import { buildPublishedContentMatch, toStableSort } from '../shared';
import type { IProjectStaticPath } from './types';

// ========================================================
// Query: Project Static Paths
// ========================================================

export const getPublishedProjectStaticPaths = async (): Promise<IApiResponse<IProjectStaticPath[]>> => {
    try {
        await connectDB();

        const rows = await Content.find(buildPublishedContentMatch('project'))
            .sort(toStableSort({ slug: 1 }))
            .select('_id slug')
            .lean<{ _id: { toString(): string }; slug: string }[]>();

        return success(
            rows.map((row) => ({
                contentId: row._id.toString(),
                projectSlug: row.slug,
            }))
        );
    } catch (err) {
        return handleError(err, 'Failed to fetch project static paths');
    }
};

/*
API Responses:
- 200: Published project static path rows returned.
- 500: Unexpected server/database error.
*/
