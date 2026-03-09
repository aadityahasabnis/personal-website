'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ISubscriber } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import { createErrorResponse, createSuccessResponse, notFoundError } from '@/server/lib/action-utils';

// ===== SCHEMAS =====

const subscribeSchema = z.object({ email: z.string().email('Invalid email address'), name: z.string().optional() });

type SubscribeInput = z.infer<typeof subscribeSchema>;

// ===== HELPERS =====

const getSubscribersCollection = () => getCollection<ISubscriber>(COLLECTIONS.subscribers);
const revalidate = () => { revalidatePath('/admin/subscribers'); revalidatePath('/admin'); };

// ===== PUBLIC ACTIONS =====

export const subscribe = async (data: SubscribeInput): Promise<IApiResponse<void>> => {
    try {
        const parsed = subscribeSchema.safeParse(data);
        if (!parsed.success) return createErrorResponse(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getSubscribersCollection();
        const existing = await collection.findOne({ email: parsed.data.email });

        if (existing) {
            if (existing.unsubscribedAt) {
                await collection.updateOne(
                    { email: parsed.data.email },
                    { $set: { confirmed: false, updatedAt: new Date() }, $unset: { unsubscribedAt: '' } }
                );
                revalidate();
                return createSuccessResponse(undefined, 'Please check your email to confirm your subscription.');
            }
            return { success: false, status: 409, error: 'This email is already subscribed.' };
        }

        const now = new Date();
        await collection.insertOne({
            email: parsed.data.email,
            name: parsed.data.name,
            confirmed: false,
            subscribedAt: now,
            createdAt: now,
            updatedAt: now,
        } as ISubscriber);

        revalidate();
        return { success: true, status: 201, message: 'Please check your email to confirm your subscription.' };
    } catch (error) {
        console.error('Subscribe error:', error);
        return createErrorResponse('Failed to subscribe. Please try again later.', 500);
    }
};

export const unsubscribe = async (email: string): Promise<IApiResponse<void>> => {
    try {
        const validated = z.string().email().safeParse(email);
        if (!validated.success) return createErrorResponse('Invalid email address');

        const collection = await getSubscribersCollection();
        const result = await collection.updateOne(
            { email: validated.data },
            { $set: { unsubscribedAt: new Date(), updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) return notFoundError('Email not found in our subscriber list');

        revalidate();
        return createSuccessResponse(undefined, 'You have been unsubscribed successfully');
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return createErrorResponse('Failed to unsubscribe', 500);
    }
};

// ===== ADMIN ACTIONS =====

export const confirmSubscriber = async (id: string): Promise<IApiResponse<void>> => {
    try {
        const collection = await getSubscribersCollection();
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { confirmed: true, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) return notFoundError('Subscriber');
        revalidate();
        return createSuccessResponse(undefined, 'Subscriber confirmed successfully');
    } catch (error) {
        console.error('Confirm subscriber error:', error);
        return createErrorResponse('Failed to confirm subscriber', 500);
    }
};

export const deleteSubscriber = async (id: string): Promise<IApiResponse<void>> => {
    try {
        const collection = await getSubscribersCollection();
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) return notFoundError('Subscriber');
        revalidate();
        return createSuccessResponse(undefined, 'Subscriber deleted successfully');
    } catch (error) {
        console.error('Delete subscriber error:', error);
        return createErrorResponse('Failed to delete subscriber', 500);
    }
};

export const exportSubscribers = async (
    filter: 'all' | 'confirmed' | 'pending' | 'unsubscribed' = 'all'
): Promise<IApiResponse<string>> => {
    try {
        const collection = await getSubscribersCollection();

        const query: Record<string, unknown> = filter === 'confirmed' ? { confirmed: true, unsubscribedAt: { $exists: false } }
            : filter === 'pending' ? { confirmed: false }
            : filter === 'unsubscribed' ? { unsubscribedAt: { $exists: true } }
            : {};

        const subscribers = await collection.find(query).sort({ subscribedAt: -1 }).toArray();

        const headers = ['Email', 'Name', 'Status', 'Subscribed Date', 'Confirmed'];
        const rows = subscribers.map(sub => [
            sub.email,
            sub.name || '',
            sub.unsubscribedAt ? 'Unsubscribed' : sub.confirmed ? 'Confirmed' : 'Pending',
            new Date(sub.subscribedAt).toLocaleDateString(),
            sub.confirmed ? 'Yes' : 'No',
        ]);

        const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
        return createSuccessResponse(csv);
    } catch (error) {
        console.error('Export subscribers error:', error);
        return createErrorResponse('Failed to export subscribers', 500);
    }
};

export const bulkDeleteSubscribers = async (ids: string[]): Promise<IApiResponse<number>> => {
    try {
        const collection = await getSubscribersCollection();
        const result = await collection.deleteMany({ _id: { $in: ids.map(id => new ObjectId(id)) } });

        revalidate();
        return createSuccessResponse(result.deletedCount, `Deleted ${result.deletedCount} subscribers`);
    } catch (error) {
        console.error('Bulk delete subscribers error:', error);
        return createErrorResponse('Failed to delete subscribers', 500);
    }
};
