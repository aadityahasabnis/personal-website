'use server';

import type { IPaginatedResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Newsletter from '@/server/models/Newsletter';
import Admin from '@/server/models/Admin';
import { ObjectId } from 'mongodb';
import { handleError, normalizePagination, paginated } from '../../utils/helper';
import { getAdminId } from '../shared';
import {
    buildNewsletterMatch,
    buildNewsletterSort,
    mapAdminNewsletterRow,
    type IAdminNewsletterLean,
    type IAdminNewsletterAdminLean,
} from './shared';
import type { IAdminNewsletterRow, IAdminNewslettersTableQuery } from './types';

const uniqueObjectIds = (ids: ObjectId[]): ObjectId[] => {
    const map = new Map<string, ObjectId>();
    for (const id of ids) {
        map.set(id.toString(), id);
    }
    return [...map.values()];
};

// ========================================================
// Query: Admin Newsletters Table
// ========================================================

export const getNewsletters = async (
    params: IAdminNewslettersTableQuery = {},
): Promise<IPaginatedResponse<IAdminNewsletterRow>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const { offset, limit } = normalizePagination(params.pagination);

        const match = buildNewsletterMatch({
            filter: params.filter ?? 'all',
            ...(typeof params.query === 'string' ? { query: params.query } : {}),
        });

        const sort = buildNewsletterSort(params.sort);

        const [rows, total] = await Promise.all([
            Newsletter.find(match)
                .select('_id subject previewText body status sentAt recipientCount successCount failureCount createdBy updatedBy createdAt updatedAt')
                .sort(sort)
                .skip(offset)
                .limit(limit)
                .lean<IAdminNewsletterLean[]>(),
            Newsletter.countDocuments(match),
        ]);

        if (!rows.length) return paginated([], total, offset, limit);

        // Collect unique admin IDs
        const adminIds = uniqueObjectIds([
            ...rows.map((row) => row.createdBy),
            ...rows.map((row) => row.updatedBy).filter((id): id is ObjectId => Boolean(id)),
        ]);

        // Fetch admin details
        const adminRows = adminIds.length
            ? await Admin.find({ _id: { $in: adminIds } })
                .select('_id name email')
                .lean<IAdminNewsletterAdminLean[]>()
            : [];

        const adminMap = new Map<string, IAdminNewsletterAdminLean>(
            adminRows.map((row) => [row._id.toString(), row])
        );

        const mappedRows = rows.map((row) => mapAdminNewsletterRow(row, adminMap));

        return paginated(mappedRows, total, offset, limit);
    } catch (err) {
        return handleError(err, 'Failed to fetch newsletters') as IPaginatedResponse<IAdminNewsletterRow>;
    }
};

/*
API Responses:
- 200: Newsletters list returned with pagination metadata.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/
