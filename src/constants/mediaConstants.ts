// ============================================================
// Media File Types
// ============================================================

export const MEDIA_FILE_TYPES = {
    IMAGE: 'image',
    VIDEO: 'video',
    FILE: 'file',
} as const;

export type MediaFileType = (typeof MEDIA_FILE_TYPES)[keyof typeof MEDIA_FILE_TYPES];

// ============================================================
// Media Folders (Pre-configured)
// ============================================================

export const MEDIA_FOLDERS = {
    ROOT: 'root',
    BLOG: 'blog',
    ARTICLES: 'articles',
    PROJECTS: 'projects',
    GALLERY: 'gallery',
    DOCUMENTS: 'documents',
} as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[keyof typeof MEDIA_FOLDERS];

export const MEDIA_FOLDER_OPTIONS = Object.values(MEDIA_FOLDERS);

// ============================================================
// Media Upload Limits
// ============================================================

export const MEDIA_UPLOAD_LIMITS = {
    // File sizes in bytes
    MAX_IMAGE_SIZE: 100 * 1024 * 1024, // 100 MB
    MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100 MB
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100 MB

    // Counts
    MAX_TAGS_COUNT: 10,
    MAX_TAG_LENGTH: 50,
    MAX_FILENAME_LENGTH: 255,

    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
} as const;

// ============================================================
// Allowed MIME Types
// ============================================================

export const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/avif',
] as const;

export const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/webm',
    'video/x-msvideo',
] as const;

export const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'text/plain',
    'text/csv',
    'application/json',
] as const;

export const ALL_ALLOWED_MIME_TYPES = [
    ...ALLOWED_IMAGE_TYPES,
    ...ALLOWED_VIDEO_TYPES,
    ...ALLOWED_FILE_TYPES,
] as const;

// ============================================================
// Media Service Configuration
// ============================================================

export const MEDIA_SERVICE_CONFIG = {
    // API endpoints
    UPLOAD_ENDPOINT: '/api/media/upload',
    LIST_ENDPOINT: '/api/media/list',
    DELETE_ENDPOINT: '/api/media/delete',
    STATS_ENDPOINT: '/api/media/stats',
    FOLDERS_ENDPOINT: '/api/media/folders',

    // Request timeouts (milliseconds)
    UPLOAD_TIMEOUT: 60000, // 60 seconds
    REQUEST_TIMEOUT: 10000, // 10 seconds

    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
} as const;

// ============================================================
// Helper Functions
// ============================================================

/**
 * Determines file type based on MIME type.
 * 
 * @param mimeType - The MIME type string
 * @returns The media file type category
 */
export function getMediaTypeFromMimeType(mimeType: string): MediaFileType {
    if (ALLOWED_IMAGE_TYPES.includes(mimeType as any)) {
        return MEDIA_FILE_TYPES.IMAGE;
    }
    if (ALLOWED_VIDEO_TYPES.includes(mimeType as any)) {
        return MEDIA_FILE_TYPES.VIDEO;
    }
    return MEDIA_FILE_TYPES.FILE;
}

/**
 * Checks if a MIME type is allowed for upload.
 * 
 * @param mimeType - The MIME type to validate
 * @returns true if allowed, false otherwise
 */
export function isAllowedMimeType(mimeType: string): boolean {
    return ALL_ALLOWED_MIME_TYPES.includes(mimeType as any);
}

/**
 * Gets max file size for a specific file type.
 * 
 * @param fileType - The media file type
 * @returns Maximum allowed size in bytes
 */
export function getMaxFileSizeForType(fileType: MediaFileType): number {
    switch (fileType) {
        case MEDIA_FILE_TYPES.IMAGE:
            return MEDIA_UPLOAD_LIMITS.MAX_IMAGE_SIZE;
        case MEDIA_FILE_TYPES.VIDEO:
            return MEDIA_UPLOAD_LIMITS.MAX_VIDEO_SIZE;
        case MEDIA_FILE_TYPES.FILE:
            return MEDIA_UPLOAD_LIMITS.MAX_FILE_SIZE;
        default:
            return MEDIA_UPLOAD_LIMITS.MAX_FILE_SIZE;
    }
}

/**
 * Formats bytes to human-readable string.
 * 
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1.23 MB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Validates folder name.
 * 
 * @param folder - Folder name to validate
 * @returns true if valid, false otherwise
 */
export function isValidFolder(folder: string): boolean {
    return MEDIA_FOLDER_OPTIONS.includes(folder as MediaFolder) || /^[a-z0-9-]+$/.test(folder);
}
