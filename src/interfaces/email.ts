// ============================================================
// Email Interfaces - Type definitions for email service
// ============================================================

import type { EmailStatusType, EmailType } from '@/constants/emailConstants';

// ============================================================
// Email Attachment Interface
// ============================================================

export interface IEmailAttachment {
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
    cid?: string;
}

// ============================================================
// Core Email Payload - Input for sendEmail function
// ============================================================

export interface IEmailPayload {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    cc?: string;
    bcc?: string;
    replyTo?: string;
    attachments?: IEmailAttachment[];
}

// ============================================================
// Email Result - Output from send operations
// ============================================================

export interface IEmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
    retryCount?: number;
}

// ============================================================
// OTP Email Data
// ============================================================

export interface IOtpEmailData {
    recipientName?: string;
    otp: string;
    expiresIn?: string;
}

// ============================================================
// Password Reset Email Data
// ============================================================

export interface IPasswordResetEmailData {
    recipientName?: string;
    resetLink: string;
    expiresIn?: string;
}

// ============================================================
// Newsletter Email Data
// ============================================================

export interface INewsletterEmailData {
    subject: string;
    htmlContent: string;
    previewText?: string;
}

// ============================================================
// Test Email Data
// ============================================================

export interface ITestEmailData {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
}

// ============================================================
// Newsletter Recipient Result - Per-subscriber tracking
// ============================================================

export interface INewsletterRecipientResult {
    email: string;
    name: string | null;
    status: EmailStatusType;
    messageId?: string;
    error?: string;
}

// ============================================================
// Newsletter Send Result - Aggregated tracking
// ============================================================

export interface INewsletterSendResult {
    totalRecipients: number;
    sent: number;
    failed: number;
    results: INewsletterRecipientResult[];
}

// ============================================================
// Email Service Stats
// ============================================================

export interface IEmailServiceStats {
    smtpConnected: boolean;
    lastVerified: string | null;
}

// ============================================================
// Email Log Entry - For tracking sent emails
// ============================================================

export interface IEmailLogEntry {
    type: EmailType;
    to: string;
    subject: string;
    status: EmailStatusType;
    messageId?: string;
    error?: string;
    sentAt: Date;
}
