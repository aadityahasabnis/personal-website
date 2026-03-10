'use server';

/**
 * Publish / Toggle / Reorder Project – Admin Server Actions
 *
 * Uses Mongoose document finders + instance methods for publish/unpublish.
 * Uses Content model directly for toggle/status/reorder operations.
 */

import type { ProjectStatus } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import {
    ensureConnection,
    Content,
    findProject,
    findProjectDoc,
    notFoundError,
    errorResponse,
    okVoid,
    ok,
    handleError,
    revalidateContentPaths,
    revalidatePaths,
} from '../../../utils';

// ============================================================
// Publish / Unpublish
// ============================================================

export async function publishProject(slug: string): Promise<IApiResponse<void>> {
    try {
        const project = await findProject(slug);
        if (!project) return notFoundError('Project');

        if (project.published) return okVoid('Project is already published');

        const doc = await findProjectDoc(slug);
        if (!doc) return notFoundError('Project');
        await doc.publish();

        revalidateContentPaths('project', slug);

        return okVoid('Project published successfully');
    } catch (err) {
        return handleError(err, 'Failed to publish project');
    }
}

export async function unpublishProject(slug: string): Promise<IApiResponse<void>> {
    try {
        const project = await findProject(slug);
        if (!project) return notFoundError('Project');

        if (!project.published) return okVoid('Project is already unpublished');

        const doc = await findProjectDoc(slug);
        if (!doc) return notFoundError('Project');
        await doc.unpublish();

        revalidateContentPaths('project', slug);

        return okVoid('Project unpublished successfully');
    } catch (err) {
        return handleError(err, 'Failed to unpublish project');
    }
}

// ============================================================
// Toggle Featured
// ============================================================

export async function toggleProjectFeatured(
    slug: string,
): Promise<IApiResponse<boolean>> {
    try {
        await ensureConnection();
        const project = await findProject(slug);
        if (!project) return notFoundError('Project');

        const newFeatured = !project.featured;
        await Content.updateOne(
            { type: 'project', slug },
            { $set: { featured: newFeatured, updatedAt: new Date() } },
        );

        revalidateContentPaths('project', slug);

        return ok(newFeatured, newFeatured ? 'Project featured' : 'Project unfeatured');
    } catch (err) {
        return handleError(err, 'Failed to toggle project featured status');
    }
}

// ============================================================
// Update Status
// ============================================================

export async function updateProjectStatus(
    slug: string,
    status: ProjectStatus,
): Promise<IApiResponse<void>> {
    try {
        await ensureConnection();
        const project = await findProject(slug);
        if (!project) return notFoundError('Project');

        await Content.updateOne(
            { type: 'project', slug },
            { $set: { status, updatedAt: new Date() } },
        );

        revalidateContentPaths('project', slug);

        return okVoid(`Project status updated to ${status}`);
    } catch (err) {
        return handleError(err, 'Failed to update project status');
    }
}

// ============================================================
// Reorder
// ============================================================

export async function reorderProjects(
    slugs: string[],
): Promise<IApiResponse<void>> {
    try {
        if (!slugs.length) return errorResponse('No slugs provided');

        await ensureConnection();

        const ops = slugs.map((s, index) => ({
            updateOne: {
                filter: { type: 'project' as const, slug: s },
                update: { $set: { order: index, updatedAt: new Date() } },
            },
        }));

        await Content.bulkWrite(ops);

        revalidatePaths(['/projects', '/admin/projects', '/']);

        return okVoid('Projects reordered successfully');
    } catch (err) {
        return handleError(err, 'Failed to reorder projects');
    }
}
