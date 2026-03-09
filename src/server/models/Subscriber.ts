import mongoose, { Schema, Model } from 'mongoose';
import type { ISubscriberDocument } from './types';

// ============================================================
// Subscriber Schema
// ============================================================

const SubscriberSchema = new Schema<ISubscriberDocument>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
            index: true,
        },
        name: {
            type: String,
            default: null,
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        confirmed: {
            type: Boolean,
            default: false,
            index: true,
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
