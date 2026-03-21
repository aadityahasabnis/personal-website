'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Contact from '@/server/models/Contact';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import { parseContactObjectId, revalidateAdminContactsPaths } from './shared';

// ========================================================
// Mutation: Delete Contact
// ========================================================

export const deleteContact = async (
    contactId: string,
): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const objectId = parseContactObjectId(contactId);
        if (!objectId) return error('Invalid contact id', 400);

        await connectDB();

        const deleted = await Contact.findByIdAndDelete(objectId).select('_id');
        if (!deleted) return error('Contact not found', 404);

        revalidateAdminContactsPaths();
        return success(true, 'Contact deleted');
    } catch (err) {
        return handleError(err, 'Failed to delete contact');
    }
};

/*
API Responses:
- 200: Contact deleted.
- 400: Invalid contact id.
- 401: Admin authentication required.
- 404: Contact not found.
- 500: Unexpected server/database error.
*/
