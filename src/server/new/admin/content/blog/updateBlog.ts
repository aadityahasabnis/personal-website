'use server';

/**
 * Update Blog – Admin Server Action
 */

import type { IBlog } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import { calculateReadingTime } from '@/lib/utils';
import type { BlogUpdateInput } from './types';
import type { Filter } from 'mongodb';
import {
    collections,
    findBlog,
    notFoundError,
    duplicateError,
    okVoid,
    handleError,
    revalidateContentPaths,
    buildSeoMetadata,
    cleanUndefined,
    updatedNow,
} from '../../../utils';

// ============================================================
// Server Action
// ============================================================

export async function updateBlog(
    slug: string,
    input: BlogUpdateInput,
): Promise<IApiResponse<void>> {
    try {
        const col = await collections.blogs();
        const existing = await findBlog(slug);
        if (!existing) return notFoundError('Blog post');

        // Check slug conflicts
        if (input.slug && input.slug !== slug) {
            const conflict = await col.findOne({
                type: 'blog',
                slug: input.slug,
            } as Filter<IBlog>);
            if (conflict) return duplicateError('A blog post with this slug');
        }

        const updateData: Partial<IBlog> = cleanUndefined({
            ...input,
            seo: input.seo ? buildSeoMetadata(input.seo) : undefined,
            coverImage: input.coverImage || undefined,
            ...updatedNow(),
            ...(input.body ? { readingTime: calculateReadingTime(input.body) } : {}),
        }) as Partial<IBlog>;

        await col.updateOne(
            { type: 'blog', slug } as Filter<IBlog>,
            { $set: updateData },
        );

        revalidateContentPaths('blog', slug);
        if (input.slug && input.slug !== slug) {
            revalidateContentPaths('blog', input.slug);
        }

        return okVoid('Blog post updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update blog post');
    }
}
