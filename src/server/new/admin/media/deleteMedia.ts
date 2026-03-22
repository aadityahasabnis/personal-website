'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Media from '@/server/models/Media';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import { requireMediaService, deleteFromCdn, validateObjectId } from './shared';

// ========================================================
// Action: Delete Media
// ========================================================

export const deleteMedia = async (id: string): Promise<IApiResponse<{ deleted: boolean }>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!id) return error('Media ID is required', 400);
        if (!validateObjectId(id)) return error('Invalid media ID', 400);

        const serviceCheck = requireMediaService();
        if (serviceCheck) return serviceCheck;

        await connectDB();

        const mediaDoc = await Media.findById(id);
        if (!mediaDoc) return error('Media not found', 404);

        // Delete from CDN (404 is acceptable)
        try {
            await deleteFromCdn(mediaDoc.fileKey);
        } catch (err) {
            // Continue if CDN file doesn't exist
        }

        // Delete from MongoDB
        await Media.deleteOne({ _id: id });

        return success({ deleted: true }, 'Media deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete media');
    }
};

/*
API Responses:
- 200: Media deleted successfully.
- 400: Invalid ID format.
- 401: Admin authentication required.
- 404: Media not found.
- 500: Deletion failed.
*/
