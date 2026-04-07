'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import bcrypt from 'bcryptjs';
import { error, handleError, success } from '../../utils/helper';
import { getAuthenticatedAdmin, revalidateAdminSettingsPaths, validatePasswordStrength } from './shared';
import type { IChangeAdminPasswordInput } from './types';

// ========================================================
// Mutation: Change Admin Password
// ========================================================

export const changeAdminPassword = async (
    input: IChangeAdminPasswordInput,
): Promise<IApiResponse<boolean>> => {
    try {
        const currentPassword = input.currentPassword.trim();
        const newPassword = input.newPassword.trim();
        const confirmPassword = input.confirmPassword.trim();

        if (!currentPassword) return error('Current password is required', 400);
        if (!newPassword) return error('New password is required', 400);
        if (!confirmPassword) return error('Please confirm your new password', 400);
        if (newPassword !== confirmPassword) return error('Passwords do not match', 400);

        const strengthError = validatePasswordStrength(newPassword);
        if (strengthError) return error(strengthError, 400);

        const authResult = await getAuthenticatedAdmin(true);
        if (!authResult.success) return authResult;

        const admin = authResult.data;

        if (!admin.passwordHash) {
            return error('Password authentication is not configured for this account', 409);
        }

        const isCurrentValid = await bcrypt.compare(currentPassword, admin.passwordHash);
        if (!isCurrentValid) return error('Current password is incorrect', 400);

        const isSamePassword = await bcrypt.compare(newPassword, admin.passwordHash);
        if (isSamePassword) return error('New password must be different from current password', 400);

        const salt = await bcrypt.genSalt(12);
        admin.passwordHash = await bcrypt.hash(newPassword, salt);

        await admin.save();
        revalidateAdminSettingsPaths();

        return success(true, 'Password changed successfully');
    } catch (err) {
        return handleError(err, 'Failed to change password');
    }
};

/*
API Responses:
- 200: Password changed successfully.
- 400: Validation error, wrong current password, or weak password.
- 401: Admin authentication required.
- 404: Admin not found for current session.
- 409: Password auth not configured for account.
- 500: Unexpected server/database error.
*/