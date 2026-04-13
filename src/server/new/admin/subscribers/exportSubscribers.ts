'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subscriber from '@/server/models/Subscriber';
import { handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import { buildSubscriberMatch, toAdminSubscriberRow, toSubscribersCsv } from './shared';
import type { SubscriberFilter } from './types';

// ========================================================
// Query: Export Subscribers CSV
// ========================================================

export const exportSubscribers = async (
    filter: SubscriberFilter = 'all',
): Promise<IApiResponse<string>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const match = buildSubscriberMatch(filter);
        const docs = await Subscriber.find(match)
            .select('_id name email confirmed subscribedAt unsubscribedAt createdAt updatedAt')
            .sort({ subscribedAt: -1 })
            .lean();

        const rows = docs.map((doc) => toAdminSubscriberRow(doc));
        return success(toSubscribersCsv(rows));
    } catch (err) {
        return handleError(err, 'Failed to export subscribers');
    }
};

/*
API Responses:
- 200: CSV payload returned.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/