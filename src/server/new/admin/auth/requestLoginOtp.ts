'use server';

// ============================================================
// Request Login OTP - Step 2 of Two-Step Login Flow
// Generates OTP, stores in database, sends email to chosen address
// ============================================================

import { OTP_CONFIG } from '@/constants/emailConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { error, handleError, success } from '../../utils/helper';
import {
    generateOtp,
    getOtpExpiry,
    maskEmail,
    verifyPendingLoginToken,
} from '../../utils/auth-tokens';
import { isEmailConfigured, sendEmailWithRetry, validateEmail } from '../../utils/mail';
import { otpEmailTemplate } from '../../utils/mail-templates';
import {
    findAdminByEmailWithOtp,
    getTargetEmailAddress,
    isValidOtpTarget,
} from './shared';
import type { IRequestLoginOtpInput, IRequestLoginOtpResult } from './types';

/**
 * Step 2 of Two-Step Login: Request OTP delivery.
 * 
 * This action:
 * 1. Validates the pending login token from Step 1
 * 2. Validates the chosen email target (main or recovery)
 * 3. Generates a 6-digit OTP
 * 4. Stores the OTP in the admin document (plaintext with expiry)
 * 5. Sends the OTP via email
 * 
 * Security notes:
 * - Requires valid pending token from Step 1
 * - OTP expires in 5 minutes
 * - Previous OTP is overwritten on new request
 * 
 * @param input - Pending token and target email choice
 * @returns Confirmation of OTP sent with masked email
 * 
 * @example
 * const result = await requestLoginOtp({ 
 *   pendingToken: 'eyJ...', 
 *   targetEmail: 'main' 
 * });
 * // { sent: true, sentTo: 'ad***@gmail.com', expiresIn: '5 minutes' }
 */
export const requestLoginOtp = async (
    input: IRequestLoginOtpInput
): Promise<IApiResponse<IRequestLoginOtpResult>> => {
    try {
        // Validate input
        if (!input.pendingToken) {
            return error('Pending token is required', 400);
        }

        if (!input.targetEmail) {
            return error('Target email selection is required', 400);
        }

        if (!isValidOtpTarget(input.targetEmail)) {
            return error('Invalid target email. Must be "main" or "recovery"', 400);
        }

        // Verify pending login token
        const payload = verifyPendingLoginToken(input.pendingToken);
        if (!payload) {
            return error('Invalid or expired pending token. Please restart login.', 401);
        }

        // Find admin by email from token
        const adminResult = await findAdminByEmailWithOtp(payload.email);
        if (!adminResult.success) {
            return error('Admin not found', 404);
        }

        const admin = adminResult.data;

        // Get target email address
        const targetEmailAddress = getTargetEmailAddress(admin, input.targetEmail);
        if (!targetEmailAddress) {
            return error('Recovery email is not set up. Please use main email.', 400);
        }

        // Validate email address format
        if (!validateEmail(targetEmailAddress)) {
            return error('Invalid target email address', 400);
        }

        // Check email service configuration
        if (!isEmailConfigured()) {
            return error('Email service not configured. Please contact administrator.', 500);
        }

        // Generate OTP and expiry
        const otp = generateOtp();
        const expiresAt = getOtpExpiry();

        // Store OTP in admin document
        await admin.setOtp(otp, expiresAt, targetEmailAddress);
        
        // Debug: Log OTP storage
        console.log('[OTP] Stored OTP for:', admin.email, 'Target:', targetEmailAddress, 'Expires:', expiresAt);

        // Generate email content
        const { html, text } = otpEmailTemplate(
            admin.name,
            otp,
            OTP_CONFIG.expiresInText
        );

        // Send OTP email
        const emailResult = await sendEmailWithRetry(
            {
                to: targetEmailAddress,
                subject: 'Your Login Verification Code',
                html,
                text,
            },
            'OTP'
        );

        if (!emailResult.success) {
            // Clear OTP on email failure to prevent orphaned OTPs
            await admin.clearOtp();
            return error('Failed to send OTP email. Please try again.', 500);
        }

        return success({
            sent: true,
            sentTo: maskEmail(targetEmailAddress),
            expiresIn: OTP_CONFIG.expiresInText,
        });
    } catch (err) {
        return handleError(err, 'Failed to send login OTP');
    }
};

/*
API Responses:
- 200: OTP sent successfully. Returns sent, sentTo (masked), expiresIn.
- 400: Missing/invalid input or recovery email not set.
- 401: Invalid or expired pending token.
- 404: Admin not found.
- 500: Email service error or unexpected failure.
*/
