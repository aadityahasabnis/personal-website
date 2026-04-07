'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import Admin from '@/server/models/Admin';
import { error, handleError, success } from '../../utils/helper';
import {
    getAuthenticatedAdmin,
    mapAdminSettingsProfile,
    normalizeEmail,
    normalizeOptionalString,
    revalidateAdminSettingsPaths,
    validateAdminEmail,
    validateAdminName,
    validateImageUrl,
} from './shared';
import type { IAdminSettingsProfile, IUpdateAdminProfileInput } from './types';

// ========================================================
// Mutation: Update Admin Profile
// ========================================================

export const updateAdminProfile = async (
    input: IUpdateAdminProfileInput,
): Promise<IApiResponse<IAdminSettingsProfile>> => {
    try {
        const authResult = await getAuthenticatedAdmin();
        if (!authResult.success) return authResult;

        const admin = authResult.data;

        const normalizedName = input.name.trim();
        const normalizedEmail = normalizeEmail(input.email);
        const normalizedImage =
            typeof input.image === 'undefined' ? undefined : normalizeOptionalString(input.image);

        const nameError = validateAdminName(normalizedName);
        if (nameError) return error(nameError, 400);

        if (!validateAdminEmail(normalizedEmail)) {
            return error('Email must be a valid email address', 400);
        }

        if (typeof normalizedImage !== 'undefined') {
            const imageError = validateImageUrl(normalizedImage);
            if (imageError) return error(imageError, 400);
        }

        if (normalizedEmail !== admin.email) {
            const existing = await Admin.findOne({
                email: normalizedEmail,
                _id: { $ne: admin._id },
            })
                .select('_id')
                .lean();

            if (existing) return error('Email is already used by another admin', 409);
        }

        const hasNameChange = admin.name !== normalizedName;
        const hasEmailChange = admin.email !== normalizedEmail;
        const hasImageChange =
            typeof normalizedImage !== 'undefined' && (admin.image ?? null) !== normalizedImage;

        if (!hasNameChange && !hasEmailChange && !hasImageChange) {
            return success(mapAdminSettingsProfile(admin), 'No profile changes detected');
        }

        admin.name = normalizedName;
        admin.email = normalizedEmail;
        if (typeof normalizedImage !== 'undefined') admin.image = normalizedImage;

        await admin.save();
        revalidateAdminSettingsPaths();

        return success(
            mapAdminSettingsProfile(admin),
            hasEmailChange
                ? 'Profile updated successfully. Please re-login if session email appears outdated.'
                : 'Profile updated successfully',
        );
    } catch (err) {
        return handleError(err, 'Failed to update admin profile');
    }
};

/*
API Responses:
- 200: Admin profile updated (or no-op state returned).
- 400: Invalid name/email/image values.
- 401: Admin authentication required.
- 404: Admin not found for current session.
- 409: Email conflict with another admin.
- 500: Unexpected server/database error.
*/