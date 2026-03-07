'use server';

/**
 * Subscribers Admin Actions
 * 
 * Server actions for managing newsletter subscribers in the admin panel.
 */

import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ISubscriber } from '@/interfaces';
import type { ActionResponse } from '../utils/types';
import { success, error, notFound } from '../utils/response';
import { handleError } from '../utils/errorHandler';
import { logCreate, logUpdate, logDelete, logExport } from '../utils/activityLogger';

// ===== TYPES =====

export interface ConfirmSubscriberRequest {
    id: string;
}

export interface DeleteSubscriberRequest {
    id: string;
}

export interface BulkDeleteSubscribersRequest {
    ids: string[];
}

export interface ExportSubscribersRequest {
    filter?: 'all' | 'confirmed' | 'pending' | 'unsubscribed';
}

export interface AddSubscriberRequest {
    email: string;
    name?: string;
    confirmed?: boolean;
}

// ===== SCHEMAS =====

const addSubscriberSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().optional(),
    confirmed: z.boolean().optional().default(false),
});

// ===== HELPERS =====

const getSubscribersCollection = () => getCollection<ISubscriber>(COLLECTIONS.subscribers);

const revalidateSubscribers = () => {
    revalidatePath('/admin/subscribers');
    revalidatePath('/admin');
};

// ===== ACTIONS =====

/**
 * Add a new subscriber manually
 */
export const addSubscriber = async (request: AddSubscriberRequest): Promise<ActionResponse<{ id: string }>> => {
    try {
        const parsed = addSubscriberSchema.safeParse(request);
        if (!parsed.success) {
            return error(parsed.error.issues[0]?.message ?? 'Invalid input');
        }

        const { email, name, confirmed } = parsed.data;
        const collection = await getSubscribersCollection();

        // Check for existing subscriber
        const existing = await collection.findOne({ email });
        if (existing) {
            return error('This email is already subscribed');
        }

        const now = new Date();
        const result = await collection.insertOne({
            email,
            name,
            confirmed,
            subscribedAt: now,
            createdAt: now,
            updatedAt: now,
        } as ISubscriber);

        await logCreate('subscriber', email, result.insertedId.toString());
        revalidateSubscribers();

        return success({ id: result.insertedId.toString() }, 'Subscriber added successfully');
    } catch (err) {
        return handleError(err, 'Failed to add subscriber');
    }
};

/**
 * Confirm a subscriber
 */
export const confirmSubscriber = async (request: ConfirmSubscriberRequest): Promise<ActionResponse<void>> => {
    try {
        const { id } = request;

        if (!ObjectId.isValid(id)) {
            return error('Invalid subscriber ID');
        }

        const collection = await getSubscribersCollection();
        const subscriber = await collection.findOne({ _id: new ObjectId(id) });

        if (!subscriber) {
            return notFound('Subscriber');
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { confirmed: true, updatedAt: new Date() } }
        );

        await logUpdate('subscriber', subscriber.email, id, { action: 'confirmed' });
        revalidateSubscribers();

        return success(undefined, 'Subscriber confirmed successfully');
    } catch (err) {
        return handleError(err, 'Failed to confirm subscriber');
    }
};

/**
 * Delete a subscriber
 */
export const deleteSubscriber = async (request: DeleteSubscriberRequest): Promise<ActionResponse<void>> => {
    try {
        const { id } = request;

        if (!ObjectId.isValid(id)) {
            return error('Invalid subscriber ID');
        }

        const collection = await getSubscribersCollection();
        const subscriber = await collection.findOne({ _id: new ObjectId(id) });

        if (!subscriber) {
            return notFound('Subscriber');
        }

        await collection.deleteOne({ _id: new ObjectId(id) });

        await logDelete('subscriber', subscriber.email, id);
        revalidateSubscribers();

        return success(undefined, 'Subscriber deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete subscriber');
    }
};

/**
 * Bulk delete subscribers
 */
export const bulkDeleteSubscribers = async (request: BulkDeleteSubscribersRequest): Promise<ActionResponse<number>> => {
    try {
        const { ids } = request;

        const validIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
        if (validIds.length === 0) {
            return error('No valid subscriber IDs provided');
        }

        const collection = await getSubscribersCollection();
        const result = await collection.deleteMany({ _id: { $in: validIds } });

        revalidateSubscribers();

        return success(result.deletedCount, `Deleted ${result.deletedCount} subscribers`);
    } catch (err) {
        return handleError(err, 'Failed to delete subscribers');
    }
};

/**
 * Export subscribers to CSV
 */
export const exportSubscribers = async (request: ExportSubscribersRequest = {}): Promise<ActionResponse<string>> => {
    try {
        const { filter = 'all' } = request;
        const collection = await getSubscribersCollection();

        // Build query based on filter
        const query: Record<string, unknown> = 
            filter === 'confirmed' ? { confirmed: true, unsubscribedAt: { $exists: false } }
            : filter === 'pending' ? { confirmed: false }
            : filter === 'unsubscribed' ? { unsubscribedAt: { $exists: true } }
            : {};

        const subscribers = await collection.find(query).sort({ subscribedAt: -1 }).toArray();

        // Generate CSV
        const headers = ['Email', 'Name', 'Status', 'Subscribed Date', 'Confirmed'];
        const rows = subscribers.map(sub => [
            sub.email,
            sub.name || '',
            sub.unsubscribedAt ? 'Unsubscribed' : sub.confirmed ? 'Confirmed' : 'Pending',
            new Date(sub.subscribedAt).toLocaleDateString(),
            sub.confirmed ? 'Yes' : 'No',
        ]);

        const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');

        await logExport('subscriber', { filter, count: subscribers.length });

        return success(csv);
    } catch (err) {
        return handleError(err, 'Failed to export subscribers');
    }
};

/**
 * Resubscribe a previously unsubscribed email
 */
export const resubscribe = async (email: string): Promise<ActionResponse<void>> => {
    try {
        const emailSchema = z.string().email();
        const parsed = emailSchema.safeParse(email);
        if (!parsed.success) {
            return error('Invalid email address');
        }

        const collection = await getSubscribersCollection();
        const subscriber = await collection.findOne({ email });

        if (!subscriber) {
            return notFound('Subscriber');
        }

        await collection.updateOne(
            { email },
            { 
                $set: { confirmed: false, updatedAt: new Date() },
                $unset: { unsubscribedAt: '' }
            }
        );

        await logUpdate('subscriber', email, subscriber._id?.toString(), { action: 'resubscribed' });
        revalidateSubscribers();

        return success(undefined, 'Resubscribed successfully');
    } catch (err) {
        return handleError(err, 'Failed to resubscribe');
    }
};
