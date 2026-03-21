'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subscriber from '@/server/models/Subscriber';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import { revalidateSubscriberPaths } from './shared';

// ========================================================
// Mutation: Confirm Subscriber
// ========================================================

export const confirmSubscriber = async (subscriberId: string): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!ObjectId.isValid(subscriberId)) return error('Invalid subscriber id', 400);

        await connectDB();

        const subscriber = await Subscriber.findById(subscriberId).select('confirmed unsubscribedAt');
        if (!subscriber) return error('Subscriber not found', 404);
        if (subscriber.unsubscribedAt) return error('Cannot confirm an unsubscribed subscriber', 409);

        const alreadyConfirmed = Boolean(subscriber.confirmed);
        if (!alreadyConfirmed) await subscriber.confirm();

        revalidateSubscriberPaths();
        return success(true, alreadyConfirmed ? 'Subscriber already confirmed' : 'Subscriber confirmed');
    } catch (err) {
        return handleError(err, 'Failed to confirm subscriber');
    }
};

/*
API Responses:
- 200: Subscriber confirmed (or already confirmed).
- 400: Invalid subscriber id.
- 401: Admin authentication required.
- 404: Subscriber not found.
- 409: Subscriber is currently unsubscribed.
- 500: Unexpected server/database error.
*/