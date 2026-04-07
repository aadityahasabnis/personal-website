'use server';

// ============================================================
// Send OTP Email - One-time password verification
// ============================================================

import { EMAIL_TYPE, OTP_CONFIG } from '@/constants/emailConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { isEmailConfigured, sendEmailWithRetry, validateEmail } from '../../utils/mail';
import { otpEmailTemplate } from '../../utils/mail-templates';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import type { ISendEmailResult, ISendOtpInput } from './types';

export const sendOtp = async (
    input: ISendOtpInput
): Promise<IApiResponse<ISendEmailResult>> => {
    try {
        // Require admin authentication
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        // Validate input
        if (!input.to || !input.otp) {
            return error('Missing required fields: to, otp', 400);
        }

        // Validate email format
        if (!validateEmail(input.to)) {
            return error('Invalid email address format', 400);
        }

        // Validate OTP format (should be numeric and correct length)
        if (!/^\d+$/.test(input.otp)) {
            return error('OTP must contain only digits', 400);
        }

        if (input.otp.length !== OTP_CONFIG.length) {
            return error(`OTP must be ${OTP_CONFIG.length} digits`, 400);
        }

        // Check email service configuration
        if (!isEmailConfigured()) {
            return error('Email service not configured. Please set GMAIL_ACCOUNT and GMAIL_PASSWORD.', 500);
        }

        // Generate email content from template
        const expiresIn = input.expiresIn ?? OTP_CONFIG.expiresInText;
        const { html, text } = otpEmailTemplate(
            input.recipientName ?? '',
            input.otp,
            expiresIn
        );

        // Send email
        const result = await sendEmailWithRetry(
            {
                to: input.to,
                subject: 'Your Verification Code',
                html,
                text,
            },
            EMAIL_TYPE.OTP
        );

        if (!result.success) {
            return error(result.error ?? 'Failed to send OTP email', 500);
        }

        const successData: ISendEmailResult = { sent: true };
        if (result.messageId) successData.messageId = result.messageId;
        return success(successData);
    } catch (err) {
        return handleError(err, 'Failed to send OTP email');
    }
};
