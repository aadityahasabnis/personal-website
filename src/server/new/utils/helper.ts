/**
 * Server Action Helpers
 *
 * Centralized utilities for all new server actions.
 * Every server action in src/server/new/ must use these helpers.
 *
 * Categories:
 *  1. Response builders   – typed wrappers around IApiResponse / IPaginatedResponse
 *  2. Error helpers       – domain-specific error factories
 *  3. Database helpers    – Mongoose model wrappers, typed finders, connection guard
 *  4. Validation helpers  – ObjectId validation, cleanUndefined
 *  5. Pagination helpers  – offset/limit utilities
 *  6. Revalidation        – ISR path revalidation
 *  7. Serialization       – MongoDB → JSON-safe transforms
 *  8. Action wrappers     – tryCatch higher-order function
 */

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { connectMongoose } from '@/lib/db/mongoose';

// Mongoose models — used directly for all DB operations
import Content from '@/server/models/Content';
import Topic from '@/server/models/Topic';
import Subtopic from '@/server/models/Subtopic';
import PageStats from '@/server/models/PageStats';
import Comment from '@/server/models/Comment';

import type {
    IApiResponse,
    IPaginatedResponse,
} from '@/interfaces/IApiResponse';
import type {
    IArticle,
    IBlog,
    IProject,
    ISeoMetadata,
    IPageStats,
    ContentType,
} from '@/interfaces/schema';


// ============================================================
// 0. Connection Guard
// ============================================================

/**
 * Ensure Mongoose is connected before any model operation.
 * Safe to call multiple times — internally cached.
 */
export async function ensureConnection(): Promise<void> {
    await connectMongoose();
}


// ============================================================
// 1. Response Builders
// ============================================================

/**
 * Build a successful IApiResponse.
 */
export function ok<T>(data: T, message?: string): IApiResponse<T> {
    return { success: true, status: 200, data, message };
}

/**
 * Build a successful IApiResponse for a resource creation (201).
 */
export function created<T>(data: T, message = 'Created successfully'): IApiResponse<T> {
    return { success: true, status: 201, data, message };
}

/**
 * Build a successful void response.
 */
export function okVoid(message?: string): IApiResponse<void> {
    return { success: true, status: 200, message };
}

/**
 * Build a paginated success response.
 */
export function paginatedOk<T>(
    data: T[],
    count: number,
    offset: number,
    limit: number,
): IPaginatedResponse<T> {
    return {
        success: true,
        status: 200,
        data,
        metadata: {
            count,
            offset,
            limit,
            hasMore: offset + data.length < count,
        },
    };
}


// ============================================================
// 2. Error Helpers
// ============================================================

export function errorResponse(message: string, status = 400): IApiResponse<never> {
    return { success: false, status, error: message };
}

export function notFoundError(entity: string): IApiResponse<never> {
    return { success: false, status: 404, error: `${entity} not found` };
}

export function duplicateError(entity: string): IApiResponse<never> {
    return { success: false, status: 409, error: `${entity} already exists` };
}

export function unauthorizedError(): IApiResponse<never> {
    return { success: false, status: 401, error: 'Unauthorized' };
}

export function forbiddenError(): IApiResponse<never> {
    return { success: false, status: 403, error: 'Forbidden' };
}

export function serverError(message = 'An unexpected error occurred'): IApiResponse<never> {
    return { success: false, status: 500, error: message };
}

/**
 * Convert an unknown caught error into a typed error response.
 * Masks internal details in production.
 */
export function handleError(err: unknown, fallback?: string): IApiResponse<never> {
    console.error('[Server Action Error]:', err);

    if (err instanceof Error) {
        if (process.env.NODE_ENV === 'production') {
            return serverError(fallback ?? 'An unexpected error occurred');
        }
        return serverError(err.message);
    }

    return serverError(fallback ?? 'An unexpected error occurred');
}


// ============================================================
// 3. Database Helpers (Mongoose Models)
// ============================================================

// Re-export models for direct use in action files
export { Content, Topic, Subtopic, PageStats, Comment };

// ---- Typed Find Helpers (lean — plain JS objects, not Mongoose docs) ----

/**
 * Find a single article by topicSlug + slug.
 * Returns a lean (plain JS object) document for read performance.
 */
export async function findArticle(topicSlug: string, slug: string) {
    await ensureConnection();
    return Content.findOne({ type: 'article', topicSlug, slug }).lean<IArticle>();
}

export async function findPublishedArticle(topicSlug: string, slug: string) {
    await ensureConnection();
    return Content.findOne({
        type: 'article',
        topicSlug,
        slug,
        published: true,
    }).lean<IArticle>();
}

