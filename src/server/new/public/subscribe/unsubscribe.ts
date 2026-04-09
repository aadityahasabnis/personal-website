'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subscriber from '@/server/models/Subscriber';
import { error, handleError, success } from '../../utils/helper';
import { isValidSubscriberEmail, normalizeSubscriberEmail } from './shared';
import type { ISubscriptionResult, IUnsubscribeInput } from './types';

// ========================================================
// Mutation: Public Unsubscribe
// ========================================================

export const unsubscribe = async (
    input: IUnsubscribeInput,
): Promise<IApiResponse<ISubscriptionResult>> => {
    try {
        const email = normalizeSubscriberEmail(input.email ?? '');
        if (!isValidSubscriberEmail(email)) return error('Invalid email address', 400);

        await connectDB();

        const subscriber = await Subscriber.findOne({ email }).select('email confirmed unsubscribedAt');

        if (!subscriber || subscriber.unsubscribedAt) {
            return success(
                {
                    email,
                    confirmed: true,
                    state: 'unsubscribed',
                },
                'If this email was subscribed, it has been unsubscribed.',
            );
        }

        await subscriber.unsubscribe();

        return success(
            {
                email: subscriber.email,
                confirmed: true,
                state: 'unsubscribed',
            },
            'You have been unsubscribed successfully.',
        );
    } catch (err) {
        return handleError(err, 'Failed to unsubscribe');
    }
};

/*
API Responses:
- 200: Email unsubscribed or already not subscribed.
- 400: Invalid email.
- 500: Unexpected server/database error.
*/