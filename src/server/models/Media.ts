import { MEDIA_FILE_TYPES, MEDIA_UPLOAD_LIMITS } from '@/constants/mediaConstants';
import type { MediaFileType } from '@/constants/mediaConstants';
import mongoose, { Model, Schema } from 'mongoose';
import type { IMediaDocument } from './types';

// ============================================================
// Media Schema
// Stores metadata for all files uploaded to the CDN service
// Actual files are stored in Cloudflare R2
// ============================================================

const MediaSchema = new Schema<IMediaDocument>(
    {
        fileKey: {
            type: String,
            required: [true, 'File key is required'],
            trim: true,
            unique: true,
            index: true,
        },
        publicUrl: {
            type: String,
            required: [true, 'Public URL is required'],
            trim: true,
        },
        fileName: {
            type: String,
            required: [true, 'File name is required'],
            trim: true,
            maxlength: [MEDIA_UPLOAD_LIMITS.MAX_FILENAME_LENGTH, 'Filename cannot exceed 255 characters'],
        },
        fileType: {
            type: String,
            required: [true, 'File type is required'],
            enum: {
                values: Object.values(MEDIA_FILE_TYPES),
                message: 'File type must be image, video, or file',
            },
        },
        mimeType: {
            type: String,
            required: [true, 'MIME type is required'],
            trim: true,
        },
        size: {
            type: Number,
            required: [true, 'File size is required'],
            min: [0, 'File size cannot be negative'],
        },
        folder: {
            type: String,
            required: [true, 'Folder is required'],
            trim: true,
            lowercase: true,
            default: 'root',
        },
        tags: {
            type: [String],
            default: [],
            validate: {
                validator: function (tags: string[]) {
                    return tags.length <= MEDIA_UPLOAD_LIMITS.MAX_TAGS_COUNT;
                },
                message: `Cannot exceed ${MEDIA_UPLOAD_LIMITS.MAX_TAGS_COUNT} tags`,
            },
        },
        description: {
            type: String,
            default: null,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        altText: {
            type: String,
            default: null,
            trim: true,
            maxlength: [200, 'Alt text cannot exceed 200 characters'],
        },
        width: {
            type: Number,
            default: null,
            min: [0, 'Width cannot be negative'],
        },
        height: {
            type: Number,
            default: null,
            min: [0, 'Height cannot be negative'],
        },
        duration: {
            type: Number,
            default: null,
            min: [0, 'Duration cannot be negative'],
        },
    },
    {
        timestamps: true,
        collection: 'media',
    }
);

// ============================================================
// Indexes
// Optimized for common query patterns
// ============================================================

// Primary queries: list by type, folder, upload date
MediaSchema.index({ fileType: 1, folder: 1, createdAt: -1 });
MediaSchema.index({ fileType: 1, createdAt: -1 });
MediaSchema.index({ folder: 1, createdAt: -1 });

// Admin queries: list user's uploads
MediaSchema.index({ uploadedBy: 1, createdAt: -1 });

// Search by tags
MediaSchema.index({ tags: 1, createdAt: -1 });

// Stats aggregation
MediaSchema.index({ fileType: 1, size: 1 });
MediaSchema.index({ folder: 1, size: 1 });

// ============================================================
// Static Methods
// ============================================================

/**
 * Find media by file key.
 * 
 * @param fileKey - The unique file key from CDN
 * @returns Media document or null
 */
MediaSchema.statics.findByFileKey = async function (fileKey: string) {
    return this.findOne({ fileKey }).lean();
};

/**
 * List media with filters and pagination.
 * 
 * @param options - Filter and pagination options
 * @returns Paginated media results
 */
MediaSchema.statics.listMedia = async function (options: {
    fileType?: MediaFileType;
    folder?: string;
    uploadedBy?: mongoose.Types.ObjectId;
    tags?: string[];
    page?: number;
    limit?: number;
    sort?: string;
}) {
    const {
        fileType,
        folder,
        uploadedBy,
        tags,
        page = 1,
        limit = MEDIA_UPLOAD_LIMITS.DEFAULT_PAGE_SIZE,
        sort = '-createdAt',
    } = options;

    // Build filter
    const filter: any = {};
    if (fileType) filter.fileType = fileType;
    if (folder) filter.folder = folder;
    if (uploadedBy) filter.uploadedBy = uploadedBy;
    if (tags && tags.length > 0) filter.tags = { $in: tags };

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [files, total] = await Promise.all([
        this.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('uploadedBy', 'name email')
            .lean(),
        this.countDocuments(filter),
    ]);

    return {
        files,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
    };
};

/**
 * Get media statistics.
 * 
 * @param uploadedBy - Optional: filter by uploader
 * @returns Statistics object
 */
MediaSchema.statics.getStats = async function (uploadedBy?: mongoose.Types.ObjectId) {
    const match: any = {};
    if (uploadedBy) match.uploadedBy = uploadedBy;

    const stats = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalFiles: { $sum: 1 },
                totalSize: { $sum: '$size' },
                totalImages: {
                    $sum: { $cond: [{ $eq: ['$fileType', MEDIA_FILE_TYPES.IMAGE] }, 1, 0] },
                },
                totalVideos: {
                    $sum: { $cond: [{ $eq: ['$fileType', MEDIA_FILE_TYPES.VIDEO] }, 1, 0] },
                },
                totalDocuments: {
                    $sum: { $cond: [{ $eq: ['$fileType', MEDIA_FILE_TYPES.FILE] }, 1, 0] },
                },
            },
        },
    ]);

    // Get recent uploads count (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentUploads = await this.countDocuments({
        ...match,
        createdAt: { $gte: yesterday },
    });

    return stats[0]
        ? {
              ...stats[0],
              recentUploads,
          }
        : {
              totalFiles: 0,
              totalSize: 0,
              totalImages: 0,
              totalVideos: 0,
              totalDocuments: 0,
              recentUploads: 0,
          };
};

