'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Contact from '@/server/models/Contact';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import { normalizeContactIds, revalidateAdminContactsPaths } from './shared';

// ========================================================
// Mutation: Bulk Delete Contacts
// ========================================================

export const bulkDeleteContacts = async (
    contactIds: string[],
): Promise<IApiResponse<number>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!contactIds.length) return success(0, 'No contacts selected');

        const normalizedIds = normalizeContactIds(contactIds);
        if (!normalizedIds.length) return error('One or more contact ids are invalid', 400);

        await connectDB();

        const result = await Contact.deleteMany({ _id: { $in: normalizedIds } });

        revalidateAdminContactsPaths();
        return success(result.deletedCount, `Deleted ${String(result.deletedCount)} contacts`);
    } catch (err) {
        return handleError(err, 'Failed to delete contacts');
    }
};

/*
API Responses:
- 200: Bulk delete completed.
- 400: One or more contact ids are invalid.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/
