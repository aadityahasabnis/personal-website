'use server';

/**
 * Create Blog – Admin Server Action
 */

import type { IApiResponse } from '@/interfaces/actionHelper';
import type { IBlog } from '@/interfaces/schema';
import { calculateReadingTime } from '@/lib/utils';
import {
    buildSeoMetadata,
    Content,
    created,
    duplicateError,
    ensureConnection,
    handleError,
    revalidateContentPaths,
    timestamps,
} from '../../../utils';
import type { BlogCreateInput } from './types';

// ============================================================
// Server Action
// ============================================================

export async function createBlog(
    input: BlogCreateInput,
): Promise<IApiResponse<string>> {
    try {
        await ensureConnection();

        // Check uniqueness
        const existing = await Content.findOne({
            type: 'blog',
            slug: input.slug,
        }).lean();
        if (existing) return duplicateError('A blog post with this slug');

        const now = timestamps();
        const blog: Omit<IBlog, '_id'> = {
            type: 'blog',
            slug: input.slug,
            title: input.title,
            description: input.description,
            body: input.body,
            tags: input.tags ?? [],
            coverImage: input.coverImage || null,
            readingTime: input.readingTime ?? calculateReadingTime(input.body),
            published: false,
            publishedAt: null,
            scheduledAt: null,
            featured: false,
            seo: buildSeoMetadata(input.seo ?? null),
            ...now,
        };

        const doc = await Content.create(blog);
        revalidateContentPaths('blog', input.slug);

        return created(doc._id.toString(), 'Blog post created successfully');
    } catch (err) {
        return handleError(err, 'Failed to create blog post');
    }
}
