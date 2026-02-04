import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ISubscriber } from '@/interfaces';

/**
 * Get all subscribers for admin
 */
export const getAllSubscribersForAdmin = async (): Promise<ISubscriber[]> => {
    try {
        const collection = await getCollection<ISubscriber>(COLLECTIONS.subscribers);

        const subscribers = await collection
            .find({})
            .sort({ subscribedAt: -1 })
            .toArray();

        return subscribers;
    } catch (error) {
        console.error('Failed to fetch subscribers for admin', error);
        return [];
    }
};

/**
 * Get confirmed subscribers only
 */
export const getConfirmedSubscribers = async (): Promise<ISubscriber[]> => {
    try {
        const collection = await getCollection<ISubscriber>(COLLECTIONS.subscribers);

        const subscribers = await collection
            .find({ confirmed: true, unsubscribedAt: { $exists: false } })
            .sort({ subscribedAt: -1 })
            .toArray();

        return subscribers;
    } catch (error) {
        console.error('Failed to fetch confirmed subscribers', error);
        return [];
    }
};

/**
 * Get subscriber by email
 */
export const getSubscriberByEmail = async (email: string): Promise<ISubscriber | null> => {
    try {
        const collection = await getCollection<ISubscriber>(COLLECTIONS.subscribers);
        return await collection.findOne({ email });
    } catch (error) {
        console.error(`Failed to fetch subscriber: ${email}`, error);
        return null;
    }
};

/**
 * Get subscriber count
 */
export const getSubscriberCount = async (): Promise<number> => {
    try {
        const collection = await getCollection<ISubscriber>(COLLECTIONS.subscribers);
        return await collection.countDocuments({ confirmed: true, unsubscribedAt: { $exists: false } });
    } catch (error) {
        console.error('Failed to get subscriber count', error);
        return 0;
    }
};