export async function findBlog(slug: string) {
    await ensureConnection();
    return Content.findOne({ type: 'blog', slug }).lean<IBlog>();
}

export async function findPublishedBlog(slug: string) {
    await ensureConnection();
    return Content.findOne({ type: 'blog', slug, published: true }).lean<IBlog>();
}

export async function findProject(slug: string) {
    await ensureConnection();
    return Content.findOne({ type: 'project', slug }).lean<IProject>();
}

export async function findPublishedProject(slug: string) {
    await ensureConnection();
    return Content.findOne({ type: 'project', slug, published: true }).lean<IProject>();
}

// ---- Mongoose Document Finders (for instance methods) ----

/**
 * Find an article as a Mongoose document (not lean).
 * Use when you need instance methods like publish(), unpublish(), schedule().
 */
export async function findArticleDoc(topicSlug: string, slug: string) {
    await ensureConnection();
    return Content.findOne({ type: 'article', topicSlug, slug });
}

export async function findBlogDoc(slug: string) {
    await ensureConnection();
    return Content.findOne({ type: 'blog', slug });
}

export async function findProjectDoc(slug: string) {
    await ensureConnection();
    return Content.findOne({ type: 'project', slug });
}

// ---- Reference Verification ----

export async function verifyTopicExists(topicSlug: string): Promise<boolean> {
    await ensureConnection();
    return !!(await Topic.exists({ slug: topicSlug }));
}

export async function verifySubtopicExists(
    topicSlug: string,
    subtopicSlug: string,
): Promise<boolean> {
    await ensureConnection();
    return !!(await Subtopic.exists({ topicSlug, slug: subtopicSlug }));
}

// ---- Denormalized Count Updaters ----

/**
 * Atomically update topic content count.
 */
export async function updateTopicContentCount(
    topicSlug: string,
    delta: number,
): Promise<void> {
    await ensureConnection();
    await Topic.updateOne(
        { slug: topicSlug },
        { $inc: { contentCount: delta } },
    );
}

export async function updateSubtopicContentCount(
    topicSlug: string,
    subtopicSlug: string,
    delta: number,
): Promise<void> {
    await ensureConnection();
    await Subtopic.updateOne(
        { topicSlug, slug: subtopicSlug },
        { $inc: { contentCount: delta } },
    );
}

/**
 * Update both topic + subtopic counts in parallel.
 */
export async function updateContentCounts(
    topicSlug: string,
    subtopicSlug: string | null | undefined,
    delta: number,
): Promise<void> {
    const promises: Promise<unknown>[] = [
        updateTopicContentCount(topicSlug, delta),
    ];
    if (subtopicSlug) {
        promises.push(updateSubtopicContentCount(topicSlug, subtopicSlug, delta));
    }
    await Promise.all(promises);
}

// ---- PageStats Helpers (use Mongoose static methods) ----

/**
 * Atomically increment views for a slug.
 * Uses the PageStats model's static method (upsert-safe).
 */
export async function incrementViews(slug: string): Promise<IPageStats | null> {
    await ensureConnection();
    return PageStats.incrementViews(slug);
}

/**
 * Atomically increment likes for a slug.
 */
export async function incrementLikes(slug: string): Promise<IPageStats | null> {
    await ensureConnection();
    return PageStats.incrementLikes(slug);
}

/**
 * Atomically decrement likes (floor at 0).
 */
export async function decrementLikes(slug: string): Promise<IPageStats | null> {
    await ensureConnection();
    return PageStats.decrementLikes(slug);
}

/**
 * Get page stats for a slug (returns zero-stats if not found).
 */
export async function getStats(slug: string): Promise<{ views: number; likes: number }> {
    await ensureConnection();
    const doc = await PageStats.findOne({ slug }).lean<IPageStats>();
    return { views: doc?.views ?? 0, likes: doc?.likes ?? 0 };
}


// ============================================================
// 4. Validation Helpers
// ============================================================

/**
 * Validate ObjectId string format.
 */
export function isValidObjectId(id: string): boolean {
    return ObjectId.isValid(id);
}

/**
 * Convert a string to ObjectId, or return null if invalid.
 */
export function toObjectId(id: string): ObjectId | null {
    return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

/**
 * Remove undefined values from an update object to prevent
 * MongoDB from setting fields to undefined.
 */
export function cleanUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const cleaned = { ...obj };
    for (const key of Object.keys(cleaned)) {
        if (cleaned[key] === undefined) {
            delete cleaned[key];
        }
    }
    return cleaned;
}


// ============================================================
// 5. Pagination Helpers
// ============================================================

