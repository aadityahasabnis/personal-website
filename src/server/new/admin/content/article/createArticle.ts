'use server';

/**
 * Create Article – Admin Server Action
 */

import type { IArticle } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import { calculateReadingTime } from '@/lib/utils';
import type { ArticleCreateInput } from './types';
import {
    collections,
    duplicateError,
    errorResponse,
    created,
    handleError,
    verifyTopicExists,
    verifySubtopicExists,
    revalidateContentPaths,
    buildSeoMetadata,
    timestamps,
} from '../../../utils';
import type { Filter } from 'mongodb';

// ============================================================
// Server Action
// ============================================================

export async function createArticle(
    input: ArticleCreateInput,
): Promise<IApiResponse<string>> {
    try {
        const col = await collections.articles();

        // 1. Check uniqueness (type + topicSlug + slug)
        const existing = await col.findOne({
            type: 'article',
            topicSlug: input.topicSlug,
            slug: input.slug,
        } as Filter<IArticle>);
        if (existing) {
            return duplicateError('An article with this slug already exists in this topic');
        }

        // 2. Verify references
        if (!(await verifyTopicExists(input.topicSlug))) {
            return errorResponse('Topic not found');
        }
        if (input.subtopicSlug && !(await verifySubtopicExists(input.topicSlug, input.subtopicSlug))) {
            return errorResponse('Subtopic not found');
        }

        // 3. Build document
        const now = timestamps();
        const article: Omit<IArticle, '_id'> = {
            type: 'article',
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
            topicSlug: input.topicSlug,
            subtopicSlug: input.subtopicSlug ?? null,
            order: input.order ?? 0,
            ...now,
        };

        // 4. Insert
        const result = await col.insertOne(article as IArticle);

        // 5. Revalidate
        revalidateContentPaths('article', input.slug, input.topicSlug);

        return created(result.insertedId.toString(), 'Article created successfully');
    } catch (err) {
        return handleError(err, 'Failed to create article');
    }
}