/**
 * Get folder statistics.
 * 
 * @param uploadedBy - Optional: filter by uploader
 * @returns Array of folder stats
 */
MediaSchema.statics.getFolderStats = async function (uploadedBy?: mongoose.Types.ObjectId) {
    const match: any = {};
    if (uploadedBy) match.uploadedBy = uploadedBy;

    return this.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$folder',
                count: { $sum: 1 },
                totalSize: { $sum: '$size' },
            },
        },
        { $sort: { count: -1 } },
        {
            $project: {
                _id: 0,
                folder: '$_id',
                count: 1,
                totalSize: 1,
            },
        },
    ]);
};

/**
 * Search media by filename or tags.
 * 
 * @param query - Search query string
 * @param options - Additional filter options
 * @returns Matching media documents
 */
MediaSchema.statics.searchMedia = async function (
    query: string,
    options: {
        fileType?: MediaFileType;
        folder?: string;
        page?: number;
        limit?: number;
    } = {}
) {
    const { fileType, folder, page = 1, limit = MEDIA_UPLOAD_LIMITS.DEFAULT_PAGE_SIZE } = options;

    // Build filter
    const filter: any = {
        $or: [{ fileName: { $regex: query, $options: 'i' } }, { tags: { $regex: query, $options: 'i' } }],
    };

    if (fileType) filter.fileType = fileType;
    if (folder) filter.folder = folder;

    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
        this.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        this.countDocuments(filter),
    ]);

    return {
        files,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
    };
};

/**
 * Delete media by file key.
 * 
 * @param fileKey - The unique file key
 * @returns Deleted document or null
 */
MediaSchema.statics.deleteByFileKey = async function (fileKey: string) {
    return this.findOneAndDelete({ fileKey });
};

// ============================================================
// Instance Methods
// ============================================================

/**
 * Update media metadata.
 * 
 * @param updates - Partial media updates
 * @returns Updated document
 */
MediaSchema.methods.updateMetadata = async function (
    this: IMediaDocument,
    updates: Partial<{
        description: string;
        altText: string;
        tags: string[];
    }>
) {
    if (updates.description !== undefined) this.description = updates.description;
    if (updates.altText !== undefined) this.altText = updates.altText;
    if (updates.tags !== undefined) this.tags = updates.tags;

    return this.save();
};

/**
 * Add tags to media.
 * 
 * @param newTags - Tags to add
 * @returns Updated document
 */
MediaSchema.methods.addTags = async function (this: IMediaDocument, newTags: string[]) {
    const currentTags = this.tags ?? [];
    const uniqueTags = [...new Set([...currentTags, ...newTags])];

    if (uniqueTags.length > MEDIA_UPLOAD_LIMITS.MAX_TAGS_COUNT) {
        throw new Error(`Cannot exceed ${MEDIA_UPLOAD_LIMITS.MAX_TAGS_COUNT} tags`);
    }

    this.tags = uniqueTags;
    return this.save();
};

/**
 * Remove tags from media.
 * 
 * @param tagsToRemove - Tags to remove
 * @returns Updated document
 */
MediaSchema.methods.removeTags = async function (this: IMediaDocument, tagsToRemove: string[]) {
    const currentTags = this.tags ?? [];
    this.tags = currentTags.filter((tag) => !tagsToRemove.includes(tag));
    return this.save();
};

// ============================================================
// Virtual Properties
// ============================================================

// Human-readable file size
MediaSchema.virtual('sizeFormatted').get(function (this: IMediaDocument) {
    const bytes = this.size;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// ============================================================
// Model Export
// ============================================================

interface IMediaModel extends Model<IMediaDocument> {
    findByFileKey(fileKey: string): Promise<IMediaDocument | null>;
    listMedia(options: {
        fileType?: MediaFileType;
        folder?: string;
        uploadedBy?: mongoose.Types.ObjectId;
        tags?: string[];
        page?: number;
        limit?: number;
        sort?: string;
    }): Promise<{
        files: IMediaDocument[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    getStats(uploadedBy?: mongoose.Types.ObjectId): Promise<any>;
    getFolderStats(uploadedBy?: mongoose.Types.ObjectId): Promise<any[]>;
    searchMedia(
        query: string,
        options?: {
            fileType?: MediaFileType;
            folder?: string;
            page?: number;
            limit?: number;
        }
    ): Promise<{
        files: IMediaDocument[];
        total: number;
        page: number;
        limit: number;
        pages: number;
    }>;
    deleteByFileKey(fileKey: string): Promise<IMediaDocument | null>;
}

const Media: IMediaModel =
    (mongoose.models.Media as IMediaModel) || mongoose.model<IMediaDocument, IMediaModel>('Media', MediaSchema);

export default Media;
