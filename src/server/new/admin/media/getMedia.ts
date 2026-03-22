'use server';

import type { IPaginatedResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Media from '@/server/models/Media';
import { handleError, normalizePagination, paginated } from '../../utils/helper';
import { getAdminId } from '../shared';
import { buildMediaMatch, buildMediaSort, toAdminMediaRow } from './shared';
import type { IAdminMediaRow, IMediaTableQuery } from './types';

// ========================================================
// Query: Admin Media Table
// ========================================================

export const getMedia = async (
    params: IMediaTableQuery = {}
): Promise<IPaginatedResponse<IAdminMediaRow>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const { offset, limit } = normalizePagination(params.pagination);
        const match = buildMediaMatch(params.filter ?? 'all', params.query);
        const sort = buildMediaSort(params.sort);

        const [docs, total] = await Promise.all([
            Media.find(match)
                .select('fileName fileKey publicUrl fileType mimeType size folder description altText tags createdAt updatedAt')
                .sort(sort)
                .skip(offset)
                .limit(limit)
                .lean(),
            Media.countDocuments(match),
        ]);

        const rows = docs.map((doc: any) => toAdminMediaRow(doc));
        return paginated(rows, total, offset, limit);
    } catch (err) {
        return handleError(err, 'Failed to fetch media') as IPaginatedResponse<IAdminMediaRow>;
    }
};

/*
API Responses:
- 200: Media list returned with pagination metadata.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/
