'use server';

import { CONTACT_STATUS } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Contact from '@/server/models/Contact';
import { error, handleError, success, updatedNow } from '../../utils/helper';
import { getAdminId } from '../shared';
import { normalizeContactIds, revalidateAdminContactsPaths } from './shared';

// ========================================================
// Mutation: Bulk Archive Contacts
// ========================================================

export const bulkArchiveContacts = async (
    contactIds: string[],
): Promise<IApiResponse<number>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!contactIds.length) return success(0, 'No contacts selected');

        const normalizedIds = normalizeContactIds(contactIds);
        if (!normalizedIds.length) return error('One or more contact ids are invalid', 400);

        await connectDB();

        const result = await Contact.updateMany(
            { _id: { $in: normalizedIds } },
            { $set: { status: CONTACT_STATUS.ARCHIVED, ...updatedNow() } },
        );

        revalidateAdminContactsPaths();
        return success(result.modifiedCount, `Archived ${String(result.modifiedCount)} contacts`);
    } catch (err) {
        return handleError(err, 'Failed to archive contacts');
    }
};

/*
API Responses:
- 200: Bulk archive completed.
- 400: One or more contact ids are invalid.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/
