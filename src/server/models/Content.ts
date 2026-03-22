import { CONTENT_TYPES, PROJECT_STATUS, PUBLISH_STATUS, SCHEMA_LIMITS, VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import type { ISeoMetadata } from '@/interfaces/schema/content';
import mongoose, { Model, Schema } from 'mongoose';
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
// Base Content Schema
// ============================================================

const BaseContentSchema = new Schema(
    {
        type: {
            type: String,
            required: [true, 'Content type is required'],
            enum: {
                values: Object.values(CONTENT_TYPES),
                message: 'Type must be one of: article, blog, project',
            },
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
        publishStatus: {
            type: String,
            enum: {
                values: Object.values(PUBLISH_STATUS),
                message: 'Publish status must be one of: draft, published, archived',
            },
            default: PUBLISH_STATUS.DRAFT,
        },
        publishedAt: {
            type: Date,
            default: null,
        },
        featured: {
            type: Boolean,
            default: false,
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
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            required: [true, 'Updater is required'],
            ref: 'Admin',
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

BaseContentSchema.index({ type: 1, slug: 1 }, { unique: true });
BaseContentSchema.index({ type: 1, publishStatus: 1, publishedAt: -1 });
BaseContentSchema.index({ type: 1, publishStatus: 1, featured: -1, publishedAt: -1, updatedAt: -1 });
BaseContentSchema.index({ type: 1, publishStatus: 1, order: 1, featured: -1, updatedAt: -1 });
BaseContentSchema.index({ type: 1, publishStatus: 1, status: 1, order: 1, featured: -1, updatedAt: -1 });
BaseContentSchema.index({ publishStatus: 1, featured: 1 });
BaseContentSchema.index({ tags: 1 });
BaseContentSchema.index({ createdBy: 1 });
BaseContentSchema.index({ updatedBy: 1 });

const ArticleContentSchema = new Schema(
    {
        topicId: {
            type: Schema.Types.ObjectId,
            required: [true, 'Topic is required for articles'],
            ref: 'Topic',
        },
        subtopicId: {
            type: Schema.Types.ObjectId,
            default: null,
            ref: 'Subtopic',
        },
        order: {
            type: Number,
            default: 0,
            min: [0, 'Order cannot be negative'],
        },
    },
    { _id: false }
);

ArticleContentSchema.index({ type: 1, topicId: 1, order: 1 });
ArticleContentSchema.index({ type: 1, subtopicId: 1, order: 1 });
ArticleContentSchema.index({ type: 1, topicId: 1, publishStatus: 1, subtopicId: 1, order: 1, publishedAt: -1 });

const ProjectContentSchema = new Schema(
    {
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
        order: {
            type: Number,
            default: 0,
            min: [0, 'Order cannot be negative'],
        },
    },
    { _id: false }
);

ProjectContentSchema.index({ type: 1, status: 1, order: 1 });

const BlogContentSchema = new Schema({}, { _id: false });

// ============================================================
// Instance Methods
// ============================================================

BaseContentSchema.methods.publish = async function () {
    this.publishStatus = PUBLISH_STATUS.PUBLISHED;
    this.publishedAt = new Date();
    return this.save();
};

BaseContentSchema.methods.unpublish = async function () {
    this.publishStatus = PUBLISH_STATUS.DRAFT;
    this.publishedAt = null;
    return this.save();
};

BaseContentSchema.methods.isArticle = function (): boolean {
    return this.type === CONTENT_TYPES.ARTICLE;
};

BaseContentSchema.methods.isBlog = function (): boolean {
    return this.type === CONTENT_TYPES.BLOG;
};

BaseContentSchema.methods.isProject = function (): boolean {
    return this.type === CONTENT_TYPES.PROJECT;
};

// ============================================================
// Model Export
// ============================================================

const Content: Model<IContentDocument> =
    mongoose.models.Content || mongoose.model<IContentDocument>('Content', BaseContentSchema);

if (!mongoose.models.ArticleContent) {
    Content.discriminator('ArticleContent', ArticleContentSchema, CONTENT_TYPES.ARTICLE);
}

if (!mongoose.models.BlogContent) {
    Content.discriminator('BlogContent', BlogContentSchema, CONTENT_TYPES.BLOG);
}

if (!mongoose.models.ProjectContent) {
    Content.discriminator('ProjectContent', ProjectContentSchema, CONTENT_TYPES.PROJECT);
}

export default Content;
