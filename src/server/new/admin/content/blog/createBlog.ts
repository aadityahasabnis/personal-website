'use server';

/**
 * Create Blog – Admin Server Action
 */

import type { IBlog } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import { calculateReadingTime } from '@/lib/utils';
import type { BlogCreateInput } from './types';
import type { Filter } from 'mongodb';
import {
    collections,
    duplicateError,
    created,
    handleError,
    revalidateContentPaths,
    buildSeoMetadata,
    timestamps,
} from '../../../utils';

// ============================================================
// Server Action
// ============================================================

export async function createBlog(
    input: BlogCreateInput,
): Promise<IApiResponse<string>> {
    try {
        const col = await collections.blogs();

        // Check uniqueness
        const existing = await col.findOne({
            type: 'blog',
            slug: input.slug,
        } as Filter<IBlog>);
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

        const result = await col.insertOne(blog as IBlog);
        revalidateContentPaths('blog', input.slug);

        return created(result.insertedId.toString(), 'Blog post created successfully');
    } catch (err) {
        return handleError(err, 'Failed to create blog post');
    }
}
