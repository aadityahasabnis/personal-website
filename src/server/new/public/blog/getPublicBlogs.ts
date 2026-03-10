'use server';

/**
 * Public Blog Queries
 *
 * Published blog content for the public website.
 * Optimized for SSG/ISR with full SEO metadata.
 */

import type { IBlog } from '@/interfaces/schema';
import type { IApiResponse, IPaginatedResponse } from '@/interfaces/IApiResponse';
import {
    ensureConnection,
    Content,
    findPublishedBlog,
    notFoundError,
    ok,
    paginatedOk,
    handleError,
    normalizePagination,
    type PaginationParams,
} from '../../utils';
import type { PublicBlog, PublicBlogCard } from './types';

// ============================================================
// Serializers
// ============================================================

function serializeBlogFull(b: IBlog): PublicBlog {
    return {
        _id: b._id?.toString() ?? '',
        slug: b.slug,
        title: b.title,
        description: b.description,
        body: b.body,
        tags: b.tags ?? [],
        coverImage: b.coverImage,
        readingTime: b.readingTime,
        publishedAt: b.publishedAt?.toISOString?.() ?? (b.publishedAt as unknown as string) ?? '',
        updatedAt: b.updatedAt?.toISOString?.() ?? (b.updatedAt as unknown as string),
        featured: b.featured,
        seo: {
            title: b.seo?.title ?? null,
            description: b.seo?.description ?? null,
            keywords: b.seo?.keywords ?? [],
            ogImage: b.seo?.ogImage ?? null,
            canonicalUrl: b.seo?.canonicalUrl ?? null,
            noIndex: b.seo?.noIndex ?? false,
        },
    };
}

function serializeBlogCard(b: IBlog): PublicBlogCard {
    return {
        slug: b.slug,
        title: b.title,
        description: b.description,
        coverImage: b.coverImage,
        readingTime: b.readingTime,
        publishedAt: b.publishedAt?.toISOString?.() ?? (b.publishedAt as unknown as string) ?? '',
        tags: b.tags ?? [],
        featured: b.featured,
    };
}

// ============================================================
// Queries
// ============================================================

/**
 * Get a single published blog post by slug.
 * Used for the blog detail page (SSG/ISR).
 */
export async function getPublicBlog(
    slug: string,
): Promise<IApiResponse<PublicBlog>> {
    try {
        const blog = await findPublishedBlog(slug);
        if (!blog) return notFoundError('Blog post');

        return ok(serializeBlogFull(blog));
    } catch (err) {
        return handleError(err, 'Failed to fetch blog post');
    }
}

/**
 * Get all published blog posts (paginated, sorted by publishedAt desc).
 */
export async function getPublicBlogs(
    pagination?: PaginationParams,
): Promise<IPaginatedResponse<PublicBlogCard>> {
    try {
        await ensureConnection();
        const { offset, limit } = normalizePagination(pagination);
        const filter = { type: 'blog' as const, published: true };

        const [docs, count] = await Promise.all([
            Content.find(filter)
                .sort({ publishedAt: -1 })
                .skip(offset)
                .limit(limit)
                .select('-body')
                .lean<IBlog[]>(),
            Content.countDocuments(filter),
        ]);

        return paginatedOk(
            docs.map(serializeBlogCard),
            count,
            offset,
            limit,
        );
    } catch (err) {
        return handleError(err, 'Failed to fetch blog posts') as unknown as IPaginatedResponse<PublicBlogCard>;
    }
}

/**
 * Get featured published blog posts.
 */
export async function getPublicFeaturedBlogs(
    limit = 3,
): Promise<IApiResponse<PublicBlogCard[]>> {
    try {
        await ensureConnection();
        const docs = await Content.find({
            type: 'blog',
            published: true,
            featured: true,
        })
            .sort({ publishedAt: -1 })
            .limit(limit)
            .select('-body')
            .lean<IBlog[]>();

        return ok(docs.map(serializeBlogCard));
    } catch (err) {
        return handleError(err, 'Failed to fetch featured blog posts');
    }
}

/**
 * Get published blog posts filtered by tag.
 */
export async function getPublicBlogsByTag(
    tag: string,
    pagination?: PaginationParams,
): Promise<IPaginatedResponse<PublicBlogCard>> {
    try {
        await ensureConnection();
        const { offset, limit } = normalizePagination(pagination);
        const filter = { type: 'blog' as const, published: true, tags: tag };

        const [docs, count] = await Promise.all([
            Content.find(filter)
                .sort({ publishedAt: -1 })
                .skip(offset)
                .limit(limit)
                .select('-body')
                .lean<IBlog[]>(),
            Content.countDocuments(filter),
        ]);

        return paginatedOk(
            docs.map(serializeBlogCard),
            count,
            offset,
            limit,
        );
    } catch (err) {
        return handleError(err, 'Failed to fetch blog posts by tag') as unknown as IPaginatedResponse<PublicBlogCard>;
    }
}

/**
 * Get all published blog slugs for generateStaticParams.
 */
export async function getPublicBlogSlugs(): Promise<Array<{ slug: string }>> {
    try {
        await ensureConnection();
        const docs = await Content.find({ type: 'blog', published: true })
            .select('slug -_id')
            .lean<Array<{ slug: string }>>();

        return docs;
    } catch (err) {
        console.error('Failed to fetch blog slugs:', err);
        return [];
    }
}
