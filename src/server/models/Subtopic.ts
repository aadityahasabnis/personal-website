import { SCHEMA_LIMITS, VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import mongoose, { Model, Schema } from 'mongoose';
import type { ISubtopicDocument } from './types';

// ============================================================
// Subtopic Schema
// ============================================================

const SubtopicSchema = new Schema<ISubtopicDocument>(
    {
        topicId: {
            type: Schema.Types.ObjectId,
            required: [true, 'Topic ID is required'],
            ref: 'Topic',
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
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            default: null,
            trim: true,
            maxlength: [SCHEMA_LIMITS.DESCRIPTION_MAX_LENGTH, 'Description cannot exceed 500 characters'],
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
        // Number of published articles under this subtopic
        contentCount: {
            type: Number,
            default: 0,
            min: [0, 'Content count cannot be negative'],
        },
    },
    {
        timestamps: true,
        collection: 'subtopics',
    }
);

// ============================================================
// Indexes
// ============================================================

SubtopicSchema.index({ topicId: 1, slug: 1 }, { unique: true });
SubtopicSchema.index({ topicId: 1, order: 1 });
SubtopicSchema.index({ topicId: 1, published: 1 });

// ============================================================
// Model Export
// ============================================================

const Subtopic: Model<ISubtopicDocument> =
    mongoose.models.Subtopic || mongoose.model<ISubtopicDocument>('Subtopic', SubtopicSchema);

export default Subtopic;
