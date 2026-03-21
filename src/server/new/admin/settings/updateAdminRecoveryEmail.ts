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
} from './shared';
import type { IAdminSettingsProfile, IUpdateAdminRecoveryEmailInput } from './types';

// ========================================================
// Mutation: Update Recovery Email
// ========================================================

export const updateAdminRecoveryEmail = async (
    input: IUpdateAdminRecoveryEmailInput,
): Promise<IApiResponse<IAdminSettingsProfile>> => {
    try {
        const authResult = await getAuthenticatedAdmin();
        if (!authResult.success) return authResult;

        const admin = authResult.data;
        const rawRecoveryEmail = normalizeOptionalString(input.recoveryEmail);
        const normalizedRecoveryEmail = rawRecoveryEmail ? normalizeEmail(rawRecoveryEmail) : null;

        if (normalizedRecoveryEmail && !validateAdminEmail(normalizedRecoveryEmail)) {
            return error('Recovery email must be a valid email address', 400);
        }

        if (normalizedRecoveryEmail === admin.email) {
            return error('Recovery email cannot be the same as primary admin email', 400);
        }

        if (normalizedRecoveryEmail) {
            const existing = await Admin.findOne({
                recoveryEmail: normalizedRecoveryEmail,
                _id: { $ne: admin._id },
            })
                .select('_id')
                .lean();

            if (existing) return error('Recovery email is already used by another admin', 409);
        }

        const currentRecoveryEmail = admin.recoveryEmail ?? null;
        if (currentRecoveryEmail === normalizedRecoveryEmail) {
            return success(mapAdminSettingsProfile(admin), 'No recovery email changes detected');
        }

        admin.recoveryEmail = normalizedRecoveryEmail;
        await admin.save();

        revalidateAdminSettingsPaths();
        return success(mapAdminSettingsProfile(admin), 'Recovery email updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update recovery email');
    }
};

/*
API Responses:
- 200: Recovery email updated (or no-op state returned).
- 400: Invalid recovery email or same-as-primary email.
- 401: Admin authentication required.
- 404: Admin not found for current session.
- 409: Recovery email conflict with another admin.
- 500: Unexpected server/database error.
*/