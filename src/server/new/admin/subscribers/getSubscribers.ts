'use server';

import type { IPaginatedResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subscriber from '@/server/models/Subscriber';
import { handleError, normalizePagination, paginated } from '../../utils/helper';
import { getAdminId } from '../shared';
import { buildSubscriberMatch, buildSubscriberSort, toAdminSubscriberRow } from './shared';
import type { IAdminSubscriberRow, ISubscribersTableQuery } from './types';

// ========================================================
// Query: Admin Subscribers Table
// ========================================================

export const getSubscribers = async (
    params: ISubscribersTableQuery = {},
): Promise<IPaginatedResponse<IAdminSubscriberRow>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const { offset, limit } = normalizePagination(params.pagination);
        const match = buildSubscriberMatch(params.filter ?? 'all', params.query);
        const sort = buildSubscriberSort(params.sort);

        const [docs, total] = await Promise.all([
            Subscriber.find(match)
                .select('_id email confirmed subscribedAt unsubscribedAt createdAt updatedAt')
                .sort(sort)
                .skip(offset)
                .limit(limit)
                .lean(),
            Subscriber.countDocuments(match),
        ]);

        const rows = docs.map((doc) => toAdminSubscriberRow(doc));
        return paginated(rows, total, offset, limit);
    } catch (err) {
        return handleError(err, 'Failed to fetch subscribers') as IPaginatedResponse<IAdminSubscriberRow>;
    }
};

/*
API Responses:
- 200: Subscribers list returned with pagination metadata.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/