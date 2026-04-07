'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Newsletter from '@/server/models/Newsletter';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import {
    parseNewsletterIds,
    revalidateAdminNewslettersPaths,
} from './shared';

// ========================================================
// Bulk Delete Newsletters
// ========================================================

export const bulkDeleteNewsletters = async (newsletterIds: string[]): Promise<IApiResponse<null>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!newsletterIds || newsletterIds.length === 0) {
            return error('No newsletter IDs provided', 400);
        }

        const validatedIds = parseNewsletterIds(newsletterIds);
        if (!validatedIds) {
            return error('Invalid newsletter IDs', 400);
        }

        await connectDB();

        const objectIds = validatedIds.map(id => new ObjectId(id));
        const result = await Newsletter.deleteMany({ _id: { $in: objectIds } });

        revalidateAdminNewslettersPaths();

        return success(
            null,
            `Successfully deleted ${result.deletedCount} newsletter(s)`
        );
    } catch (err) {
        return handleError(err, 'Failed to bulk delete newsletters');
    }
};

/*
API Responses:
- 200: Newsletters deleted successfully.
- 400: No IDs provided or invalid IDs.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/
