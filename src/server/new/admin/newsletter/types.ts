import type { NewsletterStatusType } from '@/interfaces/schema/newsletter';
import type { ITableQueryParams } from '../shared';

// ========================================================
// Admin Newsletter Types
// ========================================================

export type AdminNewsletterFilter = 'all' | 'draft' | 'sent';

export interface IAdminNewslettersTableQuery extends ITableQueryParams {
    filter?: AdminNewsletterFilter;
}

export interface IAdminNewsletterRow {
    id: string;
    subject: string;
    previewText: string | null;
    bodyPreview: string;
    status: NewsletterStatusType;
    sentAt: string | null;
    recipientCount: number;
    successCount: number;
    failureCount: number;
    deliveryRate: string; // Percentage as string
    createdBy: {
        id: string;
        name: string;
        email: string;
    } | null;
    updatedBy: {
        id: string;
        name: string;
        email: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface IAdminNewsletterStats {
    totalSent: number;
    totalDrafts: number;
    totalRecipients: number;
    totalSuccesses: number;
    totalFailures: number;
    deliveryRate: string;
}

export interface ICreateNewsletterInput {
    subject: string;
    previewText?: string;
    body: string;
}

export interface IUpdateNewsletterInput {
    subject?: string;
    previewText?: string;
    body?: string;
}

export interface ISendNewsletterResult {
    recipientCount: number;
    successCount: number;
    failureCount: number;
    deliveryRate: string;
}
