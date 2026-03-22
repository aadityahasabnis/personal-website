'use server';

// ============================================================
// Send Password Reset Email - Admin password recovery
// ============================================================

import { EMAIL_TYPE, PASSWORD_RESET_CONFIG } from '@/constants/emailConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Admin from '@/server/models/Admin';
import { isEmailConfigured, sendEmailWithRetry, validateEmail } from '../../utils/mail';
import { passwordResetEmailTemplate } from '../../utils/mail-templates';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import type { ISendEmailResult, ISendPasswordResetInput } from './types';

export const sendPasswordReset = async (
    input: ISendPasswordResetInput
): Promise<IApiResponse<ISendEmailResult>> => {
    try {
        // Require admin authentication
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        // Validate input
        if (!input.resetLink) {
            return error('Missing required field: resetLink', 400);
        }

        // Validate URL format
        try {
            new URL(input.resetLink);
        } catch {
            return error('Invalid reset link URL format', 400);
        }

        // Check email service configuration
        if (!isEmailConfigured()) {
            return error('Email service not configured. Please set GMAIL_ACCOUNT and GMAIL_PASSWORD.', 500);
        }

        // Connect to database and get admin email
        await connectDB();
        const admin = await Admin.findById(authResult.data).lean();
        
        if (!admin) {
            return error('Admin not found', 404);
        }

        // Validate admin email
        if (!validateEmail(admin.email)) {
            return error('Invalid admin email address', 500);
        }

        // Generate email content from template
        const expiresIn = input.expiresIn ?? PASSWORD_RESET_CONFIG.expiresInText;
        const { html, text } = passwordResetEmailTemplate(
            admin.name,
            input.resetLink,
            expiresIn
        );

        // Send email to admin's primary email
        const result = await sendEmailWithRetry(
            {
                to: admin.email,
                subject: 'Reset Your Password',
                html,
                text,
            },
            EMAIL_TYPE.PASSWORD_RESET
        );

        if (!result.success) {
            return error(result.error ?? 'Failed to send password reset email', 500);
        }

        const successData: ISendEmailResult = { sent: true };
        if (result.messageId) successData.messageId = result.messageId;
        return success(successData);
    } catch (err) {
        return handleError(err, 'Failed to send password reset email');
    }
};
