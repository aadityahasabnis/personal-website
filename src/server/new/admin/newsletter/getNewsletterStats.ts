'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Newsletter from '@/server/models/Newsletter';
import { handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import type { IAdminNewsletterStats } from './types';

// ========================================================
// Query: Newsletter Stats
// ========================================================

export const getNewsletterStats = async (): Promise<IApiResponse<IAdminNewsletterStats>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const stats = await Newsletter.getNewsletterStats();

        return success(stats);
    } catch (err) {
        return handleError(err, 'Failed to fetch newsletter stats');
    }
};

/*
API Responses:
- 200: Newsletter stats returned.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/
