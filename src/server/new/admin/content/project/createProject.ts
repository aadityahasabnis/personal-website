'use server';

/**
 * Create Project – Admin Server Action
 */

import type { IProject } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import type { ProjectCreateInput } from './types';
import {
    ensureConnection,
    Content,
    duplicateError,
    created,
    handleError,
    revalidateContentPaths,
    buildSeoMetadata,
    timestamps,
} from '../../../utils';

// ============================================================
// Server Action
// ============================================================

export async function createProject(
    input: ProjectCreateInput,
): Promise<IApiResponse<string>> {
    try {
        await ensureConnection();

        // Check uniqueness
        const existing = await Content.findOne({
            type: 'project',
            slug: input.slug,
        }).lean();
        if (existing) return duplicateError('A project with this slug');

        const now = timestamps();
        const project: Omit<IProject, '_id'> = {
            type: 'project',
            slug: input.slug,
            title: input.title,
            description: input.description,
            body: input.body,
            tags: input.tags ?? [],
            coverImage: input.coverImage || null,
            readingTime: 0,
            published: false,
            publishedAt: null,
            scheduledAt: null,
            featured: false,
            seo: buildSeoMetadata(input.seo ?? null),
            techStack: input.techStack,
            githubUrl: input.githubUrl || null,
            liveUrl: input.liveUrl || null,
            demoVideo: input.demoVideo || null,
            gallery: input.gallery ?? [],
            status: input.status ?? 'In Progress',
            startDate: input.startDate ?? null,
            completedDate: input.completedDate ?? null,
            order: input.order ?? 0,
            ...now,
        };

        const doc = await Content.create(project);
        revalidateContentPaths('project', input.slug);

        return created(doc._id.toString(), 'Project created successfully');
    } catch (err) {
        return handleError(err, 'Failed to create project');
    }
}
