import type { MediaFileType } from '@/constants/mediaConstants';
import type { Types } from 'mongoose';

// ============================================================
// Media Interface
// Represents a file uploaded to the CDN service
// ============================================================

export interface IMedia {
    _id?: Types.ObjectId;
    fileKey: string; // Unique key in R2 storage (e.g., "images/blog/123-abc-cat.png")
    publicUrl: string; // Full CDN URL
    fileName: string; // Original filename
    fileType: MediaFileType; // 'image' | 'video' | 'file'
    mimeType: string; // 'image/png', 'video/mp4', etc.
    size: number; // File size in bytes
    folder: string; // Folder/category
    tags?: string[]; // Optional tags for organization
    uploadedBy: Types.ObjectId; // Reference to Admin who uploaded
    description?: string | null; // Optional description
    altText?: string | null; // Alt text for images (accessibility)
    width?: number | null; // Image/video width (pixels)
    height?: number | null; // Image/video height (pixels)
    duration?: number | null; // Video duration (seconds)
    createdAt?: Date;
    updatedAt?: Date;
}
