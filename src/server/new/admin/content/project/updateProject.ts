'use server';

/**
 * Update Project – Admin Server Action
 */

import type { IProject } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import type { ProjectUpdateInput } from './types';
import type { Filter } from 'mongodb';
import {
    collections,
    findProject,
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

export async function updateProject(
    slug: string,
    input: ProjectUpdateInput,
): Promise<IApiResponse<void>> {
    try {
        const col = await collections.projects();
        const existing = await findProject(slug);
        if (!existing) return notFoundError('Project');

        // Check slug conflicts
        if (input.slug && input.slug !== slug) {
            const conflict = await col.findOne({
                type: 'project',
                slug: input.slug,
            } as Filter<IProject>);
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

        await col.updateOne(
            { type: 'project', slug } as Filter<IProject>,
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
