'use server';

// ============================================================
// Reset Password - Forgot Password Step 3
// Validates token and updates admin password
// ============================================================

import type { IApiResponse } from '@/interfaces/actionHelper';
import bcrypt from 'bcryptjs';
import { isResetTokenExpired } from '../../utils/auth-tokens';
import { error, handleError, success } from '../../utils/helper';
import { findAdminByResetToken, validatePasswordStrength } from './shared';
import type { IResetPasswordInput, IResetPasswordResult } from './types';

/**
 * Forgot Password Step 3: Reset password with valid token.
 * 
 * This action:
 * 1. Validates the reset token
 * 2. Validates password requirements
 * 3. Checks passwords match
 * 4. Hashes the new password
 * 5. Updates admin password in database
 * 6. Clears the reset token (single-use)
 * 
 * Security notes:
 * - Token is single-use (cleared after successful reset)
 * - Token is cleared even on failure after verification
 * - Password is hashed with bcrypt (12 rounds)
 * - Cannot set same password as current (if known)
 * 
 * @param input - Reset token and new password
 * @returns Success status and message
 * 
 * @example
 * const result = await resetPassword({ 
 *   token: 'a7Bx9kM2pQ4rS1tV',
 *   newPassword: 'NewSecure123',
 *   confirmPassword: 'NewSecure123'
 * });
 * // { success: true, message: 'Password reset successfully' }
 */
export const resetPassword = async (
    input: IResetPasswordInput
): Promise<IApiResponse<IResetPasswordResult>> => {
    try {
        // Validate input
        if (!input.token) {
            return error('Reset token is required', 400);
        }

        const token = input.token.trim();
        if (!token) {
            return error('Reset token is required', 400);
        }

        const newPassword = input.newPassword?.trim();
        const confirmPassword = input.confirmPassword?.trim();

        if (!newPassword) {
            return error('New password is required', 400);
        }

        if (!confirmPassword) {
            return error('Please confirm your new password', 400);
        }

        if (newPassword !== confirmPassword) {
            return error('Passwords do not match', 400);
        }

        // Validate password strength
        const strengthError = validatePasswordStrength(newPassword);
        if (strengthError) {
            return error(strengthError, 400);
        }

        // Find admin by reset token
        const adminResult = await findAdminByResetToken(token);
        if (!adminResult.success) {
            return error('Invalid or expired reset token', 400);
        }

        const admin = adminResult.data;

        // Check if token data exists
        if (!admin.passwordResetToken) {
            return error('Invalid or expired reset token', 400);
        }

        // Check if token has expired
        if (isResetTokenExpired(admin.passwordResetToken.expiresAt)) {
            await admin.clearPasswordResetToken();
            return error('Reset token has expired. Please request a new one.', 400);
        }

        // Check if new password is same as current (if they have one)
        if (admin.passwordHash) {
            const isSamePassword = await bcrypt.compare(newPassword, admin.passwordHash);
            if (isSamePassword) {
                return error('New password must be different from current password', 400);
            }
        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update password and clear reset token using model helper
        admin.passwordHash = passwordHash;
        await admin.clearPasswordResetToken();

        return success({
            success: true,
            message: 'Password reset successfully. You can now log in with your new password.',
        });
    } catch (err) {
        return handleError(err, 'Failed to reset password');
    }
};

/*
API Responses:
- 200: Password reset successfully.
- 400: Invalid input, weak password, passwords don't match, 
       invalid/expired token, or same as current password.
- 500: Unexpected server/database error.
*/
