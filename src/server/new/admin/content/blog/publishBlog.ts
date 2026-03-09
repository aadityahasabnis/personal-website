'use server';

/**
 * Publish / Unpublish / Toggle Blog – Admin Server Actions
 */

import type { IBlog } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import type { Filter } from 'mongodb';
import {
    collections,
    findBlog,
    notFoundError,
    okVoid,
    ok,
    handleError,
    revalidateContentPaths,
} from '../../../utils';

// ============================================================
// Publish
// ============================================================

export async function publishBlog(slug: string): Promise<IApiResponse<void>> {
    try {
        const col = await collections.blogs();
        const blog = await findBlog(slug);
        if (!blog) return notFoundError('Blog post');

        if (blog.published) return okVoid('Blog post is already published');

        const now = new Date();
        await col.updateOne(
            { type: 'blog', slug } as Filter<IBlog>,
            {
                $set: {
                    published: true,
                    publishedAt: blog.publishedAt ?? now,
                    updatedAt: now,
                },
            },
        );

        revalidateContentPaths('blog', slug);

        return okVoid('Blog post published successfully');
    } catch (err) {
        return handleError(err, 'Failed to publish blog post');
    }
}

// ============================================================
// Unpublish
// ============================================================

export async function unpublishBlog(slug: string): Promise<IApiResponse<void>> {
    try {
        const col = await collections.blogs();
        const blog = await findBlog(slug);
        if (!blog) return notFoundError('Blog post');

        if (!blog.published) return okVoid('Blog post is already unpublished');

        await col.updateOne(
            { type: 'blog', slug } as Filter<IBlog>,
            { $set: { published: false, updatedAt: new Date() } },
        );

        revalidateContentPaths('blog', slug);

        return okVoid('Blog post unpublished successfully');
    } catch (err) {
        return handleError(err, 'Failed to unpublish blog post');
    }
}

// ============================================================
// Toggle Published
// ============================================================

export async function toggleBlogPublished(
    slug: string,
): Promise<IApiResponse<boolean>> {
    try {
        const blog = await findBlog(slug);
        if (!blog) return notFoundError('Blog post');

        if (blog.published) {
            await unpublishBlog(slug);
            return ok(false, 'Blog post unpublished');
        } else {
            await publishBlog(slug);
            return ok(true, 'Blog post published');
        }
    } catch (err) {
        return handleError(err, 'Failed to toggle blog published status');
    }
}

// ============================================================
// Toggle Featured
// ============================================================

export async function toggleBlogFeatured(
    slug: string,
): Promise<IApiResponse<boolean>> {
    try {
        const col = await collections.blogs();
        const blog = await findBlog(slug);
        if (!blog) return notFoundError('Blog post');

        const newFeatured = !blog.featured;
        await col.updateOne(
            { type: 'blog', slug } as Filter<IBlog>,
            { $set: { featured: newFeatured, updatedAt: new Date() } },
        );

        revalidateContentPaths('blog', slug);

        return ok(newFeatured, newFeatured ? 'Blog featured' : 'Blog unfeatured');
    } catch (err) {
        return handleError(err, 'Failed to toggle blog featured status');
    }
}

// ============================================================
// Schedule
// ============================================================

export async function scheduleBlog(
    slug: string,
    scheduledAt: Date,
): Promise<IApiResponse<void>> {
    try {
        const col = await collections.blogs();
        const blog = await findBlog(slug);
        if (!blog) return notFoundError('Blog post');

        await col.updateOne(
            { type: 'blog', slug } as Filter<IBlog>,
            { $set: { scheduledAt, updatedAt: new Date() } },
        );

        revalidateContentPaths('blog', slug);

        return okVoid('Blog post scheduled successfully');
    } catch (err) {
        return handleError(err, 'Failed to schedule blog post');
    }
}
