'use server';

// ============================================================
// Send Test Email - Admin functionality to test email delivery
// ============================================================

import { EMAIL_TYPE } from '@/constants/emailConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { isEmailConfigured, sendEmailWithRetry, validateEmail } from '../../utils/mail';
import { testEmailTemplate } from '../../utils/mail-templates';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import type { ISendEmailResult, ISendTestEmailInput } from './types';

export const sendTestEmail = async (
    input: ISendTestEmailInput
): Promise<IApiResponse<ISendEmailResult>> => {
    try {
        // Require admin authentication
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        // Validate input
        if (!input.to || !input.subject || !input.body) {
            return error('Missing required fields: to, subject, body', 400);
        }

        // Validate email format
        if (!validateEmail(input.to)) {
            return error('Invalid email address format', 400);
        }

        // Check email service configuration
        if (!isEmailConfigured()) {
            return error('Email service not configured. Please set GMAIL_ACCOUNT and GMAIL_PASSWORD.', 500);
        }

        // Validate optional CC/BCC
        if (input.cc && !validateEmail(input.cc)) {
            return error('Invalid CC email address format', 400);
        }
        if (input.bcc && !validateEmail(input.bcc)) {
            return error('Invalid BCC email address format', 400);
        }

        // Generate email content from template
        const { html, text } = testEmailTemplate(input.subject, input.body);

        // Build email payload
        const emailPayload: Parameters<typeof sendEmailWithRetry>[0] = {
            to: input.to,
            subject: input.subject,
            html,
            text,
        };
        if (input.cc) emailPayload.cc = input.cc;
        if (input.bcc) emailPayload.bcc = input.bcc;

        // Send email
        const result = await sendEmailWithRetry(emailPayload, EMAIL_TYPE.TEST);

        if (!result.success) {
            return error(result.error ?? 'Failed to send test email', 500);
        }

        const successData: ISendEmailResult = { sent: true };
        if (result.messageId) successData.messageId = result.messageId;
        return success(successData);
    } catch (err) {
        return handleError(err, 'Failed to send test email');
    }
};
