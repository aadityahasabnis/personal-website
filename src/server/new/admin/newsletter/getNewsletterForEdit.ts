'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Newsletter from '@/server/models/Newsletter';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import { parseNewsletterObjectId } from './shared';

// =============================================================
// Newsletter Edit Data Type
// =============================================================

export interface INewsletterEdit {
    id: string;
    subject: string;
    previewText: string | null;
    body: string;
    status: 'draft' | 'sent';
    recipientCount: number;
    successCount: number;
    failureCount: number;
    createdAt: string;
    updatedAt: string;
}

// =============================================================
// Get Newsletter for Edit
// =============================================================

export const getNewsletterForEdit = async (
    newsletterId: string
): Promise<IApiResponse<INewsletterEdit>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const id = parseNewsletterObjectId(newsletterId);
        if (!id) {
            return error('Invalid newsletter ID', 400);
        }

        await connectDB();

        const newsletter = await Newsletter.findById(id).select(
            '_id subject previewText body status recipientCount successCount failureCount createdAt updatedAt'
        ).lean();

        if (!newsletter) {
            return error('Newsletter not found', 404);
        }

        const data: INewsletterEdit = {
            id: newsletter._id.toString(),
            subject: newsletter.subject,
            previewText: newsletter.previewText,
            body: newsletter.body,
            status: newsletter.status,
            recipientCount: newsletter.recipientCount,
            successCount: newsletter.successCount,
            failureCount: newsletter.failureCount,
            createdAt: newsletter.createdAt.toISOString(),
            updatedAt: newsletter.updatedAt.toISOString(),
        };

        return success(data);
    } catch (err) {
        return handleError(err, 'Failed to fetch newsletter');
    }
};

/*
API Responses:
- 200: Newsletter data returned successfully.
- 400: Invalid newsletter ID.
- 404: Newsletter not found.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/
