import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants/siteConstants';
import type { IMedia } from '@/interfaces/schema';

/**
 * Get all media for admin
 */
export const getAllMediaForAdmin = async (): Promise<IMedia[]> => {
    try {
        const collection = await getCollection<IMedia>(COLLECTIONS.media);
        return await collection.find({}).sort({ createdAt: -1 }).toArray();
    } catch (error) {
        console.error('Failed to fetch media for admin', error);
        return [];
    }
};

/**
 * Get media by type (images, videos, documents)
 */
export const getMediaByType = async (type: 'image' | 'video' | 'document'): Promise<IMedia[]> => {
    try {
        const collection = await getCollection<IMedia>(COLLECTIONS.media);
        const typePatterns = {
            image: /^image\//,
            video: /^video\//,
            document: /^(application\/pdf|application\/msword|text\/)/,
        };
        return await collection.find({ mimeType: { $regex: typePatterns[type] } }).sort({ createdAt: -1 }).toArray();
    } catch (error) {
        console.error(`Failed to fetch ${type} media`, error);
        return [];
    }
};

/**
 * Get media count
 */
export const getMediaCount = async (): Promise<number> => {
    try {
        const collection = await getCollection<IMedia>(COLLECTIONS.media);
        return await collection.countDocuments();
    } catch (error) {
        console.error('Failed to get media count', error);
        return 0;
    }
};

/**
 * Get total storage used (in bytes)
 */
export const getTotalStorageUsed = async (): Promise<number> => {
    try {
        const collection = await getCollection<IMedia>(COLLECTIONS.media);
        const result = await collection.aggregate([{ $group: { _id: null, total: { $sum: '$size' } } }]).toArray();
        return result[0]?.total || 0;
    } catch (error) {
        console.error('Failed to get total storage', error);
        return 0;
    }
};
