'use server';

/**
 * Subscribers Admin Queries
 * 
 * Server queries for fetching subscriber data in the admin panel.
 */

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ISubscriber } from '@/interfaces/schema';
import type { ActionResponse, PaginatedResponse } from '../utils/types';
import { success, paginated } from '../utils/response';
import { handleError } from '../utils/errorHandler';

// ===== TYPES =====

export interface AdminSubscriber {
    _id: string;
    email: string;
    name?: string;
    confirmed: boolean;
    subscribedAt: string;
    unsubscribedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetSubscribersRequest {
    limit?: number;
    offset?: number;
    filter?: 'all' | 'confirmed' | 'pending' | 'unsubscribed';
    search?: string;
}

export interface SubscriberStats {
    total: number;
    confirmed: number;
    pending: number;
    unsubscribed: number;
}

// ===== HELPERS =====

const getSubscribersCollection = () => getCollection<ISubscriber>(COLLECTIONS.subscribers);

const serializeSubscriber = (subscriber: ISubscriber): AdminSubscriber => ({
    _id: subscriber._id!.toString(),
    email: subscriber.email,
    name: subscriber.name,
    confirmed: subscriber.confirmed,
    subscribedAt: subscriber.subscribedAt.toISOString(),
    unsubscribedAt: subscriber.unsubscribedAt?.toISOString(),
    createdAt: subscriber.createdAt?.toISOString() ?? subscriber.subscribedAt.toISOString(),
    updatedAt: subscriber.updatedAt?.toISOString() ?? subscriber.subscribedAt.toISOString(),
});

// ===== QUERIES =====

/**
 * Get subscribers with optional filtering and pagination
 */
export const getSubscribers = async (request: GetSubscribersRequest = {}): Promise<PaginatedResponse<AdminSubscriber>> => {
    try {
        const { limit = 50, offset = 0, filter = 'all', search } = request;
        const collection = await getSubscribersCollection();

        // Build query
        const query: Record<string, unknown> = {};
        
        if (filter === 'confirmed') {
            query.confirmed = true;
            query.unsubscribedAt = { $exists: false };
        } else if (filter === 'pending') {
            query.confirmed = false;
        } else if (filter === 'unsubscribed') {
            query.unsubscribedAt = { $exists: true };
        }

        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
            ];
        }

        const [subscribers, total] = await Promise.all([
            collection.find(query).sort({ subscribedAt: -1 }).skip(offset).limit(limit).toArray(),
            collection.countDocuments(query),
        ]);

        return paginated(subscribers.map(serializeSubscriber), total, limit, offset);
    } catch (err) {
        const errorResult = handleError(err, 'Failed to get subscribers');
        return {
            ...errorResult,
            data: [],
            metadata: { total: 0, limit: 50, offset: 0, hasMore: false },
        };
    }
};

/**
 * Get all subscribers (simplified)
 */
export const getAllSubscribers = async (): Promise<AdminSubscriber[]> => {
    try {
        const collection = await getSubscribersCollection();
        const subscribers = await collection.find({}).sort({ subscribedAt: -1 }).toArray();
        return subscribers.map(serializeSubscriber);
    } catch (err) {
        console.error('Failed to get all subscribers:', err);
        return [];
    }
};

/**
 * Get subscriber statistics
 */
export const getSubscriberStats = async (): Promise<ActionResponse<SubscriberStats>> => {
    try {
        const collection = await getSubscribersCollection();

        const [total, confirmed, pending, unsubscribed] = await Promise.all([
            collection.countDocuments({}),
            collection.countDocuments({ confirmed: true, unsubscribedAt: { $exists: false } }),
            collection.countDocuments({ confirmed: false }),
            collection.countDocuments({ unsubscribedAt: { $exists: true } }),
        ]);

        return success({
            total,
            confirmed,
            pending,
            unsubscribed,
        });
    } catch (err) {
        return handleError(err, 'Failed to get subscriber stats');
    }
};

/**
 * Search subscribers by email or name
 */
export const searchSubscribers = async (query: string): Promise<ActionResponse<AdminSubscriber[]>> => {
    try {
        const collection = await getSubscribersCollection();
        const subscribers = await collection
            .find({
                $or: [
                    { email: { $regex: query, $options: 'i' } },
                    { name: { $regex: query, $options: 'i' } },
                ],
            })
            .sort({ subscribedAt: -1 })
            .limit(50)
            .toArray();

        return success(subscribers.map(serializeSubscriber));
    } catch (err) {
        return handleError(err, 'Failed to search subscribers');
    }
};
