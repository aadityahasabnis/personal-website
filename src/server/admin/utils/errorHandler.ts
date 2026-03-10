// =================================================
// Server action error handler
// =================================================

import type { ActionResponse } from './types';
import { serverError } from './response';

export const handleError = (err: unknown, fallback?: string): ActionResponse<never> => {
    console.error('[Action Error]:', err);
    if (err instanceof Error && process.env.NODE_ENV !== 'production') return serverError(err.message);
    return serverError(fallback);
};

export const tryCatch = async <T>(fn: () => Promise<T>, fallback?: string): Promise<ActionResponse<T>> => {
    try { return { success: true, data: await fn() }; }
    catch (err) { return handleError(err, fallback) as ActionResponse<T>; }
};
