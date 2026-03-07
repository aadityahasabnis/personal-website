/**
 * Shared Types for Admin Server Actions
 * 
 * Generic response types and common interfaces for all admin operations.
 */

// ===== GENERIC RESPONSE TYPES =====

export interface ActionResponse<T = void> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ActionResponse<T[]> {
    metadata: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

// ===== REQUEST TYPES =====

export interface PaginationRequest {
    limit?: number;
    offset?: number;
}

export interface SortRequest {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface FilterRequest {
    search?: string;
    status?: string;
    [key: string]: unknown;
}

// ===== COMMON ENTITY TYPES =====

export interface TimestampFields {
    createdAt: Date;
    updatedAt: Date;
}

export interface PublishableFields extends TimestampFields {
    published: boolean;
    publishedAt?: Date;
    scheduledAt?: Date;
}

export interface OrderableFields {
    order: number;
}

export interface FeaturedFields {
    featured: boolean;
}

// ===== SERIALIZED TYPES (for client components) =====

export type Serialized<T> = {
    [K in keyof T]: T[K] extends Date 
        ? string 
        : T[K] extends Date | undefined 
            ? string | undefined 
            : T[K];
};

// ===== ACTIVITY LOGGING TYPES =====

export type ActivityAction = 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'login' | 'export' | 'reorder';
export type ActivityEntity = 'article' | 'note' | 'project' | 'topic' | 'subtopic' | 'comment' | 'subscriber' | 'media' | 'settings' | 'user' | 'message';

export interface ActivityLogOptions {
    entityId?: string;
    entityTitle?: string;
    details?: Record<string, unknown>;
}
