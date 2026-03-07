/**
 * Action Response Helpers
 * 
 * Standardized response creators for consistent API responses.
 */

import type { ActionResponse, PaginatedResponse } from './types';

// ===== SUCCESS RESPONSES =====

export const success = <T>(data?: T, message?: string): ActionResponse<T> => ({
    success: true,
    data,
    message,
});

export const created = <T>(data: T, message = 'Created successfully'): ActionResponse<T> => ({
    success: true,
    data,
    message,
});

export const paginated = <T>(
    data: T[],
    total: number,
    limit: number,
    offset: number
): PaginatedResponse<T> => ({
    success: true,
    data,
    metadata: {
        total,
        limit,
        offset,
        hasMore: offset + data.length < total,
    },
});

// ===== ERROR RESPONSES =====

export const error = (message: string): ActionResponse<never> => ({
    success: false,
    error: message,
});

export const notFound = (entity: string): ActionResponse<never> => ({
    success: false,
    error: `${entity} not found`,
});

export const duplicate = (entity: string): ActionResponse<never> => ({
    success: false,
    error: `${entity} already exists`,
});

export const unauthorized = (): ActionResponse<never> => ({
    success: false,
    error: 'Unauthorized',
});

export const forbidden = (): ActionResponse<never> => ({
    success: false,
    error: 'Forbidden',
});

export const validationError = (message: string): ActionResponse<never> => ({
    success: false,
    error: message,
});

export const serverError = (message = 'An unexpected error occurred'): ActionResponse<never> => ({
    success: false,
    error: message,
});

// ===== RESPONSE TYPE GUARDS =====

export const isSuccess = <T>(response: ActionResponse<T>): response is ActionResponse<T> & { data: T } => 
    response.success && response.data !== undefined;

export const isError = <T>(response: ActionResponse<T>): response is ActionResponse<T> & { error: string } => 
    !response.success && response.error !== undefined;
