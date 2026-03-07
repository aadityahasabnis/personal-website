/**
 * Error Handler Utility
 * 
 * Centralized error handling for server actions.
 */

import type { ActionResponse } from './types';
import { serverError, validationError } from './response';
import type { ZodError } from 'zod';

// ===== ERROR HANDLER =====

export const handleError = (err: unknown, fallbackMessage?: string): ActionResponse<never> => {
    console.error('[Server Action Error]:', err);
    
    // Zod validation error
    if (isZodError(err)) {
        return validationError(err.issues[0]?.message ?? 'Invalid input');
    }
    
    // Standard Error
    if (err instanceof Error) {
        // Don't expose internal error messages in production
        if (process.env.NODE_ENV === 'production') {
            return serverError(fallbackMessage ?? 'An unexpected error occurred');
        }
        return serverError(err.message);
    }
    
    return serverError(fallbackMessage ?? 'An unexpected error occurred');
};

// ===== TYPE GUARDS =====

const isZodError = (err: unknown): err is ZodError => {
    return typeof err === 'object' && err !== null && 'issues' in err && Array.isArray((err as ZodError).issues);
};

// ===== TRY-CATCH WRAPPER =====

export const tryCatch = async <T>(
    fn: () => Promise<T>,
    fallbackMessage?: string
): Promise<ActionResponse<T>> => {
    try {
        const result = await fn();
        return { success: true, data: result };
    } catch (err) {
        return handleError(err, fallbackMessage);
    }
};

// ===== VALIDATION WRAPPER =====

export const withValidation = <TInput, TOutput>(
    schema: { safeParse: (data: TInput) => { success: boolean; data?: TInput; error?: ZodError } },
    handler: (data: TInput) => Promise<ActionResponse<TOutput>>
) => async (input: TInput): Promise<ActionResponse<TOutput>> => {
    const result = schema.safeParse(input);
    if (!result.success) {
        return validationError(result.error?.issues[0]?.message ?? 'Invalid input');
    }
    return handler(result.data as TInput);
};
