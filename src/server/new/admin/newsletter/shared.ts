import { NEWSLETTER_STATUS } from '@/interfaces/schema/newsletter';
import { SCHEMA_LIMITS } from '@/constants/schemaConstants';
import type { ISortParams } from '@/interfaces/actionHelper';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { buildSort } from '../../utils/helper';
import type {
    AdminNewsletterFilter,
    IAdminNewsletterRow,
} from './types';

export interface IAdminNewsletterLean {
    _id: ObjectId;
    subject: string;
    previewText: string | null;
    body: string;
    status: 'draft' | 'sent';
    sentAt: Date | null;
    recipientCount: number;
    successCount: number;
    failureCount: number;
    createdBy: ObjectId;
    updatedBy: ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAdminNewsletterAdminLean {
    _id: ObjectId;
    name: string;
    email: string;
}

const ALLOWED_NEWSLETTER_SORT_FIELDS = new Set([
    'createdAt',
    'updatedAt',
    'sentAt',
    'subject',
    'status',
    'recipientCount',
    'successCount',
]);

const PREVIEW_MAX_LENGTH = 160;

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toPreview = (value: string): string => {
    // Strip HTML tags for preview
    const text = value.replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
    if (text.length <= PREVIEW_MAX_LENGTH) return text;
    return `${text.slice(0, PREVIEW_MAX_LENGTH - 3)}...`;
};

export const parseNewsletterObjectId = (newsletterId: string): ObjectId | null => {
    if (!ObjectId.isValid(newsletterId)) return null;
    return new ObjectId(newsletterId);
};

export const parseNewsletterIds = (newsletterIds: string[]): string[] | null => {
    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const newsletterId of newsletterIds) {
        if (!ObjectId.isValid(newsletterId)) return null;
        if (seen.has(newsletterId)) continue;
        seen.add(newsletterId);
        normalized.push(newsletterId);
    }

    return normalized;
};

export const buildNewsletterMatch = (params: {
    filter: AdminNewsletterFilter;
    query?: string;
}): Record<string, unknown> => {
    const match: Record<string, unknown> = {};

    if (params.filter === 'draft') match.status = NEWSLETTER_STATUS.DRAFT;
    if (params.filter === 'sent') match.status = NEWSLETTER_STATUS.SENT;

    if (params.query?.trim()) {
        const q = escapeRegex(params.query.trim());
        match.$or = [
            { subject: { $regex: q, $options: 'i' } },
            { previewText: { $regex: q, $options: 'i' } },
            { body: { $regex: q, $options: 'i' } },
        ];
    }

    return match;
};

export const buildNewsletterSort = (sort?: ISortParams): Record<string, 1 | -1> => {
    if (!sort?.sortBy || !ALLOWED_NEWSLETTER_SORT_FIELDS.has(sort.sortBy)) {
        return { createdAt: -1, _id: -1 };
    }

    return buildSort(sort, { createdAt: -1, _id: -1 });
};

export const mapAdminNewsletterRow = (
    row: IAdminNewsletterLean,
    adminMap: Map<string, IAdminNewsletterAdminLean>
): IAdminNewsletterRow => {
    const id = row._id.toString();
    const createdById = row.createdBy.toString();
    const updatedById = row.updatedBy?.toString();

    const createdByAdmin = adminMap.get(createdById);
    const updatedByAdmin = updatedById ? adminMap.get(updatedById) : null;

    const deliveryRate = row.recipientCount > 0
        ? ((row.successCount / row.recipientCount) * 100).toFixed(2)
        : '0.00';

    return {
        id,
        subject: row.subject,
        previewText: row.previewText,
        bodyPreview: toPreview(row.body),
        status: row.status,
        sentAt: row.sentAt ? row.sentAt.toISOString() : null,
        recipientCount: row.recipientCount,
        successCount: row.successCount,
        failureCount: row.failureCount,
        deliveryRate,
        createdBy: createdByAdmin ? {
            id: createdByAdmin._id.toString(),
            name: createdByAdmin.name,
            email: createdByAdmin.email,
        } : null,
        updatedBy: updatedByAdmin ? {
            id: updatedByAdmin._id.toString(),
            name: updatedByAdmin.name,
            email: updatedByAdmin.email,
        } : null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
};

export const validateSubject = (value: string): string | null => {
    const normalized = value.trim();
    if (normalized.length < SCHEMA_LIMITS.NEWSLETTER_SUBJECT_MIN_LENGTH) return null;
    if (normalized.length > SCHEMA_LIMITS.NEWSLETTER_SUBJECT_MAX_LENGTH) return null;
    return normalized;
};

export const validatePreviewText = (value: string | undefined): string | null => {
    if (!value) return null;
    const normalized = value.trim();
    if (normalized.length === 0) return null;
    if (normalized.length > SCHEMA_LIMITS.NEWSLETTER_PREVIEW_TEXT_MAX_LENGTH) return null;
    return normalized;
};

export const validateBody = (value: string): string | null => {
    const normalized = value.trim();
    if (normalized.length < 10) return null; // Minimum meaningful content
    return normalized;
};

export const revalidateAdminNewslettersPaths = (): void => {
    const paths = ['/admin/newsletters', '/admin'];
    for (const path of paths) {
        revalidatePath(path);
    }
};
