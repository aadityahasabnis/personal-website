import mongoose, { Schema, Model } from 'mongoose';
import type { ITopic } from '@/interfaces/schema';
import type { ITopicDocument } from './types';

// ============================================================
// Topic Schema
// ============================================================

const TopicSchema = new Schema<ITopicDocument>(
    {
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            minlength: [2, 'Title must be at least 2 characters'],
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
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
            index: true,
        },
        featured: {
            type: Boolean,
            default: false,
            index: true,
        },
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

// ============================================================
// Instance Methods
// ============================================================

TopicSchema.methods.incrementContentCount = async function (this: ITopicDocument) {
    this.contentCount += 1;
    return this.save();
};

TopicSchema.methods.decrementContentCount = async function (this: ITopicDocument) {
    if (this.contentCount > 0) {
        this.contentCount -= 1;
        return this.save();
    }
    return this;
};

// ============================================================
// Model Export
// ============================================================

const Topic: Model<ITopicDocument> =
    mongoose.models.Topic || mongoose.model<ITopicDocument>('Topic', TopicSchema);

export default Topic;
