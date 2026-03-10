// =================================================
// Server action response builders
// =================================================

import type { ActionResponse, PaginatedResponse } from './types';

export const success  = <T>(data?: T, message?: string): ActionResponse<T>       => ({ success: true, data, message });
export const created  = <T>(data: T):  ActionResponse<T>                          => ({ success: true, data, message: 'Created successfully' });
export const error    = (message: string): ActionResponse<never>                  => ({ success: false, error: message });
export const notFound = (entity: string): ActionResponse<never>                   => error(`${entity} not found`);
export const duplicate= (entity: string): ActionResponse<never>                   => error(`${entity} already exists`);
export const unauthorized = (): ActionResponse<never>                             => error('Unauthorized');
export const forbidden    = (): ActionResponse<never>                             => error('Forbidden');
export const serverError  = (msg = 'An unexpected error occurred'): ActionResponse<never> => error(msg);

export const paginated = <T>(data: T[], total: number, limit: number, offset: number): PaginatedResponse<T> => ({
    success: true, data,
    metadata: { total, limit, offset, hasMore: offset + data.length < total },
});
