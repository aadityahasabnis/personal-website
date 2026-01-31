'use server';

import { z } from 'zod';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { ISubscriber, IApiResponse } from '@/interfaces';

const subscribeSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    name: z.string().min(1).max(100).optional(),
});

/**
 * Subscribe to newsletter
 */
export const subscribe = async (
    formData: FormData
): Promise<IApiResponse<void>> => {
    try {
        // Validate input
        const parsed = subscribeSchema.safeParse({
            email: formData.get('email'),
            name: formData.get('name'),
        });

        if (!parsed.success) {
            return {
                success: false,
                status: 400,
                error: parsed.error.issues[0]?.message ?? 'Invalid input',
            };
        }

        const { email, name } = parsed.data;
        const collection = await getCollection<ISubscriber>(COLLECTIONS.subscribers);

        // Check if already subscribed
        const existing = await collection.findOne({ email });
        if (existing) {
            if (existing.unsubscribedAt) {
                // Re-subscribe
                await collection.updateOne(
                    { email },
                    {
                        $set: { subscribedAt: new Date(), confirmed: false },
                        $unset: { unsubscribedAt: '' },
                    }
                );
                return {
                    success: true,
                    status: 200,
                    message: 'Welcome back! You have been re-subscribed.',
                };
            }
            return {
                success: false,
                status: 400,
                error: 'You are already subscribed.',
            };
        }

        // Create new subscriber
        await collection.insertOne({
            email,
            name: name ?? undefined,
            confirmed: false,
            subscribedAt: new Date(),
        });

        return {
            success: true,
            status: 201,
            message: 'Thanks for subscribing!',
        };
    } catch (error) {
        console.error('Failed to subscribe:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to subscribe. Please try again.',
        };
    }
};

/**
 * Unsubscribe from newsletter
 */
export const unsubscribe = async (email: string): Promise<IApiResponse<void>> => {
    try {
        if (!VALIDATION.email.pattern.test(email)) {
            return {
                success: false,
                status: 400,
                error: 'Invalid email address',
            };
        }

        const collection = await getCollection<ISubscriber>(COLLECTIONS.subscribers);

        const result = await collection.updateOne(
            { email },
            { $set: { unsubscribedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return {
                success: false,
                status: 404,
                error: 'Email not found',
            };
        }

        return {
            success: true,
            status: 200,
            message: 'You have been unsubscribed.',
        };
    } catch (error) {
        console.error('Failed to unsubscribe:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to unsubscribe. Please try again.',
        };
    }
};
