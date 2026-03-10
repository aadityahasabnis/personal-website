'use server';

/**
 * Get Article(s) – Admin Server Actions (queries)
 *
 * These are query-oriented actions for the admin panel.
 * They return serialized (JSON-safe) data for client components.
 */

import type { IApiResponse, IPaginatedResponse } from '@/interfaces/actionHelper';
import type { IArticle } from '@/interfaces/schema';
import {
    Content,
    Subtopic,
    ensureConnection,
    findArticle,
    handleError,
    normalizePagination,
    notFoundError,
    ok,
    paginatedOk,
    type PaginationParams,
} from '../../../utils';

// ============================================================
// Serialized Types (JSON-safe for client transport)
// ============================================================

/** Admin article list item — excludes body for performance. */
export interface SerializedArticle {
    _id: string;
    slug: string;
    title: string;
    description: string;
    topicSlug: string;
    subtopicSlug: string | null;
    published: boolean;
    featured: boolean;
    publishedAt: string | null;
    scheduledAt: string | null;
    createdAt: string;
    updatedAt: string;
    readingTime: number;
    tags: string[];
    order: number;
}

/** Admin article for editing — includes body + SEO. */
export interface SerializedArticleForEdit extends SerializedArticle {
    body: string;
    coverImage: string | null;
    seo: {
        title: string | null;
        description: string | null;
        keywords: string[];
        ogImage: string | null;
        canonicalUrl: string | null;
        noIndex: boolean;
    } | null;
}

export interface ArticleSidebarData {
    subtopics: Array<{ slug: string; title: string; order: number }>;
    articles: Array<{
        slug: string;
        title: string;
        subtopicSlug: string | null;
        order: number;
    }>;
}

// ============================================================
// Serializer
// ============================================================

function serializeArticle(a: IArticle): SerializedArticle {
    return {
        _id: a._id?.toString() ?? '',
        slug: a.slug,
        title: a.title,
        description: a.description,
        topicSlug: a.topicSlug,
        subtopicSlug: a.subtopicSlug,
        published: a.published,
        featured: a.featured,
        publishedAt: a.publishedAt?.toISOString?.() ?? (a.publishedAt as unknown as string) ?? null,
        scheduledAt: a.scheduledAt?.toISOString?.() ?? (a.scheduledAt as unknown as string) ?? null,
        createdAt: a.createdAt?.toISOString?.() ?? (a.createdAt as unknown as string),
        updatedAt: a.updatedAt?.toISOString?.() ?? (a.updatedAt as unknown as string),
        readingTime: a.readingTime,
        tags: a.tags ?? [],
        order: a.order,
    };
}

// ============================================================
// Queries
// ============================================================

/**
 * Get all articles for admin listing (no body for performance).
 */
export async function getArticles(
    pagination?: PaginationParams,
): Promise<IPaginatedResponse<SerializedArticle>> {
    try {
        await ensureConnection();
        const { offset, limit } = normalizePagination(pagination);
        const filter = { type: 'article' as const };

        const [docs, count] = await Promise.all([
            Content.find(filter)
                .sort({ updatedAt: -1 })
                .skip(offset)
                .limit(limit)
                .select('-body')
                .lean<IArticle[]>(),
            Content.countDocuments(filter),
        ]);

        return paginatedOk(
            docs.map(serializeArticle),
            count,
            offset,
            limit,
        );
    } catch (err) {
        return handleError(err, 'Failed to fetch articles') as unknown as IPaginatedResponse<SerializedArticle>;
    }
}

/**
 * Get articles filtered by topic slug.
 */
export async function getArticlesByTopic(
    topicSlug: string,
    pagination?: PaginationParams,
): Promise<IPaginatedResponse<SerializedArticle>> {
    try {
        await ensureConnection();
        const { offset, limit } = normalizePagination(pagination);
        const filter = { type: 'article' as const, topicSlug };

        const [docs, count] = await Promise.all([
            Content.find(filter)
                .sort({ order: 1 })
                .skip(offset)
                .limit(limit)
                .select('-body')
                .lean<IArticle[]>(),
            Content.countDocuments(filter),
        ]);

        return paginatedOk(
            docs.map(serializeArticle),
            count,
            offset,
            limit,
        );
    } catch (err) {
        return handleError(err, 'Failed to fetch articles by topic') as unknown as IPaginatedResponse<SerializedArticle>;
    }
}

/**
 * Get a single article with full body for editing.
 */
export async function getArticleForEdit(
    topicSlug: string,
    slug: string,
): Promise<IApiResponse<SerializedArticleForEdit | null>> {
    try {
        const article = await findArticle(topicSlug, slug);
        if (!article) return notFoundError('Article');

        const serialized: SerializedArticleForEdit = {
            ...serializeArticle(article),
            body: article.body,
            coverImage: article.coverImage,
            seo: article.seo ? {
                title: article.seo.title,
                description: article.seo.description,
                keywords: article.seo.keywords,
                ogImage: article.seo.ogImage,
                canonicalUrl: article.seo.canonicalUrl,
                noIndex: article.seo.noIndex,
            } : null,
        };

        return ok(serialized);
    } catch (err) {
        return handleError(err, 'Failed to fetch article for edit');
    }
}

/**
 * Get sidebar navigation data for a topic (subtopics + article slugs/titles).
 */
export async function getArticleSidebarData(
    topicSlug: string,
): Promise<IApiResponse<ArticleSidebarData>> {
    try {
        await ensureConnection();

        const [subtopics, articles] = await Promise.all([
            Subtopic.find({ topicSlug, published: true })
                .sort({ order: 1 })
                .select('slug title order -_id')
                .lean<Array<{ slug: string; title: string; order: number }>>(),
            Content.find({ type: 'article', topicSlug, published: true })
                .sort({ order: 1 })
                .select('slug title subtopicSlug order -_id')
                .lean<Array<{
                    slug: string;
                    title: string;
                    subtopicSlug: string | null;
                    order: number;
                }>>(),
        ]);

        return ok({ subtopics, articles });
    } catch (err) {
        return handleError(err, 'Failed to fetch article sidebar data');
    }
}
