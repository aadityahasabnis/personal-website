'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ISubscriber, IApiResponse } from '@/interfaces';

// ===== VALIDATION SCHEMAS =====

const subscribeSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().optional(),
});

const confirmSchema = z.object({
    id: z.string(),
});

const deleteSchema = z.object({
    id: z.string(),
});

type SubscribeInput = z.infer<typeof subscribeSchema>;

// ===== HELPER FUNCTIONS =====

const revalidateSubscriberPaths = (): void => {
    revalidatePath('/admin/subscribers');
    revalidatePath('/admin'); // Dashboard shows subscriber count
};

// ===== SERVER ACTIONS =====

/**
 * Subscribe to newsletter (public action)
 */
export const subscribe = async (data: SubscribeInput): Promise<IApiResponse<void>> => {
    try {
        const parsed = subscribeSchema.safeParse(data);
        if (!parsed.success) {
            return {
                success: false,
                status: 400,
                error: parsed.error.issues[0]?.message ?? 'Invalid input',
            };
        }

        const collection = await getCollection<ISubscriber>(COLLECTIONS.subscribers);

        // Check if already subscribed
        const existing = await collection.findOne({ email: parsed.data.email });

        if (existing) {
            // If previously unsubscribed, resubscribe
            if (existing.unsubscribedAt) {
                await collection.updateOne(
                    { email: parsed.data.email },
                    {
                        $set: {
                            confirmed: false,
                            updatedAt: new Date(),
                        },
                        $unset: { unsubscribedAt: '' },
                    }
                );

                revalidateSubscriberPaths();

                return {
                    success: true,
                    status: 200,
                    message: 'Please check your email to confirm your subscription.',
                };
            }

            return {
                success: false,
                status: 409,
                error: 'This email is already subscribed.',
            };
        }

        // Create new subscriber
        const now = new Date();
        const newSubscriber: Omit<ISubscriber, '_id'> = {
            email: parsed.data.email,
            name: parsed.data.name,
            confirmed: false,
            subscribedAt: now,
            createdAt: now,
            updatedAt: now,
        };

        await collection.insertOne(newSubscriber as ISubscriber);

        // TODO: Send confirmation email

        revalidateSubscriberPaths();

        return {
            success: true,
            status: 201,
            message: 'Please check your email to confirm your subscription.',
        };
    } catch (error) {
        console.error('Subscribe error:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to subscribe. Please try again later.',
        };
    }
};

/**
 * Confirm subscriber (admin action)
 */
export const confirmSubscriber = async (id: string): Promise<IApiResponse<void>> => {
    try {
        const parsed = confirmSchema.safeParse({ id });
        if (!parsed.success) {
            return {
                success: false,
                status: 400,
                error: parsed.error.issues[0]?.message ?? 'Invalid input',
            };
        }

        const collection = await getCollection<ISubscriber>(COLLECTIONS.subscribers);

        const result = await collection.updateOne(
            { _id: new ObjectId(parsed.data.id) },
            {
                $set: {
                    confirmed: true,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return {
                success: false,
                status: 404,
                error: 'Subscriber not found',
            };
        }

        revalidateSubscriberPaths();

        return {
            success: true,
            status: 200,
            message: 'Subscriber confirmed successfully',
        };
    } catch (error) {
        console.error('Confirm subscriber error:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to confirm subscriber',
        };
    }
};

/**
 * Delete subscriber (admin action)
 */
export const deleteSubscriber = async (id: string): Promise<IApiResponse<void>> => {
    try {
        const parsed = deleteSchema.safeParse({ id });
        if (!parsed.success) {
            return {
                success: false,
                status: 400,
                error: parsed.error.issues[0]?.message ?? 'Invalid input',
            };
        }

        const collection = await getCollection<ISubscriber>(COLLECTIONS.subscribers);

        const result = await collection.deleteOne({
            _id: new ObjectId(parsed.data.id),
        });

        if (result.deletedCount === 0) {
            return {
                success: false,
                status: 404,
                error: 'Subscriber not found',
            };
        }

        revalidateSubscriberPaths();

        return {
            success: true,
            status: 200,
            message: 'Subscriber deleted successfully',
        };
    } catch (error) {
        console.error('Delete subscriber error:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to delete subscriber',
        };
    }
};

/**
 * Unsubscribe from newsletter (public action)
 */
export const unsubscribe = async (email: string): Promise<IApiResponse<void>> => {
    try {
        const validated = z.string().email().safeParse(email);
        if (!validated.success) {
            return {
                success: false,
                status: 400,
                error: 'Invalid email address',
            };
        }

        const collection = await getCollection<ISubscriber>(COLLECTIONS.subscribers);

        const result = await collection.updateOne(
            { email: validated.data },
            {
                $set: {
                    unsubscribedAt: new Date(),
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return {
                success: false,
                status: 404,
                error: 'Email not found in our subscriber list',
            };
        }

        revalidateSubscriberPaths();

        return {
            success: true,
            status: 200,
            message: 'You have been unsubscribed successfully',
        };
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to unsubscribe',
        };
    }
};

/**
 * Export subscribers as CSV (admin action)
 */
export const exportSubscribers = async (
    filter: 'all' | 'confirmed' | 'pending' | 'unsubscribed' = 'all'
): Promise<IApiResponse<string>> => {
    try {
        const collection = await getCollection<ISubscriber>(COLLECTIONS.subscribers);

        // Build filter query
        let query: any = {};

        if (filter === 'confirmed') {
            query = { confirmed: true, unsubscribedAt: { $exists: false } };
        } else if (filter === 'pending') {
            query = { confirmed: false };
        } else if (filter === 'unsubscribed') {
            query = { unsubscribedAt: { $exists: true } };
        }

        const subscribers = await collection.find(query).sort({ subscribedAt: -1 }).toArray();

        // Generate CSV
        const headers = ['Email', 'Name', 'Status', 'Subscribed Date', 'Confirmed'];
        const rows = subscribers.map((sub) => [
            sub.email,
            sub.name || '',
            sub.unsubscribedAt ? 'Unsubscribed' : sub.confirmed ? 'Confirmed' : 'Pending',
            new Date(sub.subscribedAt).toLocaleDateString(),
            sub.confirmed ? 'Yes' : 'No',
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        return {
            success: true,
            status: 200,
            data: csv,
        };
    } catch (error) {
        console.error('Export subscribers error:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to export subscribers',
        };
    }
};

/**
 * Bulk delete subscribers (admin action)
 */
export const bulkDeleteSubscribers = async (ids: string[]): Promise<IApiResponse<number>> => {
    try {
        const collection = await getCollection<ISubscriber>(COLLECTIONS.subscribers);

        const objectIds = ids.map((id) => new ObjectId(id));

        const result = await collection.deleteMany({
            _id: { $in: objectIds },
        });

        revalidateSubscriberPaths();

        return {
            success: true,
            status: 200,
            data: result.deletedCount,
            message: `Deleted ${result.deletedCount} subscribers`,
        };
    } catch (error) {
        console.error('Bulk delete subscribers error:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to delete subscribers',
        };
    }
};