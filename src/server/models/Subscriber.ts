import { VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import mongoose, { Model, Schema } from 'mongoose';
import type { ISubscriberDocument } from './types';

// ============================================================
// Subscriber Schema
// ============================================================

const SubscriberSchema = new Schema<ISubscriberDocument>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [VALIDATION_PATTERNS.EMAIL, 'Please provide a valid email address'],
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [80, 'Name is too long'],
        },
        confirmed: {
            type: Boolean,
            default: true,
        },
        subscribedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        unsubscribedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: 'subscribers',
    }
);

// ============================================================
// Indexes
// ============================================================

SubscriberSchema.index({ email: 1 }, { unique: true });
SubscriberSchema.index({ confirmed: 1 });
SubscriberSchema.index({ subscribedAt: -1 });
SubscriberSchema.index({ confirmed: 1, unsubscribedAt: 1, subscribedAt: -1 });

// ============================================================
// Static Methods
// ============================================================

SubscriberSchema.statics.getActiveSubscribers = async function () {
    return this.find({
        confirmed: true,
        unsubscribedAt: null,
    })
        .sort({ subscribedAt: -1 })
        .lean();
};

SubscriberSchema.statics.getSubscriberCount = async function () {
    return this.countDocuments({
        confirmed: true,
        unsubscribedAt: null,
    });
};

SubscriberSchema.statics.getPendingConfirmations = async function () {
    return this.find({
        confirmed: false,
        unsubscribedAt: null,
    })
        .sort({ subscribedAt: -1 })
        .lean();
};

// ============================================================
// Instance Methods
// ============================================================

SubscriberSchema.methods.confirm = async function (this: ISubscriberDocument) {
    this.confirmed = true;
    return this.save();
};

SubscriberSchema.methods.unsubscribe = async function (this: ISubscriberDocument) {
    this.unsubscribedAt = new Date();
    return this.save();
};

SubscriberSchema.methods.resubscribe = async function (this: ISubscriberDocument) {
    this.unsubscribedAt = null;
    this.confirmed = true;
    this.subscribedAt = new Date();
    return this.save();
};

// ============================================================
// Model Export
// ============================================================

interface ISubscriberModel extends Model<ISubscriberDocument> {
    getActiveSubscribers(): Promise<ISubscriberDocument[]>;
    getSubscriberCount(): Promise<number>;
    getPendingConfirmations(): Promise<ISubscriberDocument[]>;
}

const Subscriber: ISubscriberModel =
    (mongoose.models.Subscriber as ISubscriberModel) || 
    mongoose.model<ISubscriberDocument, ISubscriberModel>('Subscriber', SubscriberSchema);

export default Subscriber;
