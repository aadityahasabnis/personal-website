'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Media from '@/server/models/Media';
import { MEDIA_UPLOAD_LIMITS } from '@/constants/mediaConstants';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import { validateObjectId } from './shared';
import type { IUpdateMediaInput } from './types';

// ========================================================
// Action: Update Media Metadata
// ========================================================

export const updateMedia = async (
    input: IUpdateMediaInput
): Promise<IApiResponse<{ updated: boolean }>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!input.id) return error('Media ID is required', 400);
        if (!validateObjectId(input.id)) return error('Invalid media ID', 400);

        const { description, altText, tags } = input;

        // At least one field required
        if (description === undefined && altText === undefined && tags === undefined) {
            return error('At least one field to update is required', 400);
        }

        // Validate lengths
        if (description && description.length > 500) {
            return error('Description cannot exceed 500 characters', 400);
        }
        if (altText && altText.length > 200) {
            return error('Alt text cannot exceed 200 characters', 400);
        }
        if (tags && tags.length > MEDIA_UPLOAD_LIMITS.MAX_TAGS_COUNT) {
            return error(`Cannot exceed ${MEDIA_UPLOAD_LIMITS.MAX_TAGS_COUNT} tags`, 400);
        }

        await connectDB();

        const mediaDoc = await Media.findById(input.id);
        if (!mediaDoc) return error('Media not found', 404);

        // Update fields
        const updates: any = {};
        if (description !== undefined) updates.description = description;
        if (altText !== undefined) updates.altText = altText;
        if (tags !== undefined) updates.tags = tags;

        await mediaDoc.updateMetadata(updates);

        return success({ updated: true }, 'Media updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update media');
    }
};

/*
API Responses:
- 200: Media updated successfully.
- 400: Invalid input or validation error.
- 401: Admin authentication required.
- 404: Media not found.
- 500: Update failed.
*/
