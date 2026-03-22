import type { IPaginationParams, ISortParams } from '@/interfaces/actionHelper';
import type { MediaFileType, MediaFolder } from '@/constants/mediaConstants';

// ========================================================
// Media Query Types
// ========================================================

export interface IMediaTableQuery {
    query?: string;
    filter?: MediaFilter;
    pagination?: IPaginationParams;
    sort?: ISortParams;
}

export type MediaFilter = 'all' | 'image' | 'video' | 'file' | MediaFolder;

// ========================================================
// Media Row Type (Admin Table)
// ========================================================

export interface IAdminMediaRow {
    id: string;
    fileName: string;
    fileKey: string;
    publicUrl: string;
    fileType: MediaFileType;
    mimeType: string;
    size: number;
    sizeFormatted: string;
    folder: MediaFolder;
    description: string | null;
    altText: string | null;
    tags: string[];
    uploadedAt: string;
    createdAt: string;
    updatedAt: string;
}

// ========================================================
// Media Statistics
// ========================================================

export interface IMediaStats {
    totalFiles: number;
    totalSize: number;
    totalSizeFormatted: string;
    byType: {
        image: { count: number; size: number };
        video: { count: number; size: number };
        file: { count: number; size: number };
    };
    byFolder: Record<MediaFolder, { count: number; size: number }>;
    recentUploads: number;
}

// ========================================================
// Upload Input/Result
// ========================================================

export interface IUploadMediaInput {
    file: File;
    folder?: MediaFolder;
    description?: string;
    altText?: string;
    tags?: string[];
}

export interface IUploadMediaResult {
    id: string;
    fileName: string;
    fileKey: string;
    publicUrl: string;
}

// ========================================================
// Update Input
// ========================================================

export interface IUpdateMediaInput {
    id: string;
    description?: string | null;
    altText?: string | null;
    tags?: string[];
}

// ========================================================
// CDN Service Response Types (Internal)
// ========================================================

export interface ICdnUploadResponse {
    success: boolean;
    file_key: string;
    public_url: string;
    mime_type: string;
    size: number;
    error?: string;
}

export interface ICdnDeleteResponse {
    success: boolean;
    message?: string;
    error?: string;
}
