'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Contact from '@/server/models/Contact';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import { parseContactObjectId, toAdminContactRow } from './shared';
import type { IAdminContactRow } from './types';

// ========================================================
// Query: Get Contact By Id
// ========================================================

export const getContactById = async (
    contactId: string,
): Promise<IApiResponse<IAdminContactRow | null>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const objectId = parseContactObjectId(contactId);
        if (!objectId) return error('Invalid contact id', 400);

        await connectDB();

        const doc = await Contact.findById(objectId)
            .select('_id name email subject message status ipHash createdAt updatedAt')
            .lean();

        if (!doc) return success(null);
        return success(toAdminContactRow(doc));
    } catch (err) {
        return handleError(err, 'Failed to fetch contact');
    }
};

/*
API Responses:
- 200: Contact returned or null when missing.
- 400: Invalid contact id.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/
