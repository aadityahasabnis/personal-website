// =================================================
// Server Action Response Types
// Strict discriminated unions for type safety
// =================================================

// Success response
type ApiSuccess<T> = {
    success: true;
    status: 200 | 201;
    data: T;
    message?: string;
};

// Error response
type ApiError = {
    success: false;
    status: 400 | 401 | 403 | 404 | 409 | 429 | 500;
    error: string;
};

// Combined API response (discriminated union)
export type IApiResponse<T> = ApiSuccess<T> | ApiError;

// Paginated response
export type IPaginatedResponse<T> = {
    success: true;
    status: 200;
    data: T[];
    pagination: {
        total: number;
        offset: number;
        limit: number;
        hasMore: boolean;
    };
} | ApiError;

// Pagination input params
export interface IPaginationParams {
    offset?: number;
    limit?: number;
}

// Sort input params
export interface ISortParams {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
