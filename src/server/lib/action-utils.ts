import { z, type ZodSchema } from 'zod';
import { revalidatePath } from 'next/cache';
import type { IApiResponse } from '@/interfaces/IApiResponse';

// ===== TYPES =====

export type ActionHandler<TInput, TOutput> = (data: TInput) => Promise<TOutput>;

export interface ActionConfig<TInput, TOutput> {
    schema?: ZodSchema<TInput>;
    handler: ActionHandler<TInput, TOutput>;
    revalidate?: string | string[];
    errorMessage?: string;
}

export interface ActionResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// ===== ACTION CREATOR =====

/**
 * Creates a type-safe server action with validation, error handling, and revalidation
 * 
 * @example
 * const createArticle = createAction({
 *   schema: articleSchema,
 *   handler: async (data) => { ... },
 *   revalidate: ['/articles', '/admin/articles'],
 * });
 */
export function createAction<TInput, TOutput>(
    config: ActionConfig<TInput, TOutput>
): (input: TInput) => Promise<IApiResponse<TOutput>> {
    return async (input: TInput): Promise<IApiResponse<TOutput>> => {
        try {
            // Validate input if schema provided
            let validatedData = input;
            if (config.schema) {
                const result = config.schema.safeParse(input);
                if (!result.success) {
                    return {
                        success: false,
                        status: 400,
                        error: result.error.issues[0]?.message ?? 'Invalid input',
                    };
                }
                validatedData = result.data;
            }

            // Execute handler
            const data = await config.handler(validatedData);

            // Revalidate paths
            if (config.revalidate) {
                const paths = Array.isArray(config.revalidate) ? config.revalidate : [config.revalidate];
                paths.forEach((path) => revalidatePath(path));
            }

            return { success: true, status: 200, data };
        } catch (error) {
            console.error(`Action error:`, error);
            return {
                success: false,
                status: 500,
                error: config.errorMessage ?? (error instanceof Error ? error.message : 'An unexpected error occurred'),
            };
        }
    };
}

/**
 * Creates a mutation action (create/update/delete) with standard patterns
 */
export function createMutationAction<TInput, TOutput>(
    config: ActionConfig<TInput, TOutput> & {
        successMessage?: string;
        type?: 'create' | 'update' | 'delete';
    }
): (input: TInput) => Promise<IApiResponse<TOutput>> {
    return createAction({
        ...config,
        handler: async (data) => {
            const result = await config.handler(data);
            return result;
        },
    });
}

// ===== VALIDATION HELPERS =====

export const commonSchemas = {
    slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
    email: z.string().email('Invalid email address'),
    id: z.string().min(1, 'ID is required'),
    pagination: z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
    }),
};

// ===== ERROR HELPERS =====

export const createErrorResponse = (message: string, status = 400): IApiResponse<never> => ({
    success: false,
    status,
    error: message,
});

export const createSuccessResponse = <T>(data: T, message?: string): IApiResponse<T> => ({
    success: true,
    status: 200,
    data,
    message,
});

export const notFoundError = (entity: string): IApiResponse<never> => createErrorResponse(`${entity} not found`, 404);
export const duplicateError = (entity: string): IApiResponse<never> => createErrorResponse(`${entity} already exists`, 409);
export const unauthorizedError = (): IApiResponse<never> => createErrorResponse('Unauthorized', 401);
export const forbiddenError = (): IApiResponse<never> => createErrorResponse('Forbidden', 403);

// ===== REVALIDATION HELPERS =====

export const revalidatePaths = (paths: string[]): void => {
    paths.forEach((path) => revalidatePath(path));
};

export const revalidateContentPaths = (type: 'article' | 'note' | 'project', slug?: string): void => {
    const basePaths = {
        article: ['/articles', '/admin/articles', '/sitemap.xml'],
        note: ['/notes', '/admin/notes', '/sitemap.xml'],
        project: ['/projects', '/admin/projects', '/sitemap.xml'],
    };
    
    revalidatePaths(basePaths[type]);
    if (slug) revalidatePath(`/${type}s/${slug}`);
};
