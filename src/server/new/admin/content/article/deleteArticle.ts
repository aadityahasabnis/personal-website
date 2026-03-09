'use server';

/**
 * Delete Article – Admin Server Action
 */

import { COLLECTIONS } from '@/constants/siteConstants';
import { getCollection } from '@/lib/db/connect';
import type { IArticle } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import type { Filter } from 'mongodb';
import {
    collections,
    findArticle,
    notFoundError,
    okVoid,
    handleError,
    updateContentCounts,
    revalidateContentPaths,
} from '../../../utils';

// ============================================================
// Server Action
// ============================================================

export async function deleteArticle(
    topicSlug: string,
    slug: string,
): Promise<IApiResponse<void>> {
    try {
        const col = await collections.articles();

        // 1. Find existing
        const article = await findArticle(topicSlug, slug);
        if (!article) return notFoundError('Article');

        // 2. Delete content document
        await col.deleteOne({
            type: 'article',
            topicSlug,
            slug,
        } as Filter<IArticle>);

        // 3. Update denormalized counts if the article was published
        if (article.published) {
            await updateContentCounts(topicSlug, article.subtopicSlug, -1);
        }

        // 4. Cleanup associated data (stats + comments)
        const [statsCol, commentsCol] = await Promise.all([
            collections.pageStats(),
            collections.comments(),
        ]);
        await Promise.all([
            statsCol.deleteOne({ slug: `${topicSlug}/${slug}` }),
            commentsCol.deleteMany({ contentSlug: `${topicSlug}/${slug}` }),
        ]);

        // 5. Revalidate
        revalidateContentPaths('article', slug, topicSlug);

        return okVoid('Article deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete article');
    }
}
