import mongoose, { Schema, Model } from 'mongoose';
import type { ISeoMetadata } from '@/interfaces/schema/content';
import { CONTENT_TYPES, PROJECT_STATUS, SCHEMA_LIMITS, VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import type { IContentDocument } from './types';

// ============================================================
// SEO Metadata Schema
// ============================================================

const SeoMetadataSchema = new Schema<ISeoMetadata>(
    {
        title: {
            type: String,
            default: null,
            trim: true,
            maxlength: [SCHEMA_LIMITS.SEO_TITLE_MAX_LENGTH, 'SEO title cannot exceed 70 characters'],
        },
        description: {
            type: String,
            default: null,
            trim: true,
            maxlength: [SCHEMA_LIMITS.SEO_DESCRIPTION_MAX_LENGTH, 'SEO description cannot exceed 160 characters'],
        },
        keywords: {
            type: [String],
            default: [],
        },
        ogImage: {
            type: String,
            default: null,
            trim: true,
        },
        canonicalUrl: {
            type: String,
            default: null,
            trim: true,
        },
        noIndex: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

// ============================================================
// Content Schema (Supports all content types)
// ============================================================

const ContentSchema = new Schema(
    {
        type: {
            type: String,
            required: [true, 'Content type is required'],
            enum: {
                values: Object.values(CONTENT_TYPES),
                message: 'Type must be one of: article, blog, project',
            },
            index: true,
        },
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            trim: true,
            lowercase: true,
            match: [VALIDATION_PATTERNS.SLUG, 'Slug can only contain lowercase letters, numbers, and hyphens'],
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [SCHEMA_LIMITS.TITLE_MIN_LENGTH, 'Title must be at least 2 characters'],
            maxlength: [SCHEMA_LIMITS.TITLE_MAX_LENGTH, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [SCHEMA_LIMITS.DESCRIPTION_MAX_LENGTH, 'Description cannot exceed 500 characters'],
        },
        body: {
            type: String,
            required: [true, 'Body content is required'],
        },
        tags: {
            type: [String],
            default: [],
            validate: {
                validator: (tags: string[]) => tags.length <= SCHEMA_LIMITS.TAGS_MAX_COUNT,
                message: `Cannot have more than ${SCHEMA_LIMITS.TAGS_MAX_COUNT} tags`,
            },
        },
        coverImage: {
            type: String,
            default: null,
            trim: true,
        },
        readingTime: {
            type: Number,
            required: true,
            default: 0,
            min: [0, 'Reading time cannot be negative'],
        },
        
        // Publishing
        published: {
            type: Boolean,
            default: false,
            index: true,
        },
        publishedAt: {
            type: Date,
            default: null,
            index: true,
        },
        scheduledAt: {
            type: Date,
            default: null,
        },
        featured: {
            type: Boolean,
            default: false,
            index: true,
        },
        
        // SEO
        seo: {
            type: SeoMetadataSchema,
            default: null,
        },
        
        // Audit fields
        createdBy: {
            type: Schema.Types.ObjectId,
            required: [true, 'Creator is required'],
            ref: 'Admin',
            index: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            required: [true, 'Updater is required'],
            ref: 'Admin',
            index: true,
        },
        
        // Article-specific fields (only used when type='article')
        topicId: {
            type: Schema.Types.ObjectId,
            ref: 'Topic',
            index: true,
        },
        subtopicId: {
            type: Schema.Types.ObjectId,
            default: null,
            ref: 'Subtopic',
            index: true,
        },
        
        // Project-specific fields (only used when type='project')
        techStack: {
            type: [String],
            default: [],
        },
        githubUrl: {
            type: String,
            default: null,
            trim: true,
        },
        liveUrl: {
            type: String,
            default: null,
            trim: true,
        },
        demoVideo: {
            type: String,
            default: null,
            trim: true,
        },
        gallery: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: Object.values(PROJECT_STATUS),
            default: null,
        },
        startDate: {
            type: Date,
            default: null,
        },
        completedDate: {
            type: Date,
            default: null,
        },
        
        // Order field (used by articles and projects)
        order: {
            type: Number,
            default: 0,
            min: [0, 'Order cannot be negative'],
        },
    },
    {
        timestamps: true,
        collection: 'content',
        discriminatorKey: 'type',
    }
);

// ============================================================
// Indexes
// ============================================================

ContentSchema.index({ type: 1, slug: 1 }, { unique: true });
ContentSchema.index({ type: 1, published: 1, publishedAt: -1 });
ContentSchema.index({ type: 1, topicId: 1, order: 1 });
ContentSchema.index({ type: 1, subtopicId: 1, order: 1 });
ContentSchema.index({ type: 1, status: 1, order: 1 });
ContentSchema.index({ published: 1, featured: 1 });
ContentSchema.index({ tags: 1 });
ContentSchema.index({ createdBy: 1 });
ContentSchema.index({ updatedBy: 1 });

// ============================================================
// Instance Methods
// ============================================================

ContentSchema.methods.publish = async function () {
    this.published = true;
    this.publishedAt = new Date();
    this.scheduledAt = null;
    return this.save();
};

ContentSchema.methods.unpublish = async function () {
    this.published = false;
    this.publishedAt = null;
    return this.save();
};

ContentSchema.methods.schedule = async function (date: Date) {
    this.published = false;
    this.publishedAt = null;
    this.scheduledAt = date;
    return this.save();
};

ContentSchema.methods.isArticle = function (): boolean {
    return this.type === CONTENT_TYPES.ARTICLE;
};

ContentSchema.methods.isBlog = function (): boolean {
    return this.type === CONTENT_TYPES.BLOG;
};

ContentSchema.methods.isProject = function (): boolean {
    return this.type === CONTENT_TYPES.PROJECT;
};

// ============================================================
// Model Export
// ============================================================

const Content: Model<IContentDocument> =
    mongoose.models.Content || mongoose.model<IContentDocument>('Content', ContentSchema);

export default Content;
