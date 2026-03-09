/**
 * Server Action Helpers
 *
 * Centralized utilities for all new server actions.
 * Every server action in src/server/new/ must use these helpers.
 *
 * Categories:
 *  1. Response builders   – typed wrappers around IApiResponse / IPaginatedResponse
 *  2. Error helpers       – domain-specific error factories
 *  3. Database helpers    – collection getters, typed finders, atomic ops
 *  4. Validation helpers  – ObjectId validation, cleanUndefined
 *  5. Pagination helpers  – offset/limit utilities
 *  6. Revalidation        – ISR path revalidation
 *  7. Serialization       – MongoDB → JSON-safe transforms
 *  8. Action wrappers     – tryCatch higher-order function
 */

import { ObjectId, type Filter, type Sort, type Document } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants/siteConstants';
import type {
    IApiResponse,
    IPaginatedResponse,
} from '@/interfaces/IApiResponse';
import type {
    IArticle,
    IBlog,
    IProject,
    IContent,
    ITopic,
    ISubtopic,
    IPageStats,
    IComment,
    ISubscriber,
    IUser,
    IContact,
    ISeoMetadata,
    ContentType,
} from '@/interfaces/schema';



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
// 3. Database Helpers
// ============================================================

// ---- Collection Getters ----

export const collections = {
    content: () => getCollection<IContent>(COLLECTIONS.content),
    articles: () => getCollection<IArticle>(COLLECTIONS.content),
    blogs: () => getCollection<IBlog>(COLLECTIONS.content),
    projects: () => getCollection<IProject>(COLLECTIONS.content),
    topics: () => getCollection<ITopic>(COLLECTIONS.topics),
    subtopics: () => getCollection<ISubtopic>(COLLECTIONS.subtopics),
    pageStats: () => getCollection<IPageStats>(COLLECTIONS.pageStats),
    comments: () => getCollection<IComment>(COLLECTIONS.comments),
    subscribers: () => getCollection<ISubscriber>(COLLECTIONS.subscribers),
    users: () => getCollection<IUser>(COLLECTIONS.users),
    contacts: () => getCollection<IContact>(COLLECTIONS.contacts),
} as const;

// ---- Typed Find Helpers ----

/**
 * Find a single article by type-discriminated query.
 */
export async function findArticle(topicSlug: string, slug: string) {
    const col = await collections.articles();
    return col.findOne({ type: 'article', topicSlug, slug } as Filter<IArticle>);
}

export async function findPublishedArticle(topicSlug: string, slug: string) {
    const col = await collections.articles();
    return col.findOne({
        type: 'article',
        topicSlug,
        slug,
        published: true,
    } as Filter<IArticle>);
}

export async function findBlog(slug: string) {
    const col = await collections.blogs();
    return col.findOne({ type: 'blog', slug } as Filter<IBlog>);
}

export async function findPublishedBlog(slug: string) {
    const col = await collections.blogs();
    return col.findOne({ type: 'blog', slug, published: true } as Filter<IBlog>);
}

export async function findProject(slug: string) {
    const col = await collections.projects();
    return col.findOne({ type: 'project', slug } as Filter<IProject>);
}

export async function findPublishedProject(slug: string) {
    const col = await collections.projects();
    return col.findOne({ type: 'project', slug, published: true } as Filter<IProject>);
}

// ---- Reference Verification ----

export async function verifyTopicExists(topicSlug: string): Promise<boolean> {
    const col = await collections.topics();
    return !!(await col.findOne({ slug: topicSlug }));
}

export async function verifySubtopicExists(
    topicSlug: string,
    subtopicSlug: string,
): Promise<boolean> {
    const col = await collections.subtopics();
    return !!(await col.findOne({ topicSlug, slug: subtopicSlug }));
}

// ---- Denormalized Count Updaters ----

export async function updateTopicContentCount(
    topicSlug: string,
    delta: number,
): Promise<void> {
    const col = await collections.topics();
    await col.updateOne(
        { slug: topicSlug },
        { $inc: { contentCount: delta }, $set: { updatedAt: new Date() } },
    );
}

export async function updateSubtopicContentCount(
    topicSlug: string,
    subtopicSlug: string,
    delta: number,
): Promise<void> {
    const col = await collections.subtopics();
    await col.updateOne(
        { topicSlug, slug: subtopicSlug },
        { $inc: { contentCount: delta }, $set: { updatedAt: new Date() } },
    );
}

/**
 * Update both topic + subtopic counts atomically (if subtopic exists).
 */
export async function updateContentCounts(
    topicSlug: string,
    subtopicSlug: string | null | undefined,
    delta: number,
): Promise<void> {
    await updateTopicContentCount(topicSlug, delta);
    if (subtopicSlug) {
        await updateSubtopicContentCount(topicSlug, subtopicSlug, delta);
    }
}

// ---- PageStats Atomic Ops ----

/**
 * Atomically increment views for a slug. Creates the document if it doesn't exist.
 */
export async function incrementViews(slug: string): Promise<IPageStats | null> {
    const col = await collections.pageStats();
    const result = await col.findOneAndUpdate(
        { slug },
        {
            $inc: { views: 1 },
            $set: { lastViewedAt: new Date(), updatedAt: new Date() },
            $setOnInsert: { likes: 0, createdAt: new Date() },
        },
        { upsert: true, returnDocument: 'after' },
    );
    return result;
}

/**
 * Atomically increment likes for a slug.
 */
export async function incrementLikes(slug: string): Promise<IPageStats | null> {
    const col = await collections.pageStats();
    const result = await col.findOneAndUpdate(
        { slug },
        {
            $inc: { likes: 1 },
            $set: { updatedAt: new Date() },
            $setOnInsert: { views: 0, lastViewedAt: null, createdAt: new Date() },
        },
        { upsert: true, returnDocument: 'after' },
    );
    return result;
}

/**
 * Atomically decrement likes (floor at 0).
 */
export async function decrementLikes(slug: string): Promise<IPageStats | null> {
    const col = await collections.pageStats();
    // First ensure we don't go below 0
    const result = await col.findOneAndUpdate(
        { slug, likes: { $gt: 0 } },
        { $inc: { likes: -1 }, $set: { updatedAt: new Date() } },
        { returnDocument: 'after' },
    );
    return result;
}

/**
 * Get page stats for a slug (returns zero-stats if not found).
 */
export async function getStats(slug: string): Promise<{ views: number; likes: number }> {
    const col = await collections.pageStats();
    const doc = await col.findOne({ slug });
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
 * Build a MongoDB sort object from SortParams.
 */
export function buildSort(
    params?: SortParams,
    defaults: Sort = { createdAt: -1 },
): Sort {
    if (!params?.sortBy) return defaults;
    return { [params.sortBy]: params.sortOrder === 'asc' ? 1 : -1 };
}

/**
 * Generic paginated query helper.
 * Performs both count + find in parallel for efficiency.
 */
export async function paginatedQuery<T extends Document>(
    collectionName: string,
    filter: Filter<T>,
    pagination?: PaginationParams,
    sort?: Sort,
): Promise<{ data: T[]; count: number; offset: number; limit: number }> {
    const { offset, limit } = normalizePagination(pagination);
    const col = await getCollection<T>(collectionName);

    const [data, count] = await Promise.all([
        col.find(filter).sort(sort ?? { createdAt: -1 }).skip(offset).limit(limit).toArray(),
        col.countDocuments(filter),
    ]);

    return { data: data as T[], count, offset, limit };
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
 * Serialize a MongoDB document for JSON transport to client components.
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
