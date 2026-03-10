'use server';

/**
 * Admin Settings – Mutations (Server Actions)
 *
 * All settings-related write operations including password change.
 * Uses the new IApiResponse<T> pattern and centralized helpers.
 *
 * Auth is checked via the shared auth guard from the old admin utils
 * (these are admin-only actions). Once the auth layer is migrated to
 * the new pattern, the import can be updated.
 */

import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

import { COLLECTIONS } from '@/constants/siteConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import type { IUser } from '@/interfaces/schema';
import { getCollection } from '@/lib/db/connect';
import { logActivity } from '@/server/admin/utils/activityLogger';
import { requireAuth, type AuthUser } from '@/server/admin/utils/authGuard';

import { revalidatePath } from 'next/cache';
import {
    error,
    handleError,
    ok,
} from '../../utils';

import type {
    ChangePasswordInput,
    SeoSettingsInput,
    SiteSettingsInput,
    SocialSettingsInput,
} from './types';

// ============================================================
// Helpers
// ============================================================

/**
 * Upsert a settings document by key.
 * Each setting category (site, seo, social) is stored as a single
 * document keyed by its category name.
 */
async function upsertSetting(key: string, value: unknown): Promise<void> {
    const collection = await getCollection(COLLECTIONS.settings);
    await collection.updateOne(
        { key },
        { $set: { key, value, updatedAt: new Date() } },
        { upsert: true },
    );
}

/**
 * Guard: require authenticated admin user.
 * Returns the user or an error IApiResponse.
 */
async function requireAdmin(): Promise<
    { success: true; user: AuthUser } | { success: false; error: IApiResponse<never> }
> {
    const authResult = await requireAuth();
    if (!authResult.success || !authResult.data) {
        return {
            success: false,
            error: { success: false, status: 401, error: 'Unauthorized' },
        };
    }
    return { success: true, user: authResult.data };
}

// ============================================================
// Server Actions
// ============================================================

export async function updateSiteSettings(
    input: SiteSettingsInput,
): Promise<IApiResponse<void>> {
    try {
        const auth = await requireAdmin();
        if (!auth.success) return auth.error;

        await upsertSetting('site', input);
        await logActivity('update', 'settings', { entityTitle: 'Site Settings' });

        revalidatePath('/');
        return ok('Site settings updated');
    } catch (err) {
        return handleError(err, 'Failed to update site settings');
    }
}

export async function updateSeoSettings(
    input: SeoSettingsInput,
): Promise<IApiResponse<void>> {
    try {
        const auth = await requireAdmin();
        if (!auth.success) return auth.error;

        await upsertSetting('seo', input);
        await logActivity('update', 'settings', { entityTitle: 'SEO Settings' });

        revalidatePath('/');
        return ok('SEO settings updated');
    } catch (err) {
        return handleError(err, 'Failed to update SEO settings');
    }
}

export async function updateSocialSettings(
    input: SocialSettingsInput,
): Promise<IApiResponse<void>> {
    try {
        const auth = await requireAdmin();
        if (!auth.success) return auth.error;

        await upsertSetting('social', input);
        await logActivity('update', 'settings', { entityTitle: 'Social Links' });

        return ok('Social links updated');
    } catch (err) {
        return handleError(err, 'Failed to update social links');
    }
}

export async function changePassword(
    input: ChangePasswordInput,
): Promise<IApiResponse<void>> {
    try {
        const auth = await requireAdmin();
        if (!auth.success) return auth.error;

        const { currentPassword, newPassword } = input;

        // Fetch user with password hash
        const usersCol = await getCollection<IUser & { passwordHash?: string }>(
            COLLECTIONS.users,
        );
        const dbUser = await usersCol.findOne({
            _id: new ObjectId(auth.user.id),
        });

        if (!dbUser) {
            return error('User not found', 404);
        }

        if (!dbUser.passwordHash) {
            return error(
                'Password authentication not configured for this account',
            );
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
        if (!isValid) {
            return error('Current password is incorrect');
        }

        // Ensure new password differs
        const isSame = await bcrypt.compare(newPassword, dbUser.passwordHash);
        if (isSame) {
            return error(
                'New password must be different from current password',
            );
        }

        // Hash & persist
        const salt = await bcrypt.genSalt(12);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        await usersCol.updateOne(
            { _id: new ObjectId(auth.user.id) },
            {
                $set: {
                    passwordHash: newPasswordHash,
                    updatedAt: new Date(),
                },
            },
        );

        await logActivity('update', 'user', {
            entityId: auth.user.id,
            entityTitle: 'Password Changed',
        });

        return ok('Password changed successfully');
    } catch (err) {
        return handleError(err, 'Failed to change password');
    }
}
