import { SCHEMA_LIMITS } from '@/constants/schemaConstants';
import { NEWSLETTER_STATUS } from '@/interfaces/schema/newsletter';
import mongoose, { Model, Schema } from 'mongoose';
import type { INewsletterDocument } from './types';

// ============================================================
// Newsletter Schema
// ============================================================

const NewsletterSchema = new Schema<INewsletterDocument>(
    {
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
            minlength: [SCHEMA_LIMITS.NEWSLETTER_SUBJECT_MIN_LENGTH, 'Subject must be at least 2 characters'],
            maxlength: [SCHEMA_LIMITS.NEWSLETTER_SUBJECT_MAX_LENGTH, 'Subject cannot exceed 200 characters'],
        },
        previewText: {
            type: String,
            default: null,
            trim: true,
            maxlength: [SCHEMA_LIMITS.NEWSLETTER_PREVIEW_TEXT_MAX_LENGTH, 'Preview text cannot exceed 150 characters'],
        },
        body: {
            type: String,
            required: [true, 'Body content is required'],
            trim: true,
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: Object.values(NEWSLETTER_STATUS),
                message: 'Status must be one of: draft, sent',
            },
            default: NEWSLETTER_STATUS.DRAFT,
        },
        sentAt: {
            type: Date,
            default: null,
        },
        recipientCount: {
            type: Number,
            default: 0,
            min: [0, 'Recipient count cannot be negative'],
        },
        successCount: {
            type: Number,
            default: 0,
            min: [0, 'Success count cannot be negative'],
        },
        failureCount: {
            type: Number,
            default: 0,
            min: [0, 'Failure count cannot be negative'],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            required: [true, 'Creator is required'],
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            default: null,
        },
    },
    {
        timestamps: true,
        collection: 'newsletters',
    }
);

// ============================================================
// Indexes
// ============================================================

NewsletterSchema.index({ createdAt: -1 });
NewsletterSchema.index({ status: 1, createdAt: -1 });
NewsletterSchema.index({ sentAt: -1 });
NewsletterSchema.index({ createdBy: 1, createdAt: -1 });

// ============================================================
// Static Methods
// ============================================================

NewsletterSchema.statics.getDrafts = async function () {
    return this.find({ status: NEWSLETTER_STATUS.DRAFT })
        .sort({ updatedAt: -1 })
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .lean();
};

NewsletterSchema.statics.getSentNewsletters = async function () {
    return this.find({ status: NEWSLETTER_STATUS.SENT })
        .sort({ sentAt: -1 })
        .populate('createdBy', 'name email')
        .lean();
};

NewsletterSchema.statics.getNewsletterStats = async function () {
    const totalSent = await this.countDocuments({ status: NEWSLETTER_STATUS.SENT });
    const totalDrafts = await this.countDocuments({ status: NEWSLETTER_STATUS.DRAFT });
    
    const deliveryStats = await this.aggregate([
        { $match: { status: NEWSLETTER_STATUS.SENT } },
        {
            $group: {
                _id: null,
                totalRecipients: { $sum: '$recipientCount' },
                totalSuccesses: { $sum: '$successCount' },
                totalFailures: { $sum: '$failureCount' },
            },
        },
    ]);

    const stats = deliveryStats[0] || {
        totalRecipients: 0,
        totalSuccesses: 0,
        totalFailures: 0,
    };

    return {
        totalSent,
        totalDrafts,
        ...stats,
        deliveryRate: stats.totalRecipients > 0 
            ? ((stats.totalSuccesses / stats.totalRecipients) * 100).toFixed(2) 
            : '0.00',
    };
};

// ============================================================
// Instance Methods
// ============================================================

NewsletterSchema.methods.isDraft = function (this: INewsletterDocument) {
    return this.status === NEWSLETTER_STATUS.DRAFT;
};

NewsletterSchema.methods.isSent = function (this: INewsletterDocument) {
    return this.status === NEWSLETTER_STATUS.SENT;
};

NewsletterSchema.methods.markAsSent = async function (
    this: INewsletterDocument,
    recipientCount: number,
    successCount: number,
    failureCount: number
) {
    if (!this.isDraft()) {
        throw new Error('Only draft newsletters can be marked as sent');
    }

    this.status = NEWSLETTER_STATUS.SENT;
    this.sentAt = new Date();
    this.recipientCount = recipientCount;
    this.successCount = successCount;
    this.failureCount = failureCount;

    return this.save();
};

// ============================================================
// Model Export
// ============================================================

interface INewsletterModel extends Model<INewsletterDocument> {
    getDrafts(): Promise<INewsletterDocument[]>;
    getSentNewsletters(): Promise<INewsletterDocument[]>;
    getNewsletterStats(): Promise<{
        totalSent: number;
        totalDrafts: number;
        totalRecipients: number;
        totalSuccesses: number;
        totalFailures: number;
        deliveryRate: string;
    }>;
}

const Newsletter: INewsletterModel = 
    (mongoose.models.Newsletter as INewsletterModel) || 
    mongoose.model<INewsletterDocument, INewsletterModel>('Newsletter', NewsletterSchema);

export default Newsletter;
