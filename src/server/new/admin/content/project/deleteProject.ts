'use server';

/**
 * Delete Project – Admin Server Action
 */

import type { IProject } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import type { Filter } from 'mongodb';
import {
    collections,
    findProject,
    notFoundError,
    okVoid,
    handleError,
    revalidateContentPaths,
} from '../../../utils';

// ============================================================
// Server Action
// ============================================================

export async function deleteProject(slug: string): Promise<IApiResponse<void>> {
    try {
        const col = await collections.projects();
        const project = await findProject(slug);
        if (!project) return notFoundError('Project');

        // Delete content document
        await col.deleteOne({ type: 'project', slug } as Filter<IProject>);

        // Cleanup associated data
        const [statsCol, commentsCol] = await Promise.all([
            collections.pageStats(),
            collections.comments(),
        ]);
        await Promise.all([
            statsCol.deleteOne({ slug }),
            commentsCol.deleteMany({ contentSlug: slug }),
        ]);

        revalidateContentPaths('project', slug);

        return okVoid('Project deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete project');
    }
}
