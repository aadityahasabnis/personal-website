'use server';

/**
 * Media Admin Actions
 * 
 * Server actions for managing media files in the admin panel.
 */

import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants/siteConstants';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import type { IMedia } from '@/interfaces/schema';
import type { ActionResponse } from '../utils/types';
import { success, error, notFound } from '../utils/response';
import { handleError } from '../utils/errorHandler';
import { logCreate, logUpdate, logDelete } from '../utils/activityLogger';

// ===== TYPES =====

export interface UploadMediaRequest {
    formData: FormData;
}

export interface UpdateMediaRequest {
    id: string;
    alt?: string;
    filename?: string;
}

export interface DeleteMediaRequest {
    id: string;
}

export interface BulkDeleteMediaRequest {
    ids: string[];
}

// ===== SCHEMAS =====

const updateMediaSchema = z.object({
    id: z.string().min(1),
    alt: z.string().optional(),
    filename: z.string().optional(),
});

// ===== HELPERS =====

const getMediaCollection = () => getCollection<IMedia>(COLLECTIONS.media);

const revalidateMedia = () => {
    revalidatePath('/admin/media');
    revalidatePath('/admin');
};

// ===== ACTIONS =====

/**
 * Upload a new media file
 */
export const uploadMedia = async (formData: FormData): Promise<ActionResponse<IMedia>> => {
    try {
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'portfolio/content';
        const alt = formData.get('alt') as string | null;

        if (!file) {
            return error('No file provided');
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(file, folder);

        // Save to MongoDB
        const collection = await getMediaCollection();
        const media: Omit<IMedia, '_id'> = {
            filename: file.name,
            url: result.secure_url,
            publicId: result.public_id,
            mimeType: file.type,
            size: result.bytes,
            width: result.width,
            height: result.height,
            alt: alt || undefined,
            uploadedBy: new ObjectId(), // TODO: Get from session
            createdAt: new Date(),
        };

        const insertResult = await collection.insertOne(media as IMedia);

        await logCreate('media', file.name, insertResult.insertedId.toString());
        revalidateMedia();

        return success(
            { ...media, _id: insertResult.insertedId } as IMedia,
            'Media uploaded successfully'
        );
    } catch (err) {
        return handleError(err, 'Failed to upload media');
    }
};

/**
 * Update media metadata
 */
export const updateMedia = async (request: UpdateMediaRequest): Promise<ActionResponse<void>> => {
    try {
        const parsed = updateMediaSchema.safeParse(request);
        if (!parsed.success) {
            return error(parsed.error.issues[0]?.message ?? 'Invalid input');
        }

        const { id, alt, filename } = parsed.data;

        if (!ObjectId.isValid(id)) {
            return error('Invalid media ID');
        }

        const collection = await getMediaCollection();
        const media = await collection.findOne({ _id: new ObjectId(id) });

        if (!media) {
            return notFound('Media');
        }

        const updateFields: Partial<IMedia> = {};
        if (alt !== undefined) updateFields.alt = alt;
        if (filename) updateFields.filename = filename;

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );

        await logUpdate('media', media.filename, id);
        revalidateMedia();

        return success(undefined, 'Media updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update media');
    }
};

/**
 * Delete a media file
 */
export const deleteMedia = async (request: DeleteMediaRequest): Promise<ActionResponse<void>> => {
    try {
        const { id } = request;

        if (!ObjectId.isValid(id)) {
            return error('Invalid media ID');
        }

        const collection = await getMediaCollection();
        const media = await collection.findOne({ _id: new ObjectId(id) });

        if (!media) {
            return notFound('Media');
        }

        // Delete from Cloudinary
        await deleteFromCloudinary(media.publicId);

        // Delete from MongoDB
        await collection.deleteOne({ _id: new ObjectId(id) });

        await logDelete('media', media.filename, id);
        revalidateMedia();

        return success(undefined, 'Media deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete media');
    }
};

/**
 * Bulk delete media files
 */
export const bulkDeleteMedia = async (request: BulkDeleteMediaRequest): Promise<ActionResponse<number>> => {
    try {
        const { ids } = request;

        const validIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
        if (validIds.length === 0) {
            return error('No valid media IDs provided');
        }

        const collection = await getMediaCollection();
        const mediaItems = await collection.find({ _id: { $in: validIds } }).toArray();

        // Delete from Cloudinary (don't fail if some deletions fail)
        await Promise.all(
            mediaItems.map(m => deleteFromCloudinary(m.publicId).catch(console.error))
        );

        // Delete from MongoDB
        const result = await collection.deleteMany({ _id: { $in: validIds } });

        revalidateMedia();

        return success(result.deletedCount, `Deleted ${result.deletedCount} media items`);
    } catch (err) {
        return handleError(err, 'Failed to delete media items');
    }
};
