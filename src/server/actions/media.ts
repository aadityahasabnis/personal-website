'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import type { IMedia, IApiResponse } from '@/interfaces';
import { createErrorResponse, createSuccessResponse, notFoundError } from '@/server/lib/action-utils';

// ===== SCHEMAS =====

const uploadSchema = z.object({
    filename: z.string().min(1),
    folder: z.string().default('portfolio/content'),
    alt: z.string().optional(),
});

const updateMediaSchema = z.object({
    id: z.string().min(1),
    alt: z.string().optional(),
    filename: z.string().optional(),
});

// ===== HELPERS =====

const getMediaCollection = () => getCollection<IMedia>(COLLECTIONS.media);
const revalidate = () => { revalidatePath('/admin/media'); revalidatePath('/admin'); };

// ===== ADMIN ACTIONS =====

export const uploadMedia = async (formData: FormData): Promise<IApiResponse<IMedia>> => {
    try {
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'portfolio/content';
        const alt = formData.get('alt') as string | null;

        if (!file) return createErrorResponse('No file provided');

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
        revalidate();

        return createSuccessResponse({ ...media, _id: insertResult.insertedId } as IMedia, 'Media uploaded successfully');
    } catch (error) {
        console.error('Upload media error:', error);
        return createErrorResponse('Failed to upload media', 500);
    }
};

export const updateMedia = async (data: z.infer<typeof updateMediaSchema>): Promise<IApiResponse<void>> => {
    try {
        const parsed = updateMediaSchema.safeParse(data);
        if (!parsed.success) return createErrorResponse(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getMediaCollection();
        const updateFields: Partial<IMedia> = {};
        if (parsed.data.alt !== undefined) updateFields.alt = parsed.data.alt;
        if (parsed.data.filename) updateFields.filename = parsed.data.filename;

        const result = await collection.updateOne(
            { _id: new ObjectId(parsed.data.id) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) return notFoundError('Media');
        revalidate();
        return createSuccessResponse(undefined, 'Media updated successfully');
    } catch (error) {
        console.error('Update media error:', error);
        return createErrorResponse('Failed to update media', 500);
    }
};

export const deleteMedia = async (id: string): Promise<IApiResponse<void>> => {
    try {
        const collection = await getMediaCollection();
        const media = await collection.findOne({ _id: new ObjectId(id) });

        if (!media) return notFoundError('Media');

        // Delete from Cloudinary
        await deleteFromCloudinary(media.publicId);

        // Delete from MongoDB
        await collection.deleteOne({ _id: new ObjectId(id) });
        revalidate();

        return createSuccessResponse(undefined, 'Media deleted successfully');
    } catch (error) {
        console.error('Delete media error:', error);
        return createErrorResponse('Failed to delete media', 500);
    }
};

export const bulkDeleteMedia = async (ids: string[]): Promise<IApiResponse<number>> => {
    try {
        const collection = await getMediaCollection();
        const mediaItems = await collection.find({ _id: { $in: ids.map(id => new ObjectId(id)) } }).toArray();

        // Delete from Cloudinary
        await Promise.all(mediaItems.map(m => deleteFromCloudinary(m.publicId).catch(console.error)));

        // Delete from MongoDB
        const result = await collection.deleteMany({ _id: { $in: ids.map(id => new ObjectId(id)) } });
        revalidate();

        return createSuccessResponse(result.deletedCount, `Deleted ${result.deletedCount} media items`);
    } catch (error) {
        console.error('Bulk delete media error:', error);
        return createErrorResponse('Failed to delete media items', 500);
    }
};

export const getMediaById = async (id: string): Promise<IApiResponse<IMedia | null>> => {
    try {
        const collection = await getMediaCollection();
        const media = await collection.findOne({ _id: new ObjectId(id) });
        return createSuccessResponse(media);
    } catch (error) {
        console.error('Get media error:', error);
        return createErrorResponse('Failed to get media', 500);
    }
};
