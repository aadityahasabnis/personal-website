'use server';

/**
 * Update Project – Admin Server Action
 */

import type { IApiResponse } from '@/interfaces/actionHelper';
import type { IProject } from '@/interfaces/schema';
import {
    buildSeoMetadata,
    cleanUndefined,
    Content,
    duplicateError,
    ensureConnection,
    findProject,
    handleError,
    notFoundError,
    okVoid,
    revalidateContentPaths,
    updatedNow,
} from '../../../utils';
import type { ProjectUpdateInput } from './types';

// ============================================================
// Server Action
// ============================================================

export async function updateProject(
    slug: string,
    input: ProjectUpdateInput,
): Promise<IApiResponse<void>> {
    try {
        await ensureConnection();
        const existing = await findProject(slug);
        if (!existing) return notFoundError('Project');

        // Check slug conflicts
        if (input.slug && input.slug !== slug) {
            const conflict = await Content.findOne({
                type: 'project',
                slug: input.slug,
            }).lean();
            if (conflict) return duplicateError('A project with this slug');
        }

        const updateData: Partial<IProject> = cleanUndefined({
            ...input,
            seo: input.seo ? buildSeoMetadata(input.seo) : undefined,
            coverImage: input.coverImage || undefined,
            githubUrl: input.githubUrl || undefined,
            liveUrl: input.liveUrl || undefined,
            demoVideo: input.demoVideo || undefined,
            ...updatedNow(),
        }) as Partial<IProject>;

        await Content.updateOne(
            { type: 'project', slug },
            { $set: updateData },
        );

        revalidateContentPaths('project', slug);
        if (input.slug && input.slug !== slug) {
            revalidateContentPaths('project', input.slug);
        }

        return okVoid('Project updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update project');
    }
}
