import mongoose, { Schema, Model } from 'mongoose';
import type { IContactDocument } from './types';

// ============================================================
// Contact Schema
// ============================================================

const ContactSchema = new Schema<IContactDocument>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
            index: true,
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
            minlength: [5, 'Subject must be at least 5 characters'],
            maxlength: [200, 'Subject cannot exceed 200 characters'],
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
            minlength: [10, 'Message must be at least 10 characters'],
            maxlength: [2000, 'Message cannot exceed 2000 characters'],
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ['new', 'read', 'replied', 'archived'],
                message: 'Status must be one of: new, read, replied, archived',
            },
            default: 'new',
            index: true,
        },
        ipHash: {
            type: String,
            default: null,
            trim: true,
        },
    },
    {
        timestamps: true,
        collection: 'contacts',
    }
);

// ============================================================
// Indexes
// ============================================================

ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ status: 1, createdAt: -1 });
ContactSchema.index({ email: 1 });

// ============================================================
// Static Methods
// ============================================================

ContactSchema.statics.getNewMessages = async function () {
    return this.find({ status: 'new' })
        .sort({ createdAt: -1 })
        .lean();
};

ContactSchema.statics.getUnreadCount = async function () {
    return this.countDocuments({ status: 'new' });
};

ContactSchema.statics.getByStatus = async function (
    status: 'new' | 'read' | 'replied' | 'archived'
) {
    return this.find({ status })
        .sort({ createdAt: -1 })
        .lean();
};

// ============================================================
// Instance Methods
// ============================================================

ContactSchema.methods.markAsRead = async function (this: IContactDocument) {
    if (this.status === 'new') {
        this.status = 'read';
        return this.save();
    }
    return this;
};

ContactSchema.methods.markAsReplied = async function (this: IContactDocument) {
    this.status = 'replied';
    return this.save();
};

ContactSchema.methods.archive = async function (this: IContactDocument) {
    this.status = 'archived';
    return this.save();
};

ContactSchema.methods.unarchive = async function (this: IContactDocument) {
    this.status = 'read';
    return this.save();
};

// ============================================================
// Model Export
// ============================================================

interface IContactModel extends Model<IContactDocument> {
    getNewMessages(): Promise<IContactDocument[]>;
    getUnreadCount(): Promise<number>;
    getByStatus(status: 'new' | 'read' | 'replied' | 'archived'): Promise<IContactDocument[]>;
}

const Contact: IContactModel =
    (mongoose.models.Contact as IContactModel) || 
    mongoose.model<IContactDocument, IContactModel>('Contact', ContactSchema);

export default Contact;
