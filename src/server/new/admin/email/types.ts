// ============================================================
// Admin Email Server Actions - Types
// ============================================================

import type { EmailStatusType } from '@/constants/emailConstants';

// ============================================================
// Input Types
// ============================================================

export interface ISendTestEmailInput {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
}

export interface ISendPasswordResetInput {
    resetLink: string;
    expiresIn?: string;
}

export interface ISendOtpInput {
    to: string;
    recipientName?: string;
    otp: string;
    expiresIn?: string;
}

export interface ISendNewsletterInput {
    subject: string;
    htmlContent: string;
    previewText?: string;
    subscriberIds?: string[];
}

// ============================================================
// Result Types
// ============================================================

export interface IEmailConnectionStatus {
    connected: boolean;
    configured: boolean;
    lastChecked: string;
    error?: string;
}

export interface ISendEmailResult {
    sent: boolean;
    messageId?: string;
    error?: string;
}

export interface INewsletterRecipientStatus {
    subscriberId: string;
    email: string;
    name: string | null;
    status: EmailStatusType;
    messageId?: string;
    error?: string;
}

export interface INewsletterResult {
    totalRecipients: number;
    sent: number;
    failed: number;
    results: INewsletterRecipientStatus[];
}

// ============================================================
// API Action Types
// ============================================================

export type EmailAction = 
    | 'verify'
    | 'test'
    | 'password-reset'
    | 'otp'
    | 'newsletter';
