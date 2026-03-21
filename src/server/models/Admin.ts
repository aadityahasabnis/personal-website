import { VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import mongoose, { Model, Schema } from 'mongoose';
import type { IAdminDocument } from './types';

// ============================================================
// Admin Schema
// ============================================================

const AdminSchema = new Schema<IAdminDocument>(
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
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        image: {
            type: String,
            default: null,
            trim: true,
        },
        recoveryEmail: {
            type: String,
            default: null,
            trim: true,
            lowercase: true,
            match: [VALIDATION_PATTERNS.EMAIL, 'Please provide a valid recovery email address'],
        },
        passwordHash: {
            type: String,
            default: null,
            select: false,
        },
        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: 'admins',
    }
);

// ============================================================
// Indexes
// ============================================================

AdminSchema.index({ email: 1 }, { unique: true });
AdminSchema.index({ lastLoginAt: -1 });

// ============================================================
// Static Methods
// ============================================================

AdminSchema.statics.findByEmail = async function (email: string) {
    return this.findOne({ email: email.toLowerCase() }).select('+passwordHash');
};

AdminSchema.statics.getAdminCount = async function () {
    return this.countDocuments();
};

// ============================================================
// Instance Methods
// ============================================================

AdminSchema.methods.updateLastLogin = async function (this: IAdminDocument) {
    this.lastLoginAt = new Date();
    return this.save();
};

// ============================================================
// Model Export
// ============================================================

interface IAdminModel extends Model<IAdminDocument> {
    findByEmail(email: string): Promise<IAdminDocument | null>;
    getAdminCount(): Promise<number>;
}

const Admin: IAdminModel =
    (mongoose.models.Admin as IAdminModel) || 
    mongoose.model<IAdminDocument, IAdminModel>('Admin', AdminSchema);

export default Admin;
