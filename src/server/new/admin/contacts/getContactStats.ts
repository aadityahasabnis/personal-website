'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Contact from '@/server/models/Contact';
import { handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import { CONTACT_STATS_STATUS_QUERIES } from './shared';
import type { IAdminContactStats } from './types';

// ========================================================
// Query: Contact Stats
// ========================================================

export const getContactStats = async (): Promise<IApiResponse<IAdminContactStats>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const [total, unread, read, replied, archived] = await Promise.all([
            Contact.countDocuments({}),
            Contact.countDocuments(CONTACT_STATS_STATUS_QUERIES.new),
            Contact.countDocuments(CONTACT_STATS_STATUS_QUERIES.read),
            Contact.countDocuments(CONTACT_STATS_STATUS_QUERIES.replied),
            Contact.countDocuments(CONTACT_STATS_STATUS_QUERIES.archived),
        ]);

        return success({
            total,
            new: unread,
            read,
            replied,
            archived,
        });
    } catch (err) {
        return handleError(err, 'Failed to fetch contact stats');
    }
};

/*
API Responses:
- 200: Contact stats returned.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/
