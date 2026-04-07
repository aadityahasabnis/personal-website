'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subscriber from '@/server/models/Subscriber';
import { handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import type { ISubscriberStats } from './types';

// ========================================================
// Query: Subscriber Stats
// ========================================================

export const getSubscriberStats = async (): Promise<IApiResponse<ISubscriberStats>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const [total, confirmed, pending, unsubscribed, active] = await Promise.all([
            Subscriber.countDocuments({}),
            Subscriber.countDocuments({ confirmed: true }),
            Subscriber.countDocuments({ confirmed: false, unsubscribedAt: null }),
            Subscriber.countDocuments({ unsubscribedAt: { $ne: null } }),
            Subscriber.getSubscriberCount(),
        ]);

        return success({
            total,
            confirmed,
            pending,
            unsubscribed,
            active,
        });
    } catch (err) {
        return handleError(err, 'Failed to fetch subscriber stats');
    }
};

/*
API Responses:
- 200: Subscriber stats returned.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/