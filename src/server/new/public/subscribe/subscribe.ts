'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subscriber from '@/server/models/Subscriber';
import type { ISubscriberDocument } from '@/server/models/types';
import { created, error, handleError, success } from '../../utils/helper';
import { isValidSubscriberEmail, normalizeSubscriberEmail, validateSubscriberName } from './shared';
import type { ISubscribeInput, ISubscriptionResult } from './types';

interface ISubscriberLookup {
    _id: ISubscriberDocument['_id'];
    email: string;
    name: string | null;
    confirmed: boolean;
    unsubscribedAt: Date | null;
    subscribedAt: Date;
}

// ========================================================
// Mutation: Public Subscribe
// ========================================================

export const subscribe = async (
    input: ISubscribeInput,
): Promise<IApiResponse<ISubscriptionResult>> => {
    try {
        const email = normalizeSubscriberEmail(input.email ?? '');
        if (!isValidSubscriberEmail(email)) return error('Invalid email address', 400);

        const nameValidation = validateSubscriberName(input.name);
        if (nameValidation.errorMessage) return error(nameValidation.errorMessage, 400);

        await connectDB();

        const existing = await Subscriber.findOne({ email })
            .select('_id email name confirmed unsubscribedAt subscribedAt')
            .lean<ISubscriberLookup | null>();

        if (!existing) {
            const doc = await Subscriber.create({
                email,
                name: nameValidation.name,
                confirmed: false,
            });

            return created(
                {
                    email: doc.email,
                    confirmed: doc.confirmed,
                    state: 'created',
                },
                'Subscription saved. You will receive updates soon.',
            );
        }

        const subscriber = await Subscriber.findById(existing._id).select('email name confirmed unsubscribedAt');
        if (!subscriber) return error('Subscriber not found', 404);

        if (subscriber.unsubscribedAt) {
            if (nameValidation.name && !subscriber.name) subscriber.name = nameValidation.name;
            await subscriber.resubscribe();

            return success(
                {
                    email: subscriber.email,
                    confirmed: subscriber.confirmed,
                    state: 'resubscribed',
                },
                'Welcome back. Your subscription is active again.',
            );
        }

        if (nameValidation.name && !subscriber.name) {
            subscriber.name = nameValidation.name;
            await subscriber.save();
        }

        const state = subscriber.confirmed ? 'active' : 'pending';

        return success(
            {
                email: subscriber.email,
                confirmed: subscriber.confirmed,
                state,
            },
            subscriber.confirmed
                ? 'This email is already subscribed.'
                : 'This email is already subscribed and pending confirmation.',
        );
    } catch (err) {
        return handleError(err, 'Failed to subscribe');
    }
};

/*
API Responses:
- 201: New subscriber created.
- 200: Existing active/pending subscriber returned or unsubscribed record reactivated.
- 400: Invalid email or name value.
- 404: Subscriber lookup race condition after existence check.
- 500: Unexpected server/database error.
*/