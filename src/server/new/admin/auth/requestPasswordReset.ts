'use server';

// ============================================================
// Request Password Reset - Forgot Password Step 1
// Generates reset token, stores in database, sends email
// ============================================================

import { PASSWORD_RESET_CONFIG } from '@/constants/emailConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Admin from '@/server/models/Admin';
import { generateResetToken, getResetTokenExpiry } from '../../utils/auth-tokens';
import { error, success } from '../../utils/helper';
import { isEmailConfigured, sendEmailWithRetry, validateEmail } from '../../utils/mail';
import { passwordResetEmailTemplate } from '../../utils/mail-templates';
import { isValidEmail, normalizeEmail } from './shared';
import type { IRequestPasswordResetInput, IRequestPasswordResetResult } from './types';

/**
 * Forgot Password Step 1: Request password reset email.
 * 
 * This action:
 * 1. Validates the email format
 * 2. Looks up admin by email (silently)
 * 3. Generates a 16-character reset token
 * 4. Stores token with 15-minute expiry
 * 5. Sends reset email to admin's primary email
 * 
 * Security notes:
 * - Always returns success to prevent email enumeration
 * - Token is sent only to registered admin emails
 * - Token expires in 15 minutes
 * - Previous token is overwritten on new request
 * - Reset email always goes to primary email (not recovery)
 * 
 * @param input - Email address to send reset link to
 * @returns Generic success message (regardless of email existence)
 * 
 * @example
 * const result = await requestPasswordReset({ email: 'admin@example.com' });
 * // { sent: true, message: 'If an account exists...' }
 */
export const requestPasswordReset = async (
    input: IRequestPasswordResetInput
): Promise<IApiResponse<IRequestPasswordResetResult>> => {
    // Generic response to prevent email enumeration
    const genericResponse: IRequestPasswordResetResult = {
        sent: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
    };

    try {
        // Validate input
        const email = input.email?.trim();

        if (!email) {
            return error('Email is required', 400);
        }

        if (!isValidEmail(email)) {
            return error('Invalid email format', 400);
        }

        // Check email service configuration first
        if (!isEmailConfigured()) {
            return error('Email service not configured. Please contact administrator.', 500);
        }

        // Find admin by email
        await connectDB();
        const admin = await Admin.findByEmailWithResetToken(normalizeEmail(email));

        // If admin doesn't exist, return generic response (don't reveal this)
        if (!admin) {
            return success(genericResponse);
        }

        // Check if admin has password authentication
        if (!admin.passwordHash) {
            // Account exists but uses OAuth - still return generic response
            return success(genericResponse);
        }

        // Validate email address for sending
        if (!validateEmail(admin.email)) {
            // Shouldn't happen, but safety check
            return success(genericResponse);
        }

        // Generate reset token and expiry
        const token = generateResetToken();
        const expiresAt = getResetTokenExpiry();

        // Store token in admin document
        await admin.setPasswordResetToken(token, expiresAt);

        // Build reset link
        // In production, this would use the actual domain
        const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
        const resetLink = `${baseUrl}/admin/reset-password?token=${token}`;

        // Generate email content
        const { html, text } = passwordResetEmailTemplate(
            admin.name,
            resetLink,
            PASSWORD_RESET_CONFIG.expiresInText
        );

        // Send reset email
        const emailResult = await sendEmailWithRetry(
            {
                to: admin.email, // Always send to primary email
                subject: 'Reset Your Password',
                html,
                text,
            },
            'PASSWORD_RESET'
        );

        if (!emailResult.success) {
            // Clear token on email failure
            await admin.clearPasswordResetToken();
        }

        return success(genericResponse);
    } catch (err) {
        void err;
        return success(genericResponse);
    }
};

/*
API Responses:
- 200: Always returns success message (prevents email enumeration).
- 400: Missing or invalid email format.
- 500: Email service not configured.

Note: Even if the email doesn't exist or sending fails, 
200 is returned with a generic message to prevent enumeration.
*/
