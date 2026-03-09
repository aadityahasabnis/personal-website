'use server';

/**
 * Get Article(s) – Admin Server Actions (queries)
 *
 * These are query-oriented actions for the admin panel.
 * They return serialized (JSON-safe) data for client components.
 */

import type { IArticle, Serialized, ISeoMetadata } from '@/interfaces/schema';
import type { IApiResponse, IPaginatedResponse } from '@/interfaces/IApiResponse';
import type { Filter } from 'mongodb';
import {
    collections,
    findArticle,
    notFoundError,
    ok,
    paginatedOk,
    handleError,
    serialize,
    normalizePagination,
    type PaginationParams,
} from '../../../utils';

// ============================================================
// Serialized Types (JSON-safe for client transport)
// ============================================================

/** Admin article list item — excludes body for performance. */
export type SerializedArticle = Pick<
    Serialized<IArticle>,
    | '_id'
    | 'slug'
    | 'title'
    | 'description'
    | 'topicSlug'
    | 'subtopicSlug'
    | 'published'
    | 'featured'
    | 'publishedAt'
    | 'scheduledAt'
    | 'createdAt'
    | 'updatedAt'
    | 'readingTime'
    | 'tags'
    | 'order'
>;

/** Admin article for editing — includes body + SEO. */
export type SerializedArticleForEdit = SerializedArticle & Pick<
    Serialized<IArticle>,
    | 'body'
    | 'coverImage'
> & {
    seo: Serialized<ISeoMetadata> | null;
};

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
        const { offset, limit } = normalizePagination(pagination);
        const col = await collections.articles();
        const filter: Filter<IArticle> = { type: 'article' };

        const [docs, count] = await Promise.all([
            col
                .find(filter)
                .sort({ updatedAt: -1 })
                .skip(offset)
                .limit(limit)
                .project({
                    body: 0, // Exclude body for list performance
                })
                .toArray(),
            col.countDocuments(filter),
        ]);

        return paginatedOk(
            (docs as unknown as IArticle[]).map(serializeArticle),
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
        const { offset, limit } = normalizePagination(pagination);
        const col = await collections.articles();
        const filter: Filter<IArticle> = { type: 'article', topicSlug };

        const [docs, count] = await Promise.all([
            col
                .find(filter)
                .sort({ order: 1 })
                .skip(offset)
                .limit(limit)
                .project({ body: 0 })
                .toArray(),
            col.countDocuments(filter),
        ]);

        return paginatedOk(
            (docs as unknown as IArticle[]).map(serializeArticle),
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
            seo: article.seo ? serialize(article.seo as Record<string, unknown>) as Serialized<ISeoMetadata> : null,
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
        const [subtopicsCol, contentCol] = await Promise.all([
            collections.subtopics(),
            collections.articles(),
        ]);

        const [subtopics, articles] = await Promise.all([
            subtopicsCol
                .find({ topicSlug, published: true })
                .sort({ order: 1 })
                .project({ slug: 1, title: 1, order: 1, _id: 0 })
                .toArray(),
            contentCol
                .find({ type: 'article', topicSlug, published: true } as Filter<IArticle>)
                .sort({ order: 1 })
                .project({ slug: 1, title: 1, subtopicSlug: 1, order: 1, _id: 0 })
                .toArray(),
        ]);

        return ok({
            subtopics: subtopics as Array<{ slug: string; title: string; order: number }>,
            articles: articles as Array<{
                slug: string;
                title: string;
                subtopicSlug: string | null;
                order: number;
            }>,
        });
    } catch (err) {
        return handleError(err, 'Failed to fetch article sidebar data');
    }
}
