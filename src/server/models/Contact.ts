import { CONTACT_STATUS, type ContactStatusType, SCHEMA_LIMITS, VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import mongoose, { Model, Schema } from 'mongoose';
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
            maxlength: [SCHEMA_LIMITS.CONTACT_NAME_MAX_LENGTH, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
            match: [VALIDATION_PATTERNS.EMAIL, 'Please provide a valid email address'],
            index: true,
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
            minlength: [5, 'Subject must be at least 5 characters'],
            maxlength: [SCHEMA_LIMITS.CONTACT_SUBJECT_MAX_LENGTH, 'Subject cannot exceed 200 characters'],
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
            minlength: [10, 'Message must be at least 10 characters'],
            maxlength: [SCHEMA_LIMITS.CONTACT_MESSAGE_MAX_LENGTH, 'Message cannot exceed 5000 characters'],
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: Object.values(CONTACT_STATUS),
                message: 'Status must be one of: new, read, replied, archived',
            },
            default: CONTACT_STATUS.NEW,
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
    return this.find({ status: CONTACT_STATUS.NEW }).sort({ createdAt: -1 }).lean();
};

ContactSchema.statics.getNewMessageCount = async function () {
    return this.countDocuments({ status: CONTACT_STATUS.NEW });
};

ContactSchema.statics.getByStatus = async function (status: ContactStatusType) {
    return this.find({ status }).sort({ createdAt: -1 }).lean();
};

// ============================================================
// Instance Methods
// ============================================================

ContactSchema.methods.markAsRead = async function (this: IContactDocument) {
    if (this.status === CONTACT_STATUS.NEW) {
        this.status = CONTACT_STATUS.READ;
        return this.save();
    }
    return this;
};

ContactSchema.methods.markAsReplied = async function (this: IContactDocument) {
    this.status = CONTACT_STATUS.REPLIED;
    return this.save();
};

ContactSchema.methods.archive = async function (this: IContactDocument) {
    this.status = CONTACT_STATUS.ARCHIVED;
    return this.save();
};

ContactSchema.methods.unarchive = async function (this: IContactDocument) {
    this.status = CONTACT_STATUS.READ;
    return this.save();
};

// ============================================================
// Model Export
// ============================================================

interface IContactModel extends Model<IContactDocument> {
    getNewMessages(): Promise<IContactDocument[]>;
    getUnreadCount(): Promise<number>;
    getByStatus(status: ContactStatusType): Promise<IContactDocument[]>;
}

const Contact: IContactModel = (mongoose.models.Contact as IContactModel) || mongoose.model<IContactDocument, IContactModel>('Contact', ContactSchema);

export default Contact;
