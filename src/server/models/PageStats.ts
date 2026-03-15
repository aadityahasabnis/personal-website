import type { IPageStats } from '@/interfaces/schema/pageStats';
import mongoose, { Model, Schema } from 'mongoose';
import type { IPageStatsDocument } from './types';

// ============================================================
// PageStats Schema
// ============================================================

const PageStatsSchema = new Schema<IPageStatsDocument>(
    {
        contentId: {
            type: Schema.Types.ObjectId,
            required: [true, 'Content ID is required'],
            ref: 'Content',
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

PageStatsSchema.index({ contentId: 1 }, { unique: true });
PageStatsSchema.index({ views: -1 });
PageStatsSchema.index({ likes: -1 });
PageStatsSchema.index({ lastViewedAt: -1 });

// ============================================================
// Static Methods
// ============================================================

PageStatsSchema.statics.incrementViews = async function (contentId: mongoose.Types.ObjectId) {
    return this.findOneAndUpdate(
        { contentId },
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

PageStatsSchema.statics.incrementLikes = async function (contentId: mongoose.Types.ObjectId) {
    return this.findOneAndUpdate(
        { contentId },
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
    incrementViews(contentId: mongoose.Types.ObjectId): Promise<IPageStats>;
    incrementLikes(contentId: mongoose.Types.ObjectId): Promise<IPageStats>;
    getTopViewed(limit?: number): Promise<IPageStats[]>;
    getTopLiked(limit?: number): Promise<IPageStats[]>;
}

const PageStats: IPageStatsModel =
    (mongoose.models.PageStats as IPageStatsModel) || 
    mongoose.model<IPageStatsDocument, IPageStatsModel>('PageStats', PageStatsSchema);

export default PageStats;
