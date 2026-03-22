'use server';

// ============================================================
// Verify Credentials - Step 1 of Two-Step Login Flow
// Validates email/password and returns pending token + email options
// ============================================================

import type { IApiResponse } from '@/interfaces/actionHelper';
import bcrypt from 'bcryptjs';
import { error, handleError, success } from '../../utils/helper';
import { createPendingLoginToken, maskEmail } from '../../utils/auth-tokens';
import { findAdminByEmailWithPassword, isValidEmail, normalizeEmail } from './shared';
import type {
    IEmailOption,
    IVerifyCredentialsInput,
    IVerifyCredentialsResult,
} from './types';

/**
 * Step 1 of Two-Step Login: Verify admin credentials.
 * 
 * This action validates the admin's email and password without creating
 * a session. On success, it returns:
 * - A temporary JWT token (valid for 5 minutes) to continue the OTP flow
 * - Email options for OTP delivery (main email and recovery email if set)
 * 
 * Security notes:
 * - Does not create a session (OTP verification required)
 * - Returns same error message for invalid email/password to prevent enumeration
 * - Pending token is short-lived (5 minutes)
 * 
 * @param input - Email and password credentials
 * @returns Pending token and email options on success
 * 
 * @example
 * const result = await verifyCredentials({ 
 *   email: 'admin@example.com', 
 *   password: 'SecurePass123' 
 * });
 * // { pendingToken: 'eyJ...', emailOptions: [...], adminName: 'Admin' }
 */
export const verifyCredentials = async (
    input: IVerifyCredentialsInput
): Promise<IApiResponse<IVerifyCredentialsResult>> => {
    try {
        // Validate input
        const email = input.email?.trim();
        const password = input.password;

        if (!email) {
            return error('Email is required', 400);
        }

        if (!isValidEmail(email)) {
            return error('Invalid email format', 400);
        }

        if (!password) {
            return error('Password is required', 400);
        }

        // Find admin with password hash
        const adminResult = await findAdminByEmailWithPassword(email);
        if (!adminResult.success) {
            // Return generic error to prevent email enumeration
            return error('Invalid credentials', 401);
        }

        const admin = adminResult.data;

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.passwordHash!);
        if (!isValidPassword) {
            return error('Invalid credentials', 401);
        }

        // Build email options for OTP delivery
        const emailOptions: IEmailOption[] = [
            {
                type: 'main',
                maskedEmail: maskEmail(admin.email),
            },
        ];

        // Add recovery email option if set
        if (admin.recoveryEmail) {
            emailOptions.push({
                type: 'recovery',
                maskedEmail: maskEmail(admin.recoveryEmail),
            });
        }

        // Create pending login token (5 minute expiry)
        const pendingToken = createPendingLoginToken(
            admin._id.toString(),
            normalizeEmail(email)
        );

        return success({
            pendingToken,
            emailOptions,
            adminName: admin.name,
        });
    } catch (err) {
        return handleError(err, 'Failed to verify credentials');
    }
};

/*
API Responses:
- 200: Credentials valid. Returns pendingToken, emailOptions, adminName.
- 400: Missing or invalid input (email/password).
- 401: Invalid credentials (wrong email or password).
- 409: Password auth not configured for account.
- 500: Unexpected server/database error.
*/
