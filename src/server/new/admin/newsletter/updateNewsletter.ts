'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Newsletter from '@/server/models/Newsletter';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import {
    parseNewsletterObjectId,
    validateSubject,
    validatePreviewText,
    validateBody,
    revalidateAdminNewslettersPaths,
} from './shared';
import type { IUpdateNewsletterInput } from './types';

// ========================================================
// Update Newsletter
// ========================================================

export const updateNewsletter = async (
    newsletterId: string,
    input: IUpdateNewsletterInput
): Promise<IApiResponse<null>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const id = parseNewsletterObjectId(newsletterId);
        if (!id) {
            return error('Invalid newsletter ID', 400);
        }

        await connectDB();

        // Check if newsletter exists and is draft
        const newsletter = await Newsletter.findById(id);
        if (!newsletter) {
            return error('Newsletter not found', 404);
        }

        if (!newsletter.isDraft()) {
            return error('Sent newsletters cannot be modified', 403);
        }

        // Validate and update fields
        const updates: Record<string, unknown> = {};

        if (input.subject !== undefined) {
            const subject = validateSubject(input.subject);
            if (!subject) {
                return error('Subject must be between 2 and 200 characters', 400);
            }
            updates.subject = subject;
        }

        if (input.previewText !== undefined) {
            updates.previewText = validatePreviewText(input.previewText);
        }

        if (input.body !== undefined) {
            const body = validateBody(input.body);
            if (!body) {
                return error('Body content must be at least 10 characters', 400);
            }
            updates.body = body;
        }

        if (Object.keys(updates).length === 0) {
            return success(null, 'No changes to update');
        }

        updates.updatedBy = authResult.data;
        updates.updatedAt = new Date();

        await Newsletter.updateOne({ _id: id }, { $set: updates });

        revalidateAdminNewslettersPaths();

        return success(null, 'Newsletter updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update newsletter');
    }
};

/*
API Responses:
- 200: Newsletter updated successfully.
- 400: Invalid newsletter ID or input validation failed.
- 403: Cannot modify sent newsletters.
- 404: Newsletter not found.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/
