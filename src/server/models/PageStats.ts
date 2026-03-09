import mongoose, { Schema, Model } from 'mongoose';
import type { IPageStats } from '@/interfaces/schema';
import type { IPageStatsDocument } from './types';

// ============================================================
// PageStats Schema
// ============================================================

const PageStatsSchema = new Schema<IPageStatsDocument>(
    {
        slug: {
            type: String,
            required: [true, 'Slug is required'],
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        views: {
            type: Number,
            required: true,
            default: 0,
            min: [0, 'Views cannot be negative'],
        },
        likes: {
            type: Number,
            required: true,
            default: 0,
            min: [0, 'Likes cannot be negative'],
        },
        lastViewedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: 'pageStats',
    }
);

// ============================================================
// Indexes
// ============================================================

PageStatsSchema.index({ slug: 1 }, { unique: true });
PageStatsSchema.index({ views: -1 }); // For popular content queries
PageStatsSchema.index({ likes: -1 }); // For most liked content queries
PageStatsSchema.index({ lastViewedAt: -1 }); // For recent activity queries

// ============================================================
// Static Methods
// ============================================================

PageStatsSchema.statics.incrementViews = async function (slug: string) {
    return this.findOneAndUpdate(
        { slug },
        {
            $inc: { views: 1 },
            $set: { lastViewedAt: new Date() },
            $setOnInsert: { likes: 0, createdAt: new Date() },
        },
        {
            new: true,
            upsert: true,
            runValidators: true,
        }
    );
};

PageStatsSchema.statics.incrementLikes = async function (slug: string) {
    return this.findOneAndUpdate(
        { slug },
        {
            $inc: { likes: 1 },
            $setOnInsert: { views: 0, createdAt: new Date() },
        },
        {
            new: true,
            upsert: true,
            runValidators: true,
        }
    );
};

PageStatsSchema.statics.decrementLikes = async function (slug: string) {
    const stats = await this.findOne({ slug });
    if (stats && stats.likes > 0) {
        stats.likes -= 1;
        return stats.save();
    }
    return stats;
};

PageStatsSchema.statics.getTopViewed = async function (limit: number = 10) {
    return this.find()
        .sort({ views: -1 })
        .limit(limit)
        .lean();
};

PageStatsSchema.statics.getTopLiked = async function (limit: number = 10) {
    return this.find()
        .sort({ likes: -1 })
        .limit(limit)
        .lean();
};

// ============================================================
// Model Export
// ============================================================

interface IPageStatsModel extends Model<IPageStatsDocument> {
    incrementViews(slug: string): Promise<IPageStats>;
    incrementLikes(slug: string): Promise<IPageStats>;
    decrementLikes(slug: string): Promise<IPageStats | null>;
    getTopViewed(limit?: number): Promise<IPageStats[]>;
    getTopLiked(limit?: number): Promise<IPageStats[]>;
}

const PageStats: IPageStatsModel =
    (mongoose.models.PageStats as IPageStatsModel) || 
    mongoose.model<IPageStatsDocument, IPageStatsModel>('PageStats', PageStatsSchema);

export default PageStats;
