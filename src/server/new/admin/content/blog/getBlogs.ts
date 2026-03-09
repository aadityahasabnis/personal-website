'use server';

/**
 * Get Blog(s) – Admin Server Actions (queries)
 */

import type { IBlog, Serialized, ISeoMetadata } from '@/interfaces/schema';
import type { IApiResponse, IPaginatedResponse } from '@/interfaces/IApiResponse';
import type { Filter } from 'mongodb';
import {
    collections,
    findBlog,
    notFoundError,
    ok,
    paginatedOk,
    handleError,
    serialize,
    normalizePagination,
    type PaginationParams,
} from '../../../utils';

// ============================================================
// Serialized Types
// ============================================================

/** Admin blog list item — excludes body for performance. */
export type SerializedBlog = Pick<
    Serialized<IBlog>,
    | '_id'
    | 'slug'
    | 'title'
    | 'description'
    | 'published'
    | 'featured'
    | 'publishedAt'
    | 'scheduledAt'
    | 'createdAt'
    | 'updatedAt'
    | 'readingTime'
    | 'tags'
>;

/** Admin blog for editing — includes body + SEO. */
export type SerializedBlogForEdit = SerializedBlog & Pick<
    Serialized<IBlog>,
    | 'body'
    | 'coverImage'
> & {
    seo: Serialized<ISeoMetadata> | null;
};

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
        const { offset, limit } = normalizePagination(pagination);
        const col = await collections.blogs();
        const filter: Filter<IBlog> = { type: 'blog' };

        const [docs, count] = await Promise.all([
            col
                .find(filter)
                .sort({ updatedAt: -1 })
                .skip(offset)
                .limit(limit)
                .project({ body: 0 })
                .toArray(),
            col.countDocuments(filter),
        ]);

        return paginatedOk(
            (docs as unknown as IBlog[]).map(serializeBlog),
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
            seo: blog.seo
                ? (serialize(blog.seo as Record<string, unknown>) as Serialized<ISeoMetadata>)
                : null,
        };

        return ok(serialized);
    } catch (err) {
        return handleError(err, 'Failed to fetch blog post for edit');
    }
}
