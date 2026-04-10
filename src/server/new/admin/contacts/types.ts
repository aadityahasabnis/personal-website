import type { ContactStatusType } from '@/constants/schemaConstants';
import type { ITableQueryParams } from '../shared';

// ========================================================
// Admin Contacts Types
// ========================================================

export type ContactFilter = 'all' | ContactStatusType;

export interface IContactsTableQuery extends ITableQueryParams {
    status?: ContactFilter;
}

export interface IAdminContactRow {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: ContactStatusType;
    ipHash: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IAdminContactStats {
    total: number;
    new: number;
    read: number;
    replied: number;
    archived: number;
}

export interface IContactResponseInput {
    subject: string;
    body: string;
}

export interface IContactResponseResult {
    contactId: string;
    email: string;
    status: ContactStatusType;
    messageId?: string;
}
