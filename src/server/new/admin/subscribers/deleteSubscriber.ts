'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subscriber from '@/server/models/Subscriber';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import { revalidateSubscriberPaths } from './shared';

// ========================================================
// Mutation: Delete Subscriber
// ========================================================

export const deleteSubscriber = async (subscriberId: string): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!ObjectId.isValid(subscriberId)) return error('Invalid subscriber id', 400);

        await connectDB();

        const deleted = await Subscriber.findByIdAndDelete(subscriberId).select('_id');
        if (!deleted) return error('Subscriber not found', 404);

        revalidateSubscriberPaths();
        return success(true, 'Subscriber deleted');
    } catch (err) {
        return handleError(err, 'Failed to delete subscriber');
    }
};

/*
API Responses:
- 200: Subscriber deleted.
- 400: Invalid subscriber id.
- 401: Admin authentication required.
- 404: Subscriber not found.
- 500: Unexpected server/database error.
*/