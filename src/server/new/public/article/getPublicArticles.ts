'use server';

/**
 * Public Article Queries
 *
 * These return only published content for the public website.
 * Designed for SSG/ISR compatibility:
 *  - Static content (title, body, SEO) returned in the response
 *  - Dynamic data (views, likes) must be fetched separately via stats actions
 *
 * SEO fields are fully populated so Next.js metadata can be generated.
 */

import type { IArticle } from '@/interfaces/schema';
import type { IApiResponse, IPaginatedResponse } from '@/interfaces/IApiResponse';
import type { Filter } from 'mongodb';
import {
    collections,
    findPublishedArticle,
    notFoundError,
    ok,
    paginatedOk,
    handleError,
    normalizePagination,
    type PaginationParams,
} from '../../utils';
import type { PublicArticle, PublicArticleCard, PublicTopicWithArticles } from './types';

// ============================================================
// Serializers
// ============================================================

function serializeArticleFull(a: IArticle): PublicArticle {
    return {
        _id: a._id?.toString() ?? '',
        slug: a.slug,
        title: a.title,
        description: a.description,
        body: a.body,
        tags: a.tags ?? [],
        coverImage: a.coverImage,
        readingTime: a.readingTime,
        publishedAt: a.publishedAt?.toISOString?.() ?? (a.publishedAt as unknown as string) ?? '',
        updatedAt: a.updatedAt?.toISOString?.() ?? (a.updatedAt as unknown as string),
        featured: a.featured,
        topicSlug: a.topicSlug,
        subtopicSlug: a.subtopicSlug,
        order: a.order,
        seo: {
            title: a.seo?.title ?? null,
            description: a.seo?.description ?? null,
            keywords: a.seo?.keywords ?? [],
            ogImage: a.seo?.ogImage ?? null,
            canonicalUrl: a.seo?.canonicalUrl ?? null,
            noIndex: a.seo?.noIndex ?? false,
        },
    };
}

function serializeArticleCard(a: IArticle): PublicArticleCard {
    return {
        slug: a.slug,
        title: a.title,
        description: a.description,
        coverImage: a.coverImage,
        readingTime: a.readingTime,
        publishedAt: a.publishedAt?.toISOString?.() ?? (a.publishedAt as unknown as string) ?? '',
        tags: a.tags ?? [],
        topicSlug: a.topicSlug,
        subtopicSlug: a.subtopicSlug,
        featured: a.featured,
    };
}

// ============================================================
// Queries
// ============================================================

/**
 * Get a single published article by topic + slug.
 * Used for the article detail page (SSG/ISR).
 * Returns full body + SEO metadata.
 */
export async function getPublicArticle(
    topicSlug: string,
    slug: string,
): Promise<IApiResponse<PublicArticle>> {
    try {
        const article = await findPublishedArticle(topicSlug, slug);
        if (!article) return notFoundError('Article');

        return ok(serializeArticleFull(article));
    } catch (err) {
        return handleError(err, 'Failed to fetch article');
    }
}

/**
 * Get all published articles (paginated, sorted by publishedAt desc).
 * Used for the articles index page.
 */
export async function getPublicArticles(
    pagination?: PaginationParams,
): Promise<IPaginatedResponse<PublicArticleCard>> {
    try {
        const { offset, limit } = normalizePagination(pagination);
        const col = await collections.articles();
        const filter: Filter<IArticle> = { type: 'article', published: true };

        const [docs, count] = await Promise.all([
            col
                .find(filter)
                .sort({ publishedAt: -1 })
                .skip(offset)
                .limit(limit)
                .project({ body: 0 })
                .toArray(),
            col.countDocuments(filter),
        ]);

        return paginatedOk(
            (docs as unknown as IArticle[]).map(serializeArticleCard),
            count,
            offset,
            limit,
        );
    } catch (err) {
        return handleError(err, 'Failed to fetch articles') as unknown as IPaginatedResponse<PublicArticleCard>;
    }
}

/**
 * Get published articles for a specific topic (ordered by order field).
 * Used for the topic page.
 */
export async function getPublicArticlesByTopic(
    topicSlug: string,
    pagination?: PaginationParams,
): Promise<IPaginatedResponse<PublicArticleCard>> {
    try {
        const { offset, limit } = normalizePagination(pagination);
        const col = await collections.articles();
        const filter: Filter<IArticle> = {
            type: 'article',
            topicSlug,
            published: true,
        };

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
            (docs as unknown as IArticle[]).map(serializeArticleCard),
            count,
            offset,
            limit,
        );
    } catch (err) {
        return handleError(err, 'Failed to fetch articles by topic') as unknown as IPaginatedResponse<PublicArticleCard>;
    }
}

/**
 * Get featured published articles.
 * Used for the homepage or featured section.
 */
export async function getPublicFeaturedArticles(
    limit = 6,
): Promise<IApiResponse<PublicArticleCard[]>> {
    try {
        const col = await collections.articles();
        const docs = await col
            .find({ type: 'article', published: true, featured: true } as Filter<IArticle>)
            .sort({ publishedAt: -1 })
            .limit(limit)
            .project({ body: 0 })
            .toArray();

        return ok((docs as unknown as IArticle[]).map(serializeArticleCard));
    } catch (err) {
        return handleError(err, 'Failed to fetch featured articles');
    }
}

/**
 * Get topic with articles structured for sidebar navigation.
 * Returns subtopics and their articles + uncategorized articles.
 */
export async function getPublicTopicWithArticles(
    topicSlug: string,
): Promise<IApiResponse<PublicTopicWithArticles | null>> {
    try {
        const [topicsCol, subtopicsCol, articlesCol] = await Promise.all([
            collections.topics(),
            collections.subtopics(),
            collections.articles(),
        ]);

        const topic = await topicsCol.findOne({ slug: topicSlug, published: true });
        if (!topic) return notFoundError('Topic');

        const [subtopics, articles] = await Promise.all([
            subtopicsCol
                .find({ topicSlug, published: true })
                .sort({ order: 1 })
                .toArray(),
            articlesCol
                .find({ type: 'article', topicSlug, published: true } as Filter<IArticle>)
                .sort({ order: 1 })
                .project({ body: 0 })
                .toArray(),
        ]);

        const articleCards = (articles as unknown as IArticle[]).map(serializeArticleCard);

        const subtopicData = subtopics.map((st) => ({
            slug: st.slug,
            title: st.title,
            articles: articleCards.filter((a) => a.subtopicSlug === st.slug),
        }));

        const uncategorizedArticles = articleCards.filter(
            (a) => !a.subtopicSlug,
        );

        return ok({
            slug: topic.slug,
            title: topic.title,
            description: topic.description,
            coverImage: topic.coverImage,
            subtopics: subtopicData,
            uncategorizedArticles,
        });
    } catch (err) {
        return handleError(err, 'Failed to fetch topic with articles');
    }
}

/**
 * Get all published article slugs for generateStaticParams.
 * Returns topicSlug + slug pairs for SSG.
 */
export async function getPublicArticleSlugs(): Promise<
    Array<{ topicSlug: string; slug: string }>
> {
    try {
        const col = await collections.articles();
        const docs = await col
            .find({ type: 'article', published: true } as Filter<IArticle>)
            .project({ topicSlug: 1, slug: 1, _id: 0 })
            .toArray();

        return docs as Array<{ topicSlug: string; slug: string }>;
    } catch (err) {
        console.error('Failed to fetch article slugs:', err);
        return [];
    }
}

/**
 * Get all published topic slugs for generateStaticParams.
 */
export async function getPublicTopicSlugs(): Promise<Array<{ slug: string }>> {
    try {
        const col = await collections.topics();
        const docs = await col
            .find({ published: true })
            .project({ slug: 1, _id: 0 })
            .toArray();

        return docs as Array<{ slug: string }>;
    } catch (err) {
        console.error('Failed to fetch topic slugs:', err);
        return [];
    }
}
