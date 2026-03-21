import { CONTACT_STATUS } from '@/constants/schemaConstants';
import type { ISortParams } from '@/interfaces/actionHelper';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { buildSort } from '../../utils/helper';
import type { ContactFilter, IAdminContactRow } from './types';

interface IContactRowDoc {
    _id: ObjectId;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: IAdminContactRow['status'];
    ipHash?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const ALLOWED_CONTACT_SORT_FIELDS = new Set([
    'createdAt',
    'updatedAt',
    'name',
    'email',
    'subject',
    'status',
]);

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const toAdminContactRow = (doc: IContactRowDoc): IAdminContactRow => ({
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    subject: doc.subject,
    message: doc.message,
    status: doc.status,
    ipHash: doc.ipHash ?? null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
});

export const buildContactMatch = (
    status: ContactFilter = 'all',
    query?: string,
): Record<string, unknown> => {
    const match: Record<string, unknown> = {};

    if (status !== 'all') match.status = status;

    if (query?.trim()) {
        const q = escapeRegex(query.trim());
        match.$or = [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { subject: { $regex: q, $options: 'i' } },
            { message: { $regex: q, $options: 'i' } },
        ];
    }

    return match;
};

export const buildContactSort = (sort?: ISortParams): Record<string, 1 | -1> => {
    if (!sort?.sortBy || !ALLOWED_CONTACT_SORT_FIELDS.has(sort.sortBy)) {
        return { createdAt: -1 };
    }
    return buildSort(sort, { createdAt: -1 });
};

export const parseContactObjectId = (contactId: string): ObjectId | null => {
    if (!ObjectId.isValid(contactId)) return null;
    return new ObjectId(contactId);
};

export const normalizeContactIds = (contactIds: string[]): string[] => {
    const seen = new Set<string>();
    const ids: string[] = [];

    for (const id of contactIds) {
        if (!ObjectId.isValid(id)) return [];
        if (seen.has(id)) continue;
        seen.add(id);
        ids.push(id);
    }

    return ids;
};

export const revalidateAdminContactsPaths = (): void => {
    const paths = ['/admin/messages', '/admin'];
    paths.forEach((path) => revalidatePath(path));
};

export const CONTACT_STATS_STATUS_QUERIES = {
    new: { status: CONTACT_STATUS.NEW },
    read: { status: CONTACT_STATUS.READ },
    replied: { status: CONTACT_STATUS.REPLIED },
    archived: { status: CONTACT_STATUS.ARCHIVED },
} as const;
