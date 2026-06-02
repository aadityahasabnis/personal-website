// =================================================
// Server Action Utilities
// Minimal helpers for server actions only
// General utilities are in lib/utils.ts
// =================================================

import { CONTENT_TYPES, type ContentType } from '@/constants/schemaConstants';
import { SITE_CONFIG } from '@/constants/siteConstants';
import type { IApiResponse, IPaginatedResponse, IPaginationParams, ISortParams } from '@/interfaces/actionHelper';
import { revalidatePath } from 'next/cache';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// =================================================
// Response Builders
// =================================================

export const success = <T>(data: T, message?: string): IApiResponse<T> => ({
    success: true,
    status: 200,
    data,
    ...(message && { message }),
});

export const created = <T>(data: T, message?: string): IApiResponse<T> => ({
    success: true,
    status: 201,
    data,
    ...(message && { message }),
});

export const error = ( message: string, status: 400 | 401 | 403 | 404 | 409 | 429 | 500 = 400 ): IApiResponse<never> => ({
    success: false,
    status,
    error: message,
});

export const paginated = <T>( data: T[], total: number, offset: number, limit: number ): IPaginatedResponse<T> => ({
    success: true,
    status: 200,
    data,
    pagination: {
        total,
        offset,
        limit,
        hasMore: offset + data.length < total,
    },
});

// =================================================
// Error Handler
// =================================================

export const handleError = (err: unknown, fallback = 'An unexpected error occurred'): IApiResponse<never> => {
    console.error('[Server Action Error]:', err);
    
    const message = process.env.NODE_ENV === 'production'
        ? fallback
        : err instanceof Error
            ? err.message
            : fallback;
    
    return error(message, 500);
};

// =================================================
// Pagination
// =================================================

export const normalizePagination = (params?: IPaginationParams) => {
    const offset = Math.max(0, params?.offset ?? 0);
    const limit = Math.min(MAX_LIMIT, Math.max(1, params?.limit ?? DEFAULT_LIMIT));
    return { offset, limit };
};

export const buildSort = ( params?: ISortParams, defaults: Record<string, 1 | -1> = { createdAt: -1 }): Record<string, 1 | -1> => {
    if (!params?.sortBy) return defaults;
    return { [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1 };
};

// =================================================
// Revalidation
// =================================================

export const revalidateContent = ( type: ContentType, slug?: string, topicSlug?: string): void => {
    const paths: string[] = ['/sitemap.xml', '/'];
    if (SITE_CONFIG.seo.search.enabled) {
        paths.push(SITE_CONFIG.seo.search.path);
    }

    switch (type) {
        case CONTENT_TYPES.ARTICLE:
            paths.push('/articles', '/admin/articles');
            if (topicSlug) {
                paths.push(`/articles/${topicSlug}`);
                if (slug) {
                    paths.push(`/articles/${topicSlug}/${slug}`);
                    paths.push(`/admin/articles/${topicSlug}/${slug}/edit`);
                }
            }
            break;
        case CONTENT_TYPES.BLOG:
            paths.push('/blogs', '/admin/blogs');
            if (slug) {
                paths.push(`/blogs/${slug}`);
                paths.push(`/admin/blogs/${slug}/edit`);
            }
            break;
        case CONTENT_TYPES.PROJECT:
            paths.push('/projects', '/admin/projects');
            if (slug) {
                paths.push(`/projects/${slug}`);
                paths.push(`/admin/projects/${slug}/edit`);
            }
            break;
    }

    paths.forEach((path) => revalidatePath(path));
};

// =================================================
// Action Wrapper
// =================================================

export const tryCatch = <TArgs extends unknown[], TResult>(
    handler: (...args: TArgs) => Promise<IApiResponse<TResult>>,
    fallback?: string,
) => async (...args: TArgs): Promise<IApiResponse<TResult>> => {
    try {
        return await handler(...args);
    } catch (err) {
        return handleError(err, fallback) as IApiResponse<TResult>;
    }
};

// =================================================
// Database Utilities
// =================================================

export const cleanUndefined = <T extends object>(obj: T): { [K in keyof T]: T[K] } => {
    const cleaned = { ...obj };
    for (const key in cleaned) {
        if (cleaned[key] === undefined) {
            delete cleaned[key];
        }
    }
    return cleaned;
};

export const timestamps = () => {
    const now = new Date();
    return { createdAt: now, updatedAt: now };
};

export const updatedNow = () => ({ updatedAt: new Date() });
