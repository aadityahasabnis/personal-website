import { env, isMediaServiceConfigured } from '@/env';
import { MEDIA_SERVICE_CONFIG, formatBytes } from '@/constants/mediaConstants';
import { MEDIA_FOLDERS, type MediaFolder, type MediaFileType } from '@/constants/mediaConstants';
import type { ISortParams } from '@/interfaces/actionHelper';
import { ObjectId } from 'mongodb';
import { buildSort, error } from '../../utils/helper';
import type { IAdminMediaRow, ICdnUploadResponse, ICdnDeleteResponse } from './types';

// ========================================================
// Media Row Document Interface
// ========================================================

interface IMediaRowDoc {
    _id: ObjectId;
    fileName: string;
    fileKey: string;
    publicUrl: string;
    fileType: MediaFileType;
    mimeType: string;
    size: number;
    folder: MediaFolder;
    description?: string | null;
    altText?: string | null;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

// ========================================================
// Configuration Check
// ========================================================

export const requireMediaService = () => {
    if (!isMediaServiceConfigured()) {
        return error(
            'Media service not configured. Please set MEDIA_SERVICE_BASE_URL and MEDIA_SERVICE_API_KEY.',
            500
        );
    }
    return null;
};

// ========================================================
// CDN Service Helpers
// ========================================================

export const uploadToCdn = async (
    file: File,
    folder: MediaFolder,
    tags: string[] = []
): Promise<ICdnUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    if (tags.length > 0) formData.append('tags', tags.join(','));

    const url = `${env.MEDIA_SERVICE_BASE_URL}${MEDIA_SERVICE_CONFIG.UPLOAD_ENDPOINT}`;

    for (let attempt = 1; attempt <= MEDIA_SERVICE_CONFIG.MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), MEDIA_SERVICE_CONFIG.UPLOAD_TIMEOUT);

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'x-api-key': env.MEDIA_SERVICE_API_KEY },
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const data = (await response.json()) as ICdnUploadResponse;

            if (!response.ok || !data.success) {
                throw new Error(data.error || `Upload failed with status ${response.status}`);
            }

            return data;
        } catch (err) {
            if (attempt === MEDIA_SERVICE_CONFIG.MAX_RETRIES) throw err;
            await new Promise((resolve) => setTimeout(resolve, MEDIA_SERVICE_CONFIG.RETRY_DELAY * attempt));
        }
    }

    throw new Error('CDN upload failed');
};

export const deleteFromCdn = async (fileKey: string): Promise<ICdnDeleteResponse> => {
    const url = `${env.MEDIA_SERVICE_BASE_URL}${MEDIA_SERVICE_CONFIG.DELETE_ENDPOINT}`;

    for (let attempt = 1; attempt <= MEDIA_SERVICE_CONFIG.MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), MEDIA_SERVICE_CONFIG.REQUEST_TIMEOUT);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'x-api-key': env.MEDIA_SERVICE_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ file_key: fileKey }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const data = (await response.json()) as ICdnDeleteResponse;

            if (!response.ok || !data.success) {
                if (response.status === 404) return data; // File not found is OK
                throw new Error(data.error || `Delete failed with status ${response.status}`);
            }

            return data;
        } catch (err) {
            if (attempt === MEDIA_SERVICE_CONFIG.MAX_RETRIES) throw err;
            await new Promise((resolve) => setTimeout(resolve, MEDIA_SERVICE_CONFIG.RETRY_DELAY * attempt));
        }
    }

    throw new Error('CDN delete failed');
};

// ========================================================
// Filter & Sort Builders
// ========================================================

const ALLOWED_SORT_FIELDS = new Set(['fileName', 'fileType', 'size', 'folder', 'createdAt', 'updatedAt']);

export const buildMediaMatch = (filter: string = 'all', query?: string): Record<string, unknown> => {
    const match: Record<string, unknown> = {};

    // Filter by type or folder
    if (filter === 'image' || filter === 'video' || filter === 'file') {
        match.fileType = filter;
    } else if (filter !== 'all' && Object.values(MEDIA_FOLDERS).includes(filter as MediaFolder)) {
        match.folder = filter; // Filter by folder name
    }

    // Search by filename or tags
    if (query?.trim()) {
        const q = query.trim();
        match.$or = [
            { fileName: { $regex: q, $options: 'i' } },
            { tags: { $regex: q, $options: 'i' } },
        ];
    }

    return match;
};

export const buildMediaSort = (sort?: ISortParams): Record<string, 1 | -1> => {
    if (!sort?.sortBy || !ALLOWED_SORT_FIELDS.has(sort.sortBy)) {
        return { createdAt: -1 };
    }
    return buildSort(sort, { createdAt: -1 });
};

// ========================================================
// Row Transformer
// ========================================================

export const toAdminMediaRow = (doc: IMediaRowDoc): IAdminMediaRow => ({
    id: doc._id.toString(),
    fileName: doc.fileName,
    fileKey: doc.fileKey,
    publicUrl: doc.publicUrl,
    fileType: doc.fileType,
    mimeType: doc.mimeType,
    size: doc.size,
    sizeFormatted: formatBytes(doc.size),
    folder: doc.folder,
    description: doc.description ?? null,
    altText: doc.altText ?? null,
    tags: doc.tags ?? [],
    uploadedAt: doc.createdAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
});

// ========================================================
// Validation Helpers
// ========================================================

export const validateObjectId = (id: string): boolean => ObjectId.isValid(id);
