'use server';

// ============================================================
// Verify Reset Token - Forgot Password Step 2 (Optional)
// Checks if a password reset token is valid before showing form
// ============================================================

import type { IApiResponse } from '@/interfaces/actionHelper';
import { error, handleError, success } from '../../utils/helper';
import { isResetTokenExpired, maskEmail } from '../../utils/auth-tokens';
import { findAdminByResetToken } from './shared';
import type { IVerifyResetTokenInput, IVerifyResetTokenResult } from './types';

/**
 * Forgot Password Step 2 (Optional): Verify reset token validity.
 * 
 * This action is used by the frontend to check if a reset token
 * is valid before displaying the password reset form. This provides
 * a better UX by showing an error message early if the token is
 * invalid or expired.
 * 
 * Security notes:
 * - Does not consume the token (can be called multiple times)
 * - Only reveals masked email on valid tokens
 * - Returns generic error for invalid/expired tokens
 * 
 * @param input - Reset token from email link
 * @returns Token validity status and masked email if valid
 * 
 * @example
 * const result = await verifyResetToken({ token: 'a7Bx9kM2pQ4rS1tV' });
 * // { valid: true, email: 'ad***@gmail.com' }
 */
export const verifyResetToken = async (
    input: IVerifyResetTokenInput
): Promise<IApiResponse<IVerifyResetTokenResult>> => {
    try {
        // Validate input
        if (!input.token) {
            return error('Reset token is required', 400);
        }

        const token = input.token.trim();
        if (!token) {
            return error('Reset token is required', 400);
        }

        // Find admin by reset token
        const adminResult = await findAdminByResetToken(token);
        if (!adminResult.success) {
            return success({ valid: false });
        }

        const admin = adminResult.data;

        // Check if token data exists
        if (!admin.passwordResetToken) {
            return success({ valid: false });
        }

        // Check if token has expired
        if (isResetTokenExpired(admin.passwordResetToken.expiresAt)) {
            // Clear expired token
            await admin.clearPasswordResetToken();
            return success({ valid: false });
        }

        // Token is valid
        return success({
            valid: true,
            email: maskEmail(admin.email),
        });
    } catch (err) {
        return handleError(err, 'Failed to verify reset token');
    }
};

/*
API Responses:
- 200: Returns validity status. If valid, includes masked email.
- 400: Missing token in request.
- 500: Unexpected server/database error.

Note: Invalid or expired tokens return { valid: false }, not an error,
to allow the frontend to display appropriate messaging.
*/