export interface PaginationParams {
    offset?: number;
    limit?: number;
}

export interface SortParams {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Normalize pagination params to safe defaults.
 */
export function normalizePagination(params?: PaginationParams): {
    offset: number;
    limit: number;
} {
    const offset = Math.max(0, params?.offset ?? 0);
    const limit = Math.min(MAX_LIMIT, Math.max(1, params?.limit ?? DEFAULT_LIMIT));
    return { offset, limit };
}

/**
 * Build a Mongoose sort object from SortParams.
 */
export function buildSort(
    params?: SortParams,
    defaults: Record<string, 1 | -1> = { createdAt: -1 },
): Record<string, 1 | -1> {
    if (!params?.sortBy) return defaults;
    return { [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1 };
}


// ============================================================
// 6. Revalidation Helpers
// ============================================================

/**
 * Revalidate a list of paths for ISR.
 */
export function revalidatePaths(paths: string[]): void {
    for (const p of paths) {
        revalidatePath(p);
    }
}

/**
 * Revalidate content-related paths by type.
 */
export function revalidateContentPaths(
    type: ContentType,
    slug?: string,
    topicSlug?: string,
): void {
    const paths: string[] = ['/sitemap.xml', '/'];

    switch (type) {
        case 'article':
            paths.push('/articles', '/admin/articles');
            if (topicSlug) {
                paths.push(`/articles/${topicSlug}`);
                if (slug) {
                    paths.push(`/articles/${topicSlug}/${slug}`);
                    paths.push(`/admin/articles/${topicSlug}/${slug}/edit`);
                }
            }
            break;
        case 'blog':
            paths.push('/blogs', '/admin/blogs');
            if (slug) {
                paths.push(`/blogs/${slug}`);
                paths.push(`/admin/blogs/${slug}/edit`);
            }
            break;
        case 'project':
            paths.push('/projects', '/admin/projects');
            if (slug) {
                paths.push(`/projects/${slug}`);
                paths.push(`/admin/projects/${slug}/edit`);
            }
            break;
    }

    revalidatePaths(paths);
}


// ============================================================
// 7. Serialization Helpers
// ============================================================

/**
 * Serialize a MongoDB/Mongoose document for JSON transport to client components.
 * Converts ObjectId → string, Date → ISO string.
 */
export function serialize<T extends Record<string, unknown>>(doc: T): T {
    return JSON.parse(
        JSON.stringify(doc, (_key, value) => {
            if (value && typeof value === 'object' && value._bsontype === 'ObjectId') {
                return value.toString();
            }
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        }),
    );
}

/**
 * Serialize an array of documents.
 */
export function serializeMany<T extends Record<string, unknown>>(docs: T[]): T[] {
    return docs.map(serialize);
}

/**
 * Build a complete SEO metadata object with defaults.
 * Returns null fields where the user hasn't provided values,
 * so templates can fall back to computed defaults.
 */
export function buildSeoMetadata(
    seo: Partial<ISeoMetadata> | null | undefined,
): ISeoMetadata {
    return {
        title: seo?.title ?? null,
        description: seo?.description ?? null,
        keywords: seo?.keywords ?? [],
        ogImage: seo?.ogImage ?? null,
        canonicalUrl: seo?.canonicalUrl ?? null,
        noIndex: seo?.noIndex ?? false,
    };
}


// ============================================================
// 8. Action Wrappers (Higher-Order Functions)
// ============================================================

/**
 * Wrap an async server action handler in a try/catch with
 * standardized error handling. Reduces boilerplate in every action.
 *
 * @example
 * export const getArticle = tryCatch(async (slug: string) => {
 *     const article = await findPublishedArticle('topic', slug);
 *     if (!article) return notFoundError('Article');
 *     return ok(article);
 * }, 'Failed to fetch article');
 */
export function tryCatch<TArgs extends unknown[], TResult>(
    handler: (...args: TArgs) => Promise<IApiResponse<TResult>>,
    fallback?: string,
): (...args: TArgs) => Promise<IApiResponse<TResult>> {
    return async (...args: TArgs) => {
        try {
            return await handler(...args);
        } catch (err) {
            return handleError(err, fallback) as IApiResponse<TResult>;
        }
    };
}

/**
 * Build a timestamp pair for new document creation.
 */
export function timestamps(): { createdAt: Date; updatedAt: Date } {
    const now = new Date();
    return { createdAt: now, updatedAt: now };
}

/**
 * Build an updatedAt timestamp for updates.
 */
export function updatedNow(): { updatedAt: Date } {
    return { updatedAt: new Date() };
}
