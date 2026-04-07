import type { IAudit, IDocument, ITimestamps } from './base';

// ============================================================
// Newsletter Status
// ============================================================

export const NEWSLETTER_STATUS = { DRAFT: 'draft', SENT: 'sent' } as const;
export type NewsletterStatusType = (typeof NEWSLETTER_STATUS)[keyof typeof NEWSLETTER_STATUS];

// ============================================================
// Newsletter Interface
// ============================================================

export interface INewsletter extends IDocument, ITimestamps, IAudit {
    subject: string;
    previewText: string | null; // Email preview text (optional)
    body: string; // HTML content from Authorly editor
    status: NewsletterStatusType;
    sentAt: Date | null; // Timestamp when newsletter was sent
    recipientCount: number; // Number of subscribers who received it
    successCount: number; // Number of successful deliveries
    failureCount: number; // Number of failed deliveries
}
