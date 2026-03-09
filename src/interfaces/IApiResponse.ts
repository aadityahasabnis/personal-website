// ===== API RESPONSE TYPES =====

export interface IApiResponse<T = unknown> {
    success: boolean;
    status: number;
    data?: T;
    metadata?: {
        count?: number;
        id?: string;
    };
    message?: string;
    error?: string;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
    metadata: {
        count: number;
        offset: number;
        limit: number;
        hasMore: boolean;
    };
}

// ===== FORM DATA TYPE =====

export type IFormData<T = Record<string, any>> = T;
