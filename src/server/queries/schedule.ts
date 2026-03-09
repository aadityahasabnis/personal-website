import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants/siteConstants';
import type { IContent } from '@/interfaces/schema';

/**
 * Get all scheduled content for admin
 */
export const getScheduledContentForAdmin = async (): Promise<IContent[]> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);
        return await collection
            .find({ scheduledAt: { $exists: true }, published: false })
            .sort({ scheduledAt: 1 })
            .toArray();
    } catch (error) {
        console.error('Failed to fetch scheduled content', error);
        return [];
    }
};

/**
 * Get content ready to be published (scheduled date has passed)
 */
export const getContentReadyToPublish = async (): Promise<IContent[]> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);
        return await collection
            .find({ scheduledAt: { $lte: new Date() }, published: false })
            .toArray();
    } catch (error) {
        console.error('Failed to fetch content ready to publish', error);
        return [];
    }
};

/**
 * Get scheduled content count
 */
export const getScheduledCount = async (): Promise<number> => {
    try {
        const collection = await getCollection<IContent>(COLLECTIONS.content);
        return await collection.countDocuments({ scheduledAt: { $exists: true }, published: false });
    } catch (error) {
        console.error('Failed to get scheduled count', error);
        return 0;
    }
};
