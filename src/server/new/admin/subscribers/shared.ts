import type { ISortParams } from '@/interfaces/actionHelper';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { buildSort } from '../../utils/helper';
import type { IAdminSubscriberRow, SubscriberFilter, SubscriberRowStatus } from './types';

interface ISubscriberRowDoc {
    _id: ObjectId;
    email: string;
    confirmed?: boolean;
    subscribedAt: Date;
    unsubscribedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const ALLOWED_SORT_FIELDS = new Set(['subscribedAt', 'updatedAt', 'createdAt', 'email', 'confirmed']);

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const resolveStatus = (doc: Pick<ISubscriberRowDoc, 'confirmed' | 'unsubscribedAt'>): SubscriberRowStatus => {
    if (doc.unsubscribedAt) return 'unsubscribed';
    return doc.confirmed ? 'confirmed' : 'pending';
};

export const buildSubscriberMatch = (
    filter: SubscriberFilter = 'all',
    query?: string,
): Record<string, unknown> => {
    const match: Record<string, unknown> = {};

    if (filter === 'confirmed') {
        match.confirmed = true;
        match.unsubscribedAt = null;
    } else if (filter === 'pending') {
        match.confirmed = false;
        match.unsubscribedAt = null;
    } else if (filter === 'unsubscribed') {
        match.unsubscribedAt = { $ne: null };
    }

    if (query?.trim()) {
        const q = escapeRegex(query.trim());
        match.email = { $regex: q, $options: 'i' };
    }

    return match;
};

export const buildSubscriberSort = (sort?: ISortParams): Record<string, 1 | -1> => {
    if (!sort?.sortBy || !ALLOWED_SORT_FIELDS.has(sort.sortBy)) {
        return { subscribedAt: -1 };
    }
    return buildSort(sort, { subscribedAt: -1 });
};

export const toAdminSubscriberRow = (doc: ISubscriberRowDoc): IAdminSubscriberRow => ({
    id: doc._id.toString(),
    email: doc.email,
    confirmed: Boolean(doc.confirmed),
    status: resolveStatus(doc),
    subscribedAt: doc.subscribedAt.toISOString(),
    unsubscribedAt: doc.unsubscribedAt ? doc.unsubscribedAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
});

export const normalizeSubscriberIds = (subscriberIds: string[]): string[] => {
    const seen = new Set<string>();
    const ids: string[] = [];

    for (const id of subscriberIds) {
        if (!ObjectId.isValid(id)) return [];
        if (seen.has(id)) continue;
        seen.add(id);
        ids.push(id);
    }

    return ids;
};

const csvEscape = (value: string): string => `"${value.replace(/"/g, '""')}"`;

export const toSubscribersCsv = (rows: IAdminSubscriberRow[]): string => {
    const headers = ['Email', 'Status', 'Confirmed', 'Subscribed At', 'Unsubscribed At'];
    const lines = rows.map((row) => [
        row.email,
        row.status,
        row.confirmed ? 'Yes' : 'No',
        row.subscribedAt,
        row.unsubscribedAt ?? '',
    ]);

    return [headers.map(csvEscape).join(','), ...lines.map((cells) => cells.map(csvEscape).join(','))].join('\n');
};

export const revalidateSubscriberPaths = (): void => {
    const paths = ['/admin/subscribers', '/admin'];
    paths.forEach((path) => revalidatePath(path));
};