'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Newsletter from '@/server/models/Newsletter';
import { created, error, handleError } from '../../utils/helper';
import { getAdminId } from '../shared';
import {
    validateSubject,
    validatePreviewText,
    validateBody,
    revalidateAdminNewslettersPaths,
} from './shared';
import type { ICreateNewsletterInput } from './types';

// ========================================================
// Create Newsletter
// ========================================================

export const createNewsletter = async (input: ICreateNewsletterInput): Promise<IApiResponse<string>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        // Validate inputs
        const subject = validateSubject(input.subject);
        if (!subject) {
            return error('Subject must be between 2 and 200 characters', 400);
        }

        const previewText = validatePreviewText(input.previewText);

        const body = validateBody(input.body);
        if (!body) {
            return error('Body content must be at least 10 characters', 400);
        }

        // Create newsletter
        const newsletter = await Newsletter.create({
            subject,
            previewText,
            body,
            status: 'draft', // Always starts as draft
            sentAt: null,
            recipientCount: 0,
            successCount: 0,
            failureCount: 0,
            createdBy: authResult.data,
        });

        revalidateAdminNewslettersPaths();

        return created(newsletter._id.toString(), 'Newsletter created successfully');
    } catch (err) {
        return handleError(err, 'Failed to create newsletter');
    }
};

/*
API Responses:
- 201: Newsletter created successfully (always as draft).
- 400: Invalid input (subject too short/long, body too short).
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/
