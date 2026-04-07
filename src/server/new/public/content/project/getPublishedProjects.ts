'use server';

import { CONTENT_TYPES } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import { handleError, normalizePagination, success } from '../../../utils/helper';
import { buildPublishedContentMatch, toStableSort } from '../shared';
import { toPublicProjectListItem, type IProjectLean } from './shared';
import type { IProjectListQuery, IPublicProjectListItem } from './types';

// ========================================================
// Query: Published Projects
// ========================================================

export const getPublishedProjects = async (
    params: IProjectListQuery = {},
): Promise<IApiResponse<IPublicProjectListItem[]>> => {
    try {
        await connectDB();

        const { offset, limit } = normalizePagination(params.pagination);
        const match: Record<string, unknown> = buildPublishedContentMatch(CONTENT_TYPES.PROJECT);

        if (params.featuredOnly === true) {
            match.featured = true;
        }

        if (typeof params.status === 'string') {
            match.status = params.status;
        }

        const rows = await Content.find(match)
            .sort(toStableSort({ order: 1, featured: -1, updatedAt: -1 }))
            .skip(offset)
            .limit(limit)
            .select(
                '_id slug title description coverImage techStack githubUrl liveUrl status startDate completedDate order featured publishedAt'
            )
            .lean<IProjectLean[]>();

        return success(rows.map(toPublicProjectListItem));
    } catch (err) {
        return handleError(err, 'Failed to fetch published projects');
    }
};

/*
API Responses:
- 200: Published projects list returned.
- 500: Unexpected server/database error.
*/
