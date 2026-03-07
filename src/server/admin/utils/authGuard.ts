/**
 * Authentication Guard Utility
 * 
 * Protects server actions with authentication checks.
 */

import { auth } from '@/lib/auth';
import type { ActionResponse } from './types';
import { unauthorized, forbidden } from './response';

// ===== AUTH TYPES =====

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'editor';
}

// ===== AUTH GUARD =====

export const getAuthUser = async (): Promise<AuthUser | null> => {
    try {
        const session = await auth();
        if (!session?.user?.email) return null;
        
        return {
            id: session.user.id ?? '',
            email: session.user.email,
            name: session.user.name ?? '',
            role: (session.user as { role?: string }).role as 'admin' | 'editor' ?? 'editor',
        };
    } catch {
        return null;
    }
};

export const requireAuth = async (): Promise<ActionResponse<AuthUser>> => {
    const user = await getAuthUser();
    if (!user) return unauthorized();
    return { success: true, data: user };
};

export const requireAdmin = async (): Promise<ActionResponse<AuthUser>> => {
    const user = await getAuthUser();
    if (!user) return unauthorized();
    if (user.role !== 'admin') return forbidden();
    return { success: true, data: user };
};

// ===== AUTH WRAPPER =====

export const withAuth = <TInput, TOutput>(
    handler: (input: TInput, user: AuthUser) => Promise<ActionResponse<TOutput>>
) => async (input: TInput): Promise<ActionResponse<TOutput>> => {
    const authResult = await requireAuth();
    if (!authResult.success || !authResult.data) {
        return authResult as ActionResponse<TOutput>;
    }
    return handler(input, authResult.data);
};

export const withAdminAuth = <TInput, TOutput>(
    handler: (input: TInput, user: AuthUser) => Promise<ActionResponse<TOutput>>
) => async (input: TInput): Promise<ActionResponse<TOutput>> => {
    const authResult = await requireAdmin();
    if (!authResult.success || !authResult.data) {
        return authResult as ActionResponse<TOutput>;
    }
    return handler(input, authResult.data);
};
