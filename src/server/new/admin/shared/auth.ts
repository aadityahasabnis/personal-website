import type { IApiResponse } from '@/interfaces/actionHelper';
import { auth } from '@/lib/auth/admin';
import { error, success } from '../../utils/helper';

// ========================================================
// Auth
// ========================================================

export const getAdminId = async (): Promise<IApiResponse<string>> => {
    const session = await auth();
    const adminId = session?.user?.id;
    if (!adminId) return error('Unauthorized', 401);
    return success(adminId);
};
