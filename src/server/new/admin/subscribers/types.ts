import type { ITableQueryParams } from '../shared';

// ========================================================
// Admin Subscribers Types
// ========================================================

export type SubscriberFilter = 'all' | 'confirmed' | 'pending' | 'unsubscribed';

export interface ISubscribersTableQuery extends ITableQueryParams {
    filter?: SubscriberFilter;
}

export type SubscriberRowStatus = 'confirmed' | 'pending' | 'unsubscribed';

export interface IAdminSubscriberRow {
    id: string;
    email: string;
    name: string | null;
    confirmed: boolean;
    status: SubscriberRowStatus;
    subscribedAt: string;
    unsubscribedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ISubscriberStats {
    total: number;
    confirmed: number;
    pending: number;
    unsubscribed: number;
    active: number;
}