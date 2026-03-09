/**
 * Settings Domain - Server Actions
 * 
 * All settings-related mutations including password change.
 */

'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IUser } from '@/interfaces/schema';
import type { ActionResponse } from '../utils/types';
import { success, error, validationError } from '../utils/response';
import { requireAuth, type AuthUser } from '../utils/authGuard';
import { handleError } from '../utils/errorHandler';
import { logActivity } from '../utils/activityLogger';

import {
    siteSettingsSchema,
    seoSettingsSchema,
    socialSettingsSchema,
    changePasswordSchema,
    type SiteSettingsInput,
    type SeoSettingsInput,
    type SocialSettingsInput,
    type ChangePasswordInput,
    type SettingDocument,
} from './types';

// ===== HELPERS =====

const upsertSetting = async (key: string, value: unknown): Promise<void> => {
    const collection = await getCollection(COLLECTIONS.settings);
    await collection.updateOne(
        { key },
        { $set: { key, value, updatedAt: new Date() } },
        { upsert: true }
    );
};

// ===== SITE SETTINGS =====

export async function updateSiteSettings(
    data: SiteSettingsInput
): Promise<ActionResponse<void>> {
    try {
        // Auth check
        const authResult = await requireAuth();
        if (!authResult.success || !authResult.data) {
            return authResult as ActionResponse<void>;
        }

        // Validate
        const parseResult = siteSettingsSchema.safeParse(data);
        if (!parseResult.success) {
            return validationError(parseResult.error.issues[0]?.message ?? 'Validation failed');
        }

        // Save
        await upsertSetting('site', parseResult.data);
        
        // Log activity
        await logActivity('update', 'settings', { entityTitle: 'Site Settings' });

        revalidatePath('/');
        return success(undefined, 'Site settings updated');
    } catch (err) {
        return handleError(err, 'Failed to update site settings');
    }
}

// ===== SEO SETTINGS =====

export async function updateSeoSettings(
    data: SeoSettingsInput
): Promise<ActionResponse<void>> {
    try {
        // Auth check
        const authResult = await requireAuth();
        if (!authResult.success || !authResult.data) {
            return authResult as ActionResponse<void>;
        }

        // Validate
        const parseResult = seoSettingsSchema.safeParse(data);
        if (!parseResult.success) {
            return validationError(parseResult.error.issues[0]?.message ?? 'Validation failed');
        }

        // Save
        await upsertSetting('seo', parseResult.data);
        
        // Log activity
        await logActivity('update', 'settings', { entityTitle: 'SEO Settings' });

        revalidatePath('/');
        return success(undefined, 'SEO settings updated');
    } catch (err) {
        return handleError(err, 'Failed to update SEO settings');
    }
}

// ===== SOCIAL SETTINGS =====

export async function updateSocialSettings(
    data: SocialSettingsInput
): Promise<ActionResponse<void>> {
    try {
        // Auth check
        const authResult = await requireAuth();
        if (!authResult.success || !authResult.data) {
            return authResult as ActionResponse<void>;
        }

        // Validate
        const parseResult = socialSettingsSchema.safeParse(data);
        if (!parseResult.success) {
            return validationError(parseResult.error.issues[0]?.message ?? 'Validation failed');
        }

        // Save
        await upsertSetting('social', parseResult.data);
        
        // Log activity
        await logActivity('update', 'settings', { entityTitle: 'Social Links' });

        return success(undefined, 'Social links updated');
    } catch (err) {
        return handleError(err, 'Failed to update social links');
    }
}

// ===== CHANGE PASSWORD =====

export async function changePassword(
    data: ChangePasswordInput
): Promise<ActionResponse<void>> {
    try {
        // Auth check
        const authResult = await requireAuth();
        if (!authResult.success || !authResult.data) {
            return authResult as ActionResponse<void>;
        }
        const user: AuthUser = authResult.data;

        // Validate input
        const parseResult = changePasswordSchema.safeParse(data);
        if (!parseResult.success) {
            return validationError(parseResult.error.issues[0]?.message ?? 'Validation failed');
        }

        const { currentPassword, newPassword } = parseResult.data;

        // Get user from database with password hash
        const usersCollection = await getCollection<IUser & { passwordHash?: string }>(COLLECTIONS.users);
        const dbUser = await usersCollection.findOne({ 
            _id: new ObjectId(user.id) 
        });

        if (!dbUser) {
            return error('User not found');
        }

        if (!dbUser.passwordHash) {
            return error('Password authentication not configured for this account');
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
        if (!isCurrentPasswordValid) {
            return error('Current password is incorrect');
        }

        // Check new password is different
        const isSamePassword = await bcrypt.compare(newPassword, dbUser.passwordHash);
        if (isSamePassword) {
            return error('New password must be different from current password');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // Update password
        await usersCollection.updateOne(
            { _id: new ObjectId(user.id) },
            { 
                $set: { 
                    passwordHash: newPasswordHash,
                    updatedAt: new Date(),
                } 
            }
        );

        // Log activity
        await logActivity('update', 'user', { entityId: user.id, entityTitle: 'Password Changed' });

        return success(undefined, 'Password changed successfully');
    } catch (err) {
        return handleError(err, 'Failed to change password');
    }
}
