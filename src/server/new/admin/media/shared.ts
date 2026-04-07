import { MEDIA_FOLDERS, MEDIA_SERVICE_CONFIG, formatBytes, type MediaFileType, type MediaFolder } from '@/constants/mediaConstants';
import { env, isMediaServiceConfigured } from '@/env';
import type { ISortParams } from '@/interfaces/actionHelper';
import { ObjectId } from 'mongodb';
import { buildSort, error } from '../../utils/helper';
import type { IAdminMediaRow, ICdnDeleteResponse, ICdnUploadResponse } from './types';

// ========================================================
// Media Row Document Interface
// ========================================================

export interface IMediaRowDoc {
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

const MAX_CDN_ERROR_BODY_LENGTH = 240;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const asNonEmptyString = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
};

const truncate = (value: string, maxLength: number): string =>
    value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

const parseCdnResponseBody = async (
    response: Response
): Promise<{ payload: Record<string, unknown> | null; rawBody: string }> => {
    const rawBody = await response.text();

    if (!rawBody) {
        return { payload: null, rawBody: '' };
    }

    try {
        const parsed: unknown = JSON.parse(rawBody);
        return { payload: isRecord(parsed) ? parsed : null, rawBody };
    } catch {
        return { payload: null, rawBody };
    }
};

const getCdnErrorMessage = (
    fallback: string,
    status: number,
    payload: Record<string, unknown> | null,
    rawBody: string
): string => {
    const payloadError = payload ? asNonEmptyString(payload.error) : null;
    if (payloadError) return payloadError;

    const payloadMessage = payload ? asNonEmptyString(payload.message) : null;
    if (payloadMessage) return payloadMessage;

    const bodyText = asNonEmptyString(rawBody);
    if (bodyText) {
        return `${fallback} (status ${status}): ${truncate(bodyText, MAX_CDN_ERROR_BODY_LENGTH)}`;
    }

    return `${fallback} (status ${status})`;
};

const toUploadPayload = (payload: Record<string, unknown> | null): ICdnUploadResponse | null => {
    if (!payload || payload.success !== true) return null;

    const fileKey = payload.file_key;
    const publicUrl = payload.public_url;
    const mimeType = payload.mime_type;
    const size = payload.size;

    if (
        typeof fileKey !== 'string' ||
        typeof publicUrl !== 'string' ||
        typeof mimeType !== 'string' ||
        typeof size !== 'number' ||
        !Number.isFinite(size)
    ) {
        return null;
    }

    return {
        success: true,
        file_key: fileKey,
        public_url: publicUrl,
        mime_type: mimeType,
        size,
    };
};

const toDeletePayload = (
    payload: Record<string, unknown> | null,
    successValue: boolean
): ICdnDeleteResponse => {
    const message = payload ? asNonEmptyString(payload.message) : null;
    const errorMessage = payload ? asNonEmptyString(payload.error) : null;

    return {
        success: successValue,
        ...(message ? { message } : {}),
        ...(errorMessage ? { error: errorMessage } : {}),
    };
};

const getTimeoutError = (operation: 'Upload' | 'Delete', timeoutMs: number): Error =>
    new Error(`${operation} request timed out after ${timeoutMs}ms`);

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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), MEDIA_SERVICE_CONFIG.UPLOAD_TIMEOUT);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'x-api-key': env.MEDIA_SERVICE_API_KEY },
                body: formData,
                signal: controller.signal,
            });

            const { payload, rawBody } = await parseCdnResponseBody(response);

            if (!response.ok || payload?.success !== true) {
                throw new Error(getCdnErrorMessage('Upload failed', response.status, payload, rawBody));
            }

            const data = toUploadPayload(payload);
            if (!data) {
                throw new Error('Upload failed: media service returned an invalid response payload');
            }

            return data;
        } catch (err) {
            const normalizedError =
                err instanceof Error && err.name === 'AbortError'
                    ? getTimeoutError('Upload', MEDIA_SERVICE_CONFIG.UPLOAD_TIMEOUT)
                    : err instanceof Error
                      ? err
                      : new Error('Upload failed');

            if (attempt === MEDIA_SERVICE_CONFIG.MAX_RETRIES) {
                throw normalizedError;
            }

            await new Promise((resolve) => setTimeout(resolve, MEDIA_SERVICE_CONFIG.RETRY_DELAY * attempt));
        } finally {
            clearTimeout(timeoutId);
        }
    }

    throw new Error('CDN upload failed');
};

export const deleteFromCdn = async (fileKey: string): Promise<ICdnDeleteResponse> => {
    const url = `${env.MEDIA_SERVICE_BASE_URL}${MEDIA_SERVICE_CONFIG.DELETE_ENDPOINT}`;

    for (let attempt = 1; attempt <= MEDIA_SERVICE_CONFIG.MAX_RETRIES; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), MEDIA_SERVICE_CONFIG.REQUEST_TIMEOUT);

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'x-api-key': env.MEDIA_SERVICE_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ file_key: fileKey }),
                signal: controller.signal,
            });

            const { payload, rawBody } = await parseCdnResponseBody(response);

            if (!response.ok || payload?.success !== true) {
                if (response.status === 404) {
                    return toDeletePayload(payload, false);
                }
                throw new Error(getCdnErrorMessage('Delete failed', response.status, payload, rawBody));
            }

            return toDeletePayload(payload, true);
        } catch (err) {
            const normalizedError =
                err instanceof Error && err.name === 'AbortError'
                    ? getTimeoutError('Delete', MEDIA_SERVICE_CONFIG.REQUEST_TIMEOUT)
                    : err instanceof Error
                      ? err
                      : new Error('Delete failed');

            if (attempt === MEDIA_SERVICE_CONFIG.MAX_RETRIES) {
                throw normalizedError;
            }

            await new Promise((resolve) => setTimeout(resolve, MEDIA_SERVICE_CONFIG.RETRY_DELAY * attempt));
        } finally {
            clearTimeout(timeoutId);
        }
    }

    throw new Error('CDN delete failed');
};

// ========================================================
// Filter & Sort Builders
// ========================================================

const ALLOWED_SORT_FIELDS = new Set(['fileName', 'fileType', 'size', 'folder', 'createdAt', 'updatedAt']);

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
        const q = escapeRegex(query.trim());
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
