'use server';

/**
 * Get Blog(s) – Admin Server Actions (queries)
 */

import type { IBlog } from '@/interfaces/schema';
import type { IApiResponse, IPaginatedResponse } from '@/interfaces/IApiResponse';
import {
    ensureConnection,
    Content,
    findBlog,
    notFoundError,
    ok,
    paginatedOk,
    handleError,
    normalizePagination,
    type PaginationParams,
} from '../../../utils';

// ============================================================
// Serialized Types
// ============================================================

/** Admin blog list item — excludes body for performance. */
export interface SerializedBlog {
    _id: string;
    slug: string;
    title: string;
    description: string;
    published: boolean;
    featured: boolean;
    publishedAt: string | null;
    scheduledAt: string | null;
    createdAt: string;
    updatedAt: string;
    readingTime: number;
    tags: string[];
}

/** Admin blog for editing — includes body + SEO. */
export interface SerializedBlogForEdit extends SerializedBlog {
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

// ============================================================
// Serializer
// ============================================================

function serializeBlog(b: IBlog): SerializedBlog {
    return {
        _id: b._id?.toString() ?? '',
        slug: b.slug,
        title: b.title,
        description: b.description,
        published: b.published,
        featured: b.featured,
        publishedAt: b.publishedAt?.toISOString?.() ?? (b.publishedAt as unknown as string) ?? null,
        scheduledAt: b.scheduledAt?.toISOString?.() ?? (b.scheduledAt as unknown as string) ?? null,
        createdAt: b.createdAt?.toISOString?.() ?? (b.createdAt as unknown as string),
        updatedAt: b.updatedAt?.toISOString?.() ?? (b.updatedAt as unknown as string),
        readingTime: b.readingTime,
        tags: b.tags ?? [],
    };
}

// ============================================================
// Queries
// ============================================================

export async function getBlogs(
    pagination?: PaginationParams,
): Promise<IPaginatedResponse<SerializedBlog>> {
    try {
        await ensureConnection();
        const { offset, limit } = normalizePagination(pagination);
        const filter = { type: 'blog' as const };

        const [docs, count] = await Promise.all([
            Content.find(filter)
                .sort({ updatedAt: -1 })
                .skip(offset)
                .limit(limit)
                .select('-body')
                .lean<IBlog[]>(),
            Content.countDocuments(filter),
        ]);

        return paginatedOk(
            docs.map(serializeBlog),
            count,
            offset,
            limit,
        );
    } catch (err) {
        return handleError(err, 'Failed to fetch blog posts') as unknown as IPaginatedResponse<SerializedBlog>;
    }
}

export async function getBlogForEdit(
    slug: string,
): Promise<IApiResponse<SerializedBlogForEdit | null>> {
    try {
        const blog = await findBlog(slug);
        if (!blog) return notFoundError('Blog post');

        const serialized: SerializedBlogForEdit = {
            ...serializeBlog(blog),
            body: blog.body,
            coverImage: blog.coverImage,
            seo: blog.seo ? {
                title: blog.seo.title,
                description: blog.seo.description,
                keywords: blog.seo.keywords,
                ogImage: blog.seo.ogImage,
                canonicalUrl: blog.seo.canonicalUrl,
                noIndex: blog.seo.noIndex,
            } : null,
        };

        return ok(serialized);
    } catch (err) {
        return handleError(err, 'Failed to fetch blog post for edit');
    }
}
