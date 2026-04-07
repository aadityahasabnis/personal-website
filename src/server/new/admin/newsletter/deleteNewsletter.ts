'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Newsletter from '@/server/models/Newsletter';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import {
    parseNewsletterObjectId,
    revalidateAdminNewslettersPaths,
} from './shared';

// ========================================================
// Delete Newsletter
// ========================================================

export const deleteNewsletter = async (newsletterId: string): Promise<IApiResponse<null>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const id = parseNewsletterObjectId(newsletterId);
        if (!id) {
            return error('Invalid newsletter ID', 400);
        }

        await connectDB();

        const newsletter = await Newsletter.findById(id);
        if (!newsletter) {
            return error('Newsletter not found', 404);
        }

        await Newsletter.deleteOne({ _id: id });

        revalidateAdminNewslettersPaths();

        return success(null, 'Newsletter deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete newsletter');
    }
};

/*
API Responses:
- 200: Newsletter deleted successfully.
- 400: Invalid newsletter ID.
- 404: Newsletter not found.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/
