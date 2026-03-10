'use server';

/**
 * Delete Article – Admin Server Action
 */

import type { IApiResponse } from '@/interfaces/IApiResponse';
import {
    ensureConnection,
    Content,
    PageStats,
    Comment,
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
        await ensureConnection();

        // 1. Find existing
        const article = await findArticle(topicSlug, slug);
        if (!article) return notFoundError('Article');

        // 2. Delete content document
        await Content.deleteOne({ type: 'article', topicSlug, slug });

        // 3. Update denormalized counts if the article was published
        if (article.published) {
            await updateContentCounts(topicSlug, article.subtopicSlug, -1);
        }

        // 4. Cleanup associated data (stats + comments) in parallel
        await Promise.all([
            PageStats.deleteOne({ slug: `${topicSlug}/${slug}` }),
            Comment.deleteMany({ contentSlug: `${topicSlug}/${slug}` }),
        ]);

        // 5. Revalidate
        revalidateContentPaths('article', slug, topicSlug);

        return okVoid('Article deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete article');
    }
}
