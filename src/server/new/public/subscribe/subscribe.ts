'use server';

import { EMAIL_TYPE, WELCOME_EMAIL_CONTENT } from '@/constants/emailConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subscriber from '@/server/models/Subscriber';
import type { ISubscriberDocument } from '@/server/models/types';
import { created, error, handleError, success } from '../../utils/helper';
import { isEmailConfigured, sendEmailWithRetry } from '../../utils/mail';
import { welcomeEmailTemplate } from '../../utils/mail-templates';
import { isValidSubscriberEmail, normalizeSubscriberEmail } from './shared';
import type { ISubscribeInput, ISubscriptionResult } from './types';

interface ISubscriberLookup {
    _id: ISubscriberDocument['_id'];
    email: string;
    unsubscribedAt: Date | null;
}

const sendWelcomeEmailSafely = async (email: string): Promise<void> => {
    try {
        if (!isEmailConfigured()) return;

        const { html, text } = welcomeEmailTemplate(null);

        await sendEmailWithRetry(
            {
                to: email,
                subject: WELCOME_EMAIL_CONTENT.subject,
                html,
                text,
            },
            EMAIL_TYPE.WELCOME,
        );
    } catch {
        // Welcome email is a non-blocking side effect for subscription success.
    }
};

// ========================================================
// Mutation: Public Subscribe
// ========================================================

export const subscribe = async (
    input: ISubscribeInput,
): Promise<IApiResponse<ISubscriptionResult>> => {
    try {
        const email = normalizeSubscriberEmail(input.email ?? '');
        if (!isValidSubscriberEmail(email)) return error('Invalid email address', 400);

        await connectDB();

        const existing = await Subscriber.findOne({ email })
            .select('_id email unsubscribedAt')
            .lean<ISubscriberLookup | null>();

        if (!existing) {
            try {
                const doc = await Subscriber.create({
                    email,
                    confirmed: true,
                });

                await sendWelcomeEmailSafely(doc.email);

                return created(
                    {
                        email: doc.email,
                        confirmed: true,
                        state: 'created',
                    },
                    'Subscription saved. You will receive updates soon.',
                );
            } catch (err) {
                const maybeDuplicate = err as { code?: number };
                if (maybeDuplicate.code !== 11000) throw err;
            }
        }

        const targetId = existing?._id
            ?? (
                await Subscriber.findOne({ email })
                    .select('_id')
                    .lean<{ _id: ISubscriberDocument['_id'] } | null>()
            )?._id;

        if (!targetId) return error('Subscriber not found', 404);

        const subscriber = await Subscriber.findById(targetId).select('email confirmed unsubscribedAt');
        if (!subscriber) return error('Subscriber not found', 404);

        if (subscriber.unsubscribedAt) {
            await subscriber.resubscribe();
            await sendWelcomeEmailSafely(subscriber.email);

            return success(
                {
                    email: subscriber.email,
                    confirmed: true,
                    state: 'resubscribed',
                },
                'Welcome back. Your subscription is active again.',
            );
        }

        if (!subscriber.confirmed) {
            await subscriber.confirm();
        }

        return success(
            {
                email: subscriber.email,
                confirmed: true,
                state: 'active',
            },
            'This email is already subscribed.',
        );
    } catch (err) {
        return handleError(err, 'Failed to subscribe');
    }
};

/*
API Responses:
- 201: New subscriber created.
- 200: Existing active subscriber returned or unsubscribed record reactivated.
- 400: Invalid email value.
- 404: Subscriber lookup race condition after existence check.
- 500: Unexpected server/database error.
*/