'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { handleError, success } from '../../utils/helper';
import { getAuthenticatedAdmin, mapAdminSettingsProfile } from './shared';
import type { IAdminSettingsProfile } from './types';

// ========================================================
// Query: Get Admin Profile
// ========================================================

export const getAdminProfile = async (): Promise<IApiResponse<IAdminSettingsProfile>> => {
    try {
        const authResult = await getAuthenticatedAdmin();
        if (!authResult.success) return authResult;

        const admin = authResult.data;
        return success(mapAdminSettingsProfile(admin));
    } catch (err) {
        return handleError(err, 'Failed to fetch admin profile');
    }
};

/*
API Responses:
- 200: Admin profile returned successfully.
- 401: Admin authentication required.
- 404: Admin not found for current session.
- 500: Unexpected server/database error.
*/
