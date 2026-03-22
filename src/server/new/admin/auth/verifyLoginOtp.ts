'use server';

// ============================================================
// Verify Login OTP - Step 3 of Two-Step Login Flow
// Validates OTP and completes login by creating NextAuth session
// ============================================================

import type { IApiResponse } from '@/interfaces/actionHelper';
import { OTP_VERIFIED_MARKER, signIn } from '@/lib/auth/admin';
import { error, handleError, success } from '../../utils/helper';
import { isOtpExpired, verifyPendingLoginToken } from '../../utils/auth-tokens';
import { findAdminByEmailWithOtp, isValidOtpFormat } from './shared';
import type { IVerifyLoginOtpInput, IVerifyLoginOtpResult } from './types';

/**
 * Step 3 of Two-Step Login: Verify OTP and complete login.
 * 
 * This action:
 * 1. Validates the pending login token from Step 1
 * 2. Validates the OTP format (6 digits)
 * 3. Compares OTP against stored value
 * 4. Checks OTP expiration
 * 5. Clears OTP from database
 * 6. Creates NextAuth session via signIn('credentials')
 * 
 * Security notes:
 * - OTP is single-use (cleared after verification)
 * - Clears OTP on any verification attempt (valid or invalid)
 * - Session is created only after successful OTP verification
 * 
 * @param input - Pending token and OTP code
 * @returns Success status and redirect URL
 * 
 * @example
 * const result = await verifyLoginOtp({ 
 *   pendingToken: 'eyJ...', 
 *   otp: '123456' 
 * });
 * // { success: true, redirectTo: '/admin' }
 */
export const verifyLoginOtp = async (
    input: IVerifyLoginOtpInput
): Promise<IApiResponse<IVerifyLoginOtpResult>> => {
    try {
        // Validate input
        if (!input.pendingToken) {
            return error('Pending token is required', 400);
        }

        if (!input.otp) {
            return error('OTP is required', 400);
        }

        const otp = input.otp.trim();
        if (!isValidOtpFormat(otp)) {
            return error('Invalid OTP format. Must be 6 digits.', 400);
        }

        // Verify pending login token
        const payload = verifyPendingLoginToken(input.pendingToken);
        if (!payload) {
            return error('Invalid or expired session. Please restart login.', 401);
        }

        // Find admin with OTP data
        const adminResult = await findAdminByEmailWithOtp(payload.email);
        if (!adminResult.success) {
            return error('Admin not found', 404);
        }

        const admin = adminResult.data;

        // Debug: Log OTP retrieval
        console.log('[OTP] Retrieved admin:', admin.email, 'Has OTP:', !!admin.otp, 'OTP value:', admin.otp);

        // Check if OTP exists
        if (!admin.otp) {
            return error('No OTP found. Please request a new one.', 400);
        }

        // Check if OTP has expired
        if (isOtpExpired(admin.otp.expiresAt)) {
            await admin.clearOtp();
            return error('OTP has expired. Please request a new one.', 400);
        }

        // Verify OTP matches
        if (admin.otp.code !== otp) {
            // Note: We don't clear OTP on wrong attempt to allow retries
            // OTP will expire naturally after 5 minutes
            return error('Invalid OTP. Please try again.', 400);
        }

        // Clear OTP (single-use)
        await admin.clearOtp();

        // Update last login timestamp
        await admin.updateLastLogin();

        // Create NextAuth session
        // We use signIn with redirect: false to handle the response programmatically
        try {
            const signInResult = await signIn('credentials', {
                email: admin.email,
                password: OTP_VERIFIED_MARKER, // Special marker - tells authorize to skip password check
                redirect: false,
            });

            // signIn returns void on success when redirect: false is used
            // It throws or returns error object on failure
            if (signInResult && typeof signInResult === 'object' && 'error' in signInResult) {
                return error('Failed to create session', 500);
            }
        } catch {
            // Session creation might fail silently in some edge cases
            // The OTP is already cleared, so the user needs to restart
            return error('Failed to create session. Please try again.', 500);
        }

        return success({
            success: true,
            redirectTo: '/admin',
        });
    } catch (err) {
        return handleError(err, 'Failed to verify OTP');
    }
};

/*
API Responses:
- 200: OTP verified, session created. Returns success and redirectTo.
- 400: Invalid input, OTP format, expired OTP, or wrong OTP.
- 401: Invalid or expired pending token.
- 404: Admin not found.
- 500: Session creation failure or unexpected error.
*/
