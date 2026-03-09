'use server';

/**
 * Delete Blog – Admin Server Action
 */

import type { IBlog } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import type { Filter } from 'mongodb';
import {
    collections,
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
        const col = await collections.blogs();
        const blog = await findBlog(slug);
        if (!blog) return notFoundError('Blog post');

        // Delete content document
        await col.deleteOne({ type: 'blog', slug } as Filter<IBlog>);

        // Cleanup associated data
        const [statsCol, commentsCol] = await Promise.all([
            collections.pageStats(),
            collections.comments(),
        ]);
        await Promise.all([
            statsCol.deleteOne({ slug }),
            commentsCol.deleteMany({ contentSlug: slug }),
        ]);

        revalidateContentPaths('blog', slug);

        return okVoid('Blog post deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete blog post');
    }
}
