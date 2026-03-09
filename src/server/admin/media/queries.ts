'use server';

/**
 * Media Admin Queries
 * 
 * Server queries for fetching media data in the admin panel.
 */

import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IMedia } from '@/interfaces/schema';
import type { ActionResponse, PaginatedResponse } from '../utils/types';
import { success, paginated } from '../utils/response';
import { handleError } from '../utils/errorHandler';

// ===== TYPES =====

export interface AdminMedia {
    _id: string;
    filename: string;
    url: string;
    publicId: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    alt?: string;
    createdAt: string;
}

export interface GetMediaRequest {
    limit?: number;
    offset?: number;
    mimeType?: string;
    search?: string;
}

export interface MediaStats {
    total: number;
    totalSize: number;
    byType: {
        images: number;
        videos: number;
        documents: number;
        other: number;
    };
}

// ===== HELPERS =====

const getMediaCollection = () => getCollection<IMedia>(COLLECTIONS.media);

const serializeMedia = (media: IMedia): AdminMedia => ({
    _id: media._id!.toString(),
    filename: media.filename,
    url: media.url,
    publicId: media.publicId,
    mimeType: media.mimeType,
    size: media.size,
    width: media.width,
    height: media.height,
    alt: media.alt,
    createdAt: media.createdAt.toISOString(),
});

// ===== QUERIES =====

/**
 * Get media with optional filtering and pagination
 */
export const getMedia = async (request: GetMediaRequest = {}): Promise<PaginatedResponse<AdminMedia>> => {
    try {
        const { limit = 50, offset = 0, mimeType, search } = request;
        const collection = await getMediaCollection();

        // Build query
        const query: Record<string, unknown> = {};

        if (mimeType) {
            query.mimeType = { $regex: mimeType, $options: 'i' };
        }

        if (search) {
            query.$or = [
                { filename: { $regex: search, $options: 'i' } },
                { alt: { $regex: search, $options: 'i' } },
            ];
        }

        const [media, total] = await Promise.all([
            collection.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
            collection.countDocuments(query),
        ]);

        return paginated(media.map(serializeMedia), total, limit, offset);
    } catch (err) {
        const errorResult = handleError(err, 'Failed to get media');
        return {
            ...errorResult,
            data: [],
            metadata: { total: 0, limit: 50, offset: 0, hasMore: false },
        };
    }
};

/**
 * Get all media (simplified)
 */
export const getAllMedia = async (): Promise<AdminMedia[]> => {
    try {
        const collection = await getMediaCollection();
        const media = await collection.find({}).sort({ createdAt: -1 }).toArray();
        return media.map(serializeMedia);
    } catch (err) {
        console.error('Failed to get all media:', err);
        return [];
    }
};

/**
 * Get media by ID
 */
export const getMediaById = async (id: string): Promise<ActionResponse<AdminMedia | null>> => {
    try {
        if (!ObjectId.isValid(id)) {
            return success(null);
        }

        const collection = await getMediaCollection();
        const media = await collection.findOne({ _id: new ObjectId(id) });

        if (!media) {
            return success(null);
        }

        return success(serializeMedia(media));
    } catch (err) {
        return handleError(err, 'Failed to get media');
    }
};

/**
 * Get media statistics
 */
export const getMediaStats = async (): Promise<ActionResponse<MediaStats>> => {
    try {
        const collection = await getMediaCollection();

        const [allMedia, images, videos, documents] = await Promise.all([
            collection.find({}).toArray(),
            collection.countDocuments({ mimeType: { $regex: '^image/' } }),
            collection.countDocuments({ mimeType: { $regex: '^video/' } }),
            collection.countDocuments({ 
                mimeType: { 
                    $in: [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                        'text/plain',
                    ]
                }
            }),
        ]);

        const total = allMedia.length;
        const totalSize = allMedia.reduce((sum, m) => sum + (m.size || 0), 0);
        const other = total - images - videos - documents;

        return success({
            total,
            totalSize,
            byType: {
                images,
                videos,
                documents,
                other: other > 0 ? other : 0,
            },
        });
    } catch (err) {
        return handleError(err, 'Failed to get media stats');
    }
};

/**
 * Get images only (for image picker)
 */
export const getImages = async (limit = 100): Promise<ActionResponse<AdminMedia[]>> => {
    try {
        const collection = await getMediaCollection();
        const images = await collection
            .find({ mimeType: { $regex: '^image/' } })
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();

        return success(images.map(serializeMedia));
    } catch (err) {
        return handleError(err, 'Failed to get images');
    }
};

/**
 * Search media by filename or alt text
 */
export const searchMedia = async (query: string): Promise<ActionResponse<AdminMedia[]>> => {
    try {
        const collection = await getMediaCollection();
        const media = await collection
            .find({
                $or: [
                    { filename: { $regex: query, $options: 'i' } },
                    { alt: { $regex: query, $options: 'i' } },
                ],
            })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();

        return success(media.map(serializeMedia));
    } catch (err) {
        return handleError(err, 'Failed to search media');
    }
};
