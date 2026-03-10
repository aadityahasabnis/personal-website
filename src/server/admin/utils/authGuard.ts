// =================================================
// Auth guard for admin server actions
// =================================================

import { auth } from '@/lib/auth/admin';
import { unauthorized } from './response';
import type { ActionResponse } from './types';

export interface AuthUser { id: string; email: string; name: string }

export const getAuthUser = async (): Promise<AuthUser | null> => {
    const session = await auth();
    if (!session?.user?.email) return null;
    return { id: session.user.id, email: session.user.email, name: session.user.name ?? '' };
};

export const requireAuth = async (): Promise<ActionResponse<AuthUser>> => {
    const user = await getAuthUser();
    return user ? { success: true, data: user } : unauthorized();
};

export const withAuth = <TIn, TOut>(
    handler: (input: TIn, user: AuthUser) => Promise<ActionResponse<TOut>>
) => async (input: TIn): Promise<ActionResponse<TOut>> => {
    const result = await requireAuth();
    if (!result.success || !result.data) return result as ActionResponse<TOut>;
    return handler(input, result.data);
};
