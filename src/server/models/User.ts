import mongoose, { Schema, Model } from 'mongoose';
import { USER_ROLES } from '@/interfaces/schema';
import type { IUserDocument } from './types';

// ============================================================
// User Schema
// ============================================================

const UserSchema = new Schema<IUserDocument>(
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
        role: {
            type: String,
            required: true,
            enum: {
                values: Object.values(USER_ROLES),
                message: 'Role must be either admin or viewer',
            },
            default: USER_ROLES.VIEWER,
            index: true,
        },
        passwordHash: {
            type: String,
            default: null,
            select: false, // Never return password hash by default
        },
        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: 'users',
    }
);

// ============================================================
// Indexes
// ============================================================

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ lastLoginAt: -1 });

// ============================================================
// Static Methods
// ============================================================

UserSchema.statics.findByEmail = async function (email: string) {
    return this.findOne({ email: email.toLowerCase() }).select('+passwordHash');
};

UserSchema.statics.getAdmins = async function () {
    return this.find({ role: USER_ROLES.ADMIN }).lean();
};

UserSchema.statics.getUserCount = async function () {
    return this.countDocuments();
};

// ============================================================
// Instance Methods
// ============================================================

UserSchema.methods.updateLastLogin = async function (this: IUserDocument) {
    this.lastLoginAt = new Date();
    return this.save();
};

UserSchema.methods.isAdmin = function (this: IUserDocument) {
    return this.role === USER_ROLES.ADMIN;
};

UserSchema.methods.isViewer = function (this: IUserDocument) {
    return this.role === USER_ROLES.VIEWER;
};

// ============================================================
// Model Export
// ============================================================

interface IUserModel extends Model<IUserDocument> {
    findByEmail(email: string): Promise<IUserDocument | null>;
    getAdmins(): Promise<IUserDocument[]>;
    getUserCount(): Promise<number>;
}

const User: IUserModel =
    (mongoose.models.User as IUserModel) || 
    mongoose.model<IUserDocument, IUserModel>('User', UserSchema);

export default User;
