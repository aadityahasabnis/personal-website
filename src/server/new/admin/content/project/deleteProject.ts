'use server';

/**
 * Delete Project – Admin Server Action
 */

import type { IApiResponse } from '@/interfaces/actionHelper';
import {
    Comment,
    Content,
    ensureConnection,
    findProject,
    handleError,
    notFoundError,
    okVoid,
    PageStats,
    revalidateContentPaths,
} from '../../../utils';

// ============================================================
// Server Action
// ============================================================

export async function deleteProject(slug: string): Promise<IApiResponse<void>> {
    try {
        await ensureConnection();
        const project = await findProject(slug);
        if (!project) return notFoundError('Project');

        // Delete content document
        await Content.deleteOne({ type: 'project', slug });

        // Cleanup associated data in parallel
        await Promise.all([
            PageStats.deleteOne({ slug }),
            Comment.deleteMany({ contentSlug: slug }),
        ]);

        revalidateContentPaths('project', slug);

        return okVoid('Project deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete project');
    }
}
