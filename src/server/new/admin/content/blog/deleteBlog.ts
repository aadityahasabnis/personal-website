'use server';

/**
 * Delete Blog – Admin Server Action
 */

import type { IApiResponse } from '@/interfaces/IApiResponse';
import {
    ensureConnection,
    Content,
    PageStats,
    Comment,
    findBlog,
    notFoundError,
    okVoid,
    handleError,
    revalidateContentPaths,
} from '../../../utils';

// ============================================================
// Server Action
// ============================================================

export async function deleteBlog(slug: string): Promise<IApiResponse<void>> {
    try {
        await ensureConnection();
        const blog = await findBlog(slug);
        if (!blog) return notFoundError('Blog post');

        // Delete content document
        await Content.deleteOne({ type: 'blog', slug });

        // Cleanup associated data in parallel
        await Promise.all([
            PageStats.deleteOne({ slug }),
            Comment.deleteMany({ contentSlug: slug }),
        ]);

        revalidateContentPaths('blog', slug);

        return okVoid('Blog post deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete blog post');
    }
}
