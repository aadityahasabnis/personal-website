import { SCHEMA_LIMITS, VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import mongoose, { Model, Schema } from 'mongoose';
import type { ITopicDocument } from './types';

// ============================================================
// Topic Schema
// ============================================================

const TopicSchema = new Schema<ITopicDocument>(
    {
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
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [SCHEMA_LIMITS.DESCRIPTION_MAX_LENGTH, 'Description cannot exceed 500 characters'],
        },
        coverImage: {
            type: String,
            default: null,
            trim: true,
        },
        order: {
            type: Number,
            required: true,
            default: 0,
            min: [0, 'Order cannot be negative'],
        },
        published: {
            type: Boolean,
            default: false,
        },
        featured: {
            type: Boolean,
            default: false,
        },

        subTopicCount: {
            type: Number,
            default: 0,
            min: [0, 'Subtopic count cannot be negative']
        },

        // Number of published articles under this topic (not subtopic count)
        contentCount: {
            type: Number,
            default: 0,
            min: [0, 'Content count cannot be negative'],
        },
    },
    {
        timestamps: true,
        collection: 'topics',
    }
);

// ============================================================
// Indexes
// ============================================================

TopicSchema.index({ slug: 1 }, { unique: true });
TopicSchema.index({ order: 1 });
TopicSchema.index({ published: 1, order: 1 });
TopicSchema.index({ featured: 1, published: 1 });
TopicSchema.index({ published: 1, featured: -1, order: 1, updatedAt: -1 });

// ============================================================
// Model Export
// ============================================================

const Topic: Model<ITopicDocument> =
    mongoose.models.Topic || mongoose.model<ITopicDocument>('Topic', TopicSchema);

export default Topic;
