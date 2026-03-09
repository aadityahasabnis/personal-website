'use server';

/**
 * Update Article – Admin Server Action
 */

import type { IArticle } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import { calculateReadingTime } from '@/lib/utils';
import type { ArticleUpdateInput } from './types';
import type { Filter } from 'mongodb';
import {
    collections,
    findArticle,
    notFoundError,
    duplicateError,
    errorResponse,
    okVoid,
    handleError,
    verifyTopicExists,
    updateContentCounts,
    revalidateContentPaths,
    buildSeoMetadata,
    cleanUndefined,
    updatedNow,
} from '../../../utils';

// ============================================================
// Server Action
// ============================================================

export async function updateArticle(
    topicSlug: string,
    slug: string,
    input: ArticleUpdateInput,
): Promise<IApiResponse<void>> {
    try {
        const col = await collections.articles();

        // 1. Find existing
        const existing = await findArticle(topicSlug, slug);
        if (!existing) return notFoundError('Article');

        // 2. Check slug conflicts
        if (input.slug && input.slug !== slug) {
            const conflict = await col.findOne({
                type: 'article',
                topicSlug: input.topicSlug ?? topicSlug,
                slug: input.slug,
            } as Filter<IArticle>);
            if (conflict) return duplicateError('An article with this slug');
        }

        // 3. Verify new topic if changing
        if (input.topicSlug && input.topicSlug !== topicSlug) {
            if (!(await verifyTopicExists(input.topicSlug))) {
                return errorResponse('New topic not found');
            }
        }

        // 4. Build update
        const updateData: Partial<IArticle> = cleanUndefined({
            ...input,
            seo: input.seo ? buildSeoMetadata(input.seo) : undefined,
            coverImage: input.coverImage || undefined,
            ...updatedNow(),
            ...(input.body ? { readingTime: calculateReadingTime(input.body) } : {}),
        }) as Partial<IArticle>;

        // 5. Update
        await col.updateOne(
            { type: 'article', topicSlug, slug } as Filter<IArticle>,
            { $set: updateData },
        );

        // 6. Handle topic change — update denormalized counts
        if (existing.published && input.topicSlug && input.topicSlug !== topicSlug) {
            await updateContentCounts(topicSlug, existing.subtopicSlug, -1);
            await updateContentCounts(input.topicSlug, input.subtopicSlug ?? null, 1);
        }

        // 7. Revalidate
        revalidateContentPaths('article', slug, topicSlug);
        if (input.topicSlug && input.topicSlug !== topicSlug) {
            revalidateContentPaths('article', input.slug ?? slug, input.topicSlug);
        }

        return okVoid('Article updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update article');
    }
}
