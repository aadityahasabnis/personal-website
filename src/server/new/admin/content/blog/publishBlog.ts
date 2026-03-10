'use server';

/**
 * Publish / Unpublish / Toggle Blog – Admin Server Actions
 *
 * Uses Mongoose document finders + instance methods for publish/unpublish/schedule.
 * Uses Content model directly for toggle/featured operations.
 */

import type { IApiResponse } from '@/interfaces/IApiResponse';
import {
    ensureConnection,
    Content,
    findBlog,
    findBlogDoc,
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
        const blog = await findBlog(slug);
        if (!blog) return notFoundError('Blog post');

        if (blog.published) return okVoid('Blog post is already published');

        const doc = await findBlogDoc(slug);
        if (!doc) return notFoundError('Blog post');
        await doc.publish();

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
        const blog = await findBlog(slug);
        if (!blog) return notFoundError('Blog post');

        if (!blog.published) return okVoid('Blog post is already unpublished');

        const doc = await findBlogDoc(slug);
        if (!doc) return notFoundError('Blog post');
        await doc.unpublish();

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
        await ensureConnection();
        const blog = await findBlog(slug);
        if (!blog) return notFoundError('Blog post');

        const newFeatured = !blog.featured;
        await Content.updateOne(
            { type: 'blog', slug },
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
        const doc = await findBlogDoc(slug);
        if (!doc) return notFoundError('Blog post');

        await doc.schedule(scheduledAt);

        revalidateContentPaths('blog', slug);

        return okVoid('Blog post scheduled successfully');
    } catch (err) {
        return handleError(err, 'Failed to schedule blog post');
    }
}
