'use server';

import type { IPaginatedResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Contact from '@/server/models/Contact';
import { handleError, normalizePagination, paginated } from '../../utils/helper';
import { getAdminId } from '../shared';
import { buildContactMatch, buildContactSort, toAdminContactRow } from './shared';
import type { IAdminContactRow, IContactsTableQuery } from './types';

// ========================================================
// Query: Admin Contacts Table
// ========================================================

export const getContacts = async (
    params: IContactsTableQuery = {},
): Promise<IPaginatedResponse<IAdminContactRow>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const { offset, limit } = normalizePagination(params.pagination);
        const match = buildContactMatch(params.status ?? 'all', params.query);
        const sort = buildContactSort(params.sort);

        const [docs, total] = await Promise.all([
            Contact.find(match)
                .select('_id name email subject message status ipHash createdAt updatedAt')
                .sort(sort)
                .skip(offset)
                .limit(limit)
                .lean(),
            Contact.countDocuments(match),
        ]);

        const rows = docs.map((doc) => toAdminContactRow(doc));
        return paginated(rows, total, offset, limit);
    } catch (err) {
        return handleError(err, 'Failed to fetch contacts') as IPaginatedResponse<IAdminContactRow>;
    }
};

/*
API Responses:
- 200: Contacts list returned with pagination metadata.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/
