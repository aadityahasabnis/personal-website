// ============================================================
// Mail Service - Universal email sending logic with Nodemailer
// ============================================================

import nodemailer from 'nodemailer';

import {
    DEFAULT_SENDER,
    EMAIL_RETRY_CONFIG,
    EMAIL_VALIDATION,
    GMAIL_SMTP_CONFIG,
    type EmailType,
} from '@/constants/emailConstants';
import { env } from '@/env';
import type { IEmailPayload, IEmailResult } from '@/interfaces/email';

// ============================================================
// Email Validation - RFC 5322 compliant
// ============================================================

export const validateEmail = (email: string): boolean =>
    Boolean(email) &&
    typeof email === 'string' &&
    email.length <= EMAIL_VALIDATION.maxLength &&
    EMAIL_VALIDATION.regex.test(email);

// ============================================================
// Email Sanitization - Clean and normalize, prevent header injection
// ============================================================

export const sanitizeEmailAddress = (email: string): string =>
    email && typeof email === 'string'
        ? email.toLowerCase().trim().replace(/[\r\n]/g, '')
        : '';

// ============================================================
// Delay Helper - Promise-based delay for retry backoff
// ============================================================

export const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// Transporter Singleton
// ============================================================

let transporter: nodemailer.Transporter | undefined;

// ============================================================
// Get Transporter - Get or create SMTP transporter
// ============================================================

export const getTransporter = (): nodemailer.Transporter => {
    if (!env.GMAIL_ACCOUNT || !env.GMAIL_PASSWORD) {
        throw new Error('Email configuration missing: GMAIL_ACCOUNT and GMAIL_PASSWORD required');
    }

    transporter ??= nodemailer.createTransport({
        ...GMAIL_SMTP_CONFIG,
        auth: {
            user: env.GMAIL_ACCOUNT,
            pass: env.GMAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    return transporter;
};

// ============================================================
// Reset Transporter - For testing purposes
// ============================================================

export const resetTransporter = (): void => {
    transporter = undefined;
};

// ============================================================
// Verify Connection - Test SMTP connection
// ============================================================

export const verifyConnection = async (): Promise<boolean> => {
    try {
        const t = getTransporter();
        await t.verify();
        return true;
    } catch (error) {
        console.error('[Mail] SMTP connection verification failed:', error);
        return false;
    }
};

// ============================================================
// Check Email Configuration - Validate env vars are set
// ============================================================

export const isEmailConfigured = (): boolean =>
    Boolean(env.GMAIL_ACCOUNT && env.GMAIL_PASSWORD);

// ============================================================
// Send Email - Core email sending function
// ============================================================

export const sendEmail = async (
    payload: IEmailPayload,
    emailType: EmailType
): Promise<IEmailResult> => {
    // Validate configuration
    if (!isEmailConfigured()) {
        return {
            success: false,
            error: 'Email service not configured. Missing GMAIL_ACCOUNT or GMAIL_PASSWORD.',
        };
    }

    const t = getTransporter();
    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];

    // Validate all recipient emails
    const invalidRecipients = recipients.filter((email) => !validateEmail(email));
    if (invalidRecipients.length > 0) {
        return {
            success: false,
            error: `Invalid email address(es): ${invalidRecipients.join(', ')}`,
        };
    }

    // Sanitize all recipients
    const sanitizedTo = recipients.map(sanitizeEmailAddress);

    try {
        const info = await t.sendMail({
            from: `"${DEFAULT_SENDER.name}" <${env.GMAIL_ACCOUNT}>`,
            to: sanitizedTo.join(', '),
            cc: payload.cc,
            bcc: payload.bcc,
            replyTo: payload.replyTo ?? env.GMAIL_ACCOUNT,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
            attachments: payload.attachments,
        });

        console.log(`[Mail] ${emailType} sent to ${sanitizedTo[0]} (${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Mail] Failed to send ${emailType} to ${sanitizedTo[0]}:`, errorMessage);
        return { success: false, error: errorMessage };
    }
};

// ============================================================
// Send Email With Retry - Send email with exponential backoff retry
// ============================================================

export const sendEmailWithRetry = async (
    payload: IEmailPayload,
    emailType: EmailType
): Promise<IEmailResult> => {
    let lastError = 'Unknown error';
    let retryCount = 0;

    for (let attempt = 1; attempt <= EMAIL_RETRY_CONFIG.maxAttempts; attempt++) {
        const result = await sendEmail(payload, emailType);

        if (result.success) {
            return { ...result, retryCount };
        }

        lastError = result.error ?? 'Unknown error';
        retryCount = attempt;

        // Don't retry on configuration errors
        if (lastError.includes('not configured') || lastError.includes('Invalid email')) {
            break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < EMAIL_RETRY_CONFIG.maxAttempts) {
            const delayTime =
                EMAIL_RETRY_CONFIG.initialDelayMs *
                Math.pow(EMAIL_RETRY_CONFIG.backoffMultiplier, attempt - 1);
            await delay(delayTime);
        }
    }

    return { success: false, error: lastError, retryCount };
};

// ============================================================
// Batch Send Emails - Send to multiple recipients in batches
// ============================================================

export interface IBatchEmailResult {
    email: string;
    success: boolean;
    messageId?: string;
    error?: string;
}

export const sendEmailBatch = async (
    emails: Array<{ email: string; payload: IEmailPayload }>,
    emailType: EmailType,
    batchSize: number,
    delayBetweenBatches: number
): Promise<IBatchEmailResult[]> => {
    const results: IBatchEmailResult[] = [];

    // Split into batches
    const batches: Array<Array<{ email: string; payload: IEmailPayload }>> = [];
    for (let i = 0; i < emails.length; i += batchSize) {
        batches.push(emails.slice(i, i + batchSize));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];

        // Send each email in the batch
        for (const item of batch) {
            const result = await sendEmailWithRetry(item.payload, emailType);
            const batchResult: IBatchEmailResult = {
                email: item.email,
                success: result.success,
            };
            if (result.messageId) batchResult.messageId = result.messageId;
            if (result.error) batchResult.error = result.error;
            results.push(batchResult);
        }

        // Delay between batches (except for the last batch)
        if (batchIndex < batches.length - 1) {
            await delay(delayBetweenBatches);
        }
    }

    return results;
};
