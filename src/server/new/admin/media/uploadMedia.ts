'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Media from '@/server/models/Media';
import { getMediaTypeFromMimeType, isAllowedMimeType, getMaxFileSizeForType, formatBytes } from '@/constants/mediaConstants';
import { created, error, handleError } from '../../utils/helper';
import { getAdminId } from '../shared';
import { requireMediaService, uploadToCdn } from './shared';
import type { IUploadMediaInput, IUploadMediaResult } from './types';

// ========================================================
// Action: Upload Media
// ========================================================

export const uploadMedia = async (
    input: IUploadMediaInput
): Promise<IApiResponse<IUploadMediaResult>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;
        const adminId = authResult.data;

        const serviceCheck = requireMediaService();
        if (serviceCheck) return serviceCheck;

        if (!input.file) return error('File is required', 400);

        const { file, folder = 'root', description, altText, tags = [] } = input;

        // Validate MIME type
        if (!isAllowedMimeType(file.type)) {
            return error(`File type '${file.type}' is not allowed`, 400);
        }

        const fileType = getMediaTypeFromMimeType(file.type);
        const maxSize = getMaxFileSizeForType(fileType);

        if (file.size > maxSize) {
            return error(`File size exceeds maximum of ${formatBytes(maxSize)}`, 400);
        }

        // Upload to CDN
        const cdnResponse = await uploadToCdn(file, folder, tags);

        await connectDB();

        // Check duplicate
        const existing = await Media.findByFileKey(cdnResponse.file_key);
        if (existing) return error('File already exists', 409);

        // Save to MongoDB
        const mediaDoc = new Media({
            fileKey: cdnResponse.file_key,
            publicUrl: cdnResponse.public_url,
            fileName: cdnResponse.file_key.split('/').pop() || file.name,
            fileType,
            mimeType: cdnResponse.mime_type,
            size: cdnResponse.size,
            folder,
            uploadedBy: adminId,
            ...(description && { description }),
            ...(altText && { altText }),
            ...(tags.length > 0 && { tags }),
        });

        await mediaDoc.save();

        const result: IUploadMediaResult = {
            id: mediaDoc._id.toString(),
            fileName: mediaDoc.fileName,
            fileKey: mediaDoc.fileKey,
            publicUrl: mediaDoc.publicUrl,
        };

        return created(result, 'Media uploaded successfully');
    } catch (err) {
        return handleError(err, 'Failed to upload media');
    }
};

/*
API Responses:
- 201: Media uploaded successfully.
- 400: Invalid input (file type, size, etc.).
- 401: Admin authentication required.
- 409: File already exists.
- 500: Upload failed or database error.
*/
