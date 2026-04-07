'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subscriber from '@/server/models/Subscriber';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import { normalizeSubscriberIds, revalidateSubscriberPaths } from './shared';

// ========================================================
// Mutation: Bulk Delete Subscribers
// ========================================================

export const bulkDeleteSubscribers = async (
    subscriberIds: string[],
): Promise<IApiResponse<number>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!subscriberIds.length) return success(0, 'No subscribers selected');

        const normalizedIds = normalizeSubscriberIds(subscriberIds);
        if (!normalizedIds.length) return error('One or more subscriber ids are invalid', 400);

        await connectDB();

        const objectIds = normalizedIds.map((id) => new ObjectId(id));
        const result = await Subscriber.deleteMany({ _id: { $in: objectIds } });

        revalidateSubscriberPaths();
        return success(result.deletedCount, `Deleted ${String(result.deletedCount)} subscribers`);
    } catch (err) {
        return handleError(err, 'Failed to bulk delete subscribers');
    }
};

/*
API Responses:
- 200: Bulk delete completed.
- 400: One or more subscriber ids are invalid.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/