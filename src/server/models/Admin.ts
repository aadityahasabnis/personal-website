import { VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import mongoose, { Model, Schema } from 'mongoose';
import type { IAdminDocument } from './types';

// ============================================================
// OTP Sub-Schema - For two-step login flow
// ============================================================

const OtpSchema = new Schema(
    {
        code: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        targetEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
    },
    { _id: false }
);

// ============================================================
// Password Reset Token Sub-Schema - For forgot password flow
// ============================================================

const PasswordResetTokenSchema = new Schema(
    {
        token: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    { _id: false }
);

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
        otp: {
            type: OtpSchema,
            default: null,
            select: false,
        },
        passwordResetToken: {
            type: PasswordResetTokenSchema,
            default: null,
            select: false,
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

AdminSchema.statics.findByEmailWithOtp = async function (email: string) {
    return this.findOne({ email: email.toLowerCase() }).select('+passwordHash +otp');
};

AdminSchema.statics.findByEmailWithResetToken = async function (email: string) {
    return this.findOne({ email: email.toLowerCase() }).select('+passwordHash +passwordResetToken');
};

AdminSchema.statics.findByResetToken = async function (token: string) {
    return this.findOne({ 'passwordResetToken.token': token }).select('+passwordHash +passwordResetToken');
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

AdminSchema.methods.setOtp = async function (
    this: IAdminDocument,
    code: string,
    expiresAt: Date,
    targetEmail: string
) {
    this.otp = { code, expiresAt, targetEmail };
    this.markModified('otp'); // Explicitly mark as modified for select: false fields
    return this.save();
};

AdminSchema.methods.clearOtp = async function (this: IAdminDocument) {
    this.otp = null;
    this.markModified('otp'); // Explicitly mark as modified for select: false fields
    return this.save();
};

AdminSchema.methods.setPasswordResetToken = async function (
    this: IAdminDocument,
    token: string,
    expiresAt: Date
) {
    this.passwordResetToken = { token, expiresAt };
    this.markModified('passwordResetToken'); // Explicitly mark as modified for select: false fields
    return this.save();
};

AdminSchema.methods.clearPasswordResetToken = async function (this: IAdminDocument) {
    this.passwordResetToken = null;
    this.markModified('passwordResetToken'); // Explicitly mark as modified for select: false fields
    return this.save();
};

// ============================================================
// Model Export
// ============================================================

interface IAdminModel extends Model<IAdminDocument> {
    findByEmail(email: string): Promise<IAdminDocument | null>;
    findByEmailWithOtp(email: string): Promise<IAdminDocument | null>;
    findByEmailWithResetToken(email: string): Promise<IAdminDocument | null>;
    findByResetToken(token: string): Promise<IAdminDocument | null>;
    getAdminCount(): Promise<number>;
}

const Admin: IAdminModel =
    (mongoose.models.Admin as IAdminModel) || 
    mongoose.model<IAdminDocument, IAdminModel>('Admin', AdminSchema);

export default Admin;
