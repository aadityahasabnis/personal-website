'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants/siteConstants';
import type { IProject } from '@/interfaces/schema';
import type { IApiResponse } from '@/interfaces/IApiResponse';
import { createErrorResponse, createSuccessResponse, notFoundError, duplicateError } from '@/server/lib/action-utils';

// ===== SCHEMAS =====

const projectInputSchema = z.object({
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max),
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only'),
    description: z.string().max(VALIDATION.description.max),
    longDescription: z.string().min(50, 'Long description must be at least 50 characters'),
    coverImage: z.string().url().optional().or(z.literal('')),
    tags: z.array(z.string()).default([]),
    techStack: z.array(z.string()).min(1, 'At least one technology is required'),
    githubUrl: z.string().url().optional().or(z.literal('')),
    liveUrl: z.string().url().optional().or(z.literal('')),
    status: z.enum(['active', 'wip', 'archived']).default('active'),
    featured: z.boolean().default(false),
    order: z.number().int().min(0).default(0),
});

const projectUpdateSchema = projectInputSchema.partial();

type ProjectInput = z.infer<typeof projectInputSchema>;
type ProjectUpdate = z.infer<typeof projectUpdateSchema>;

// ===== HELPERS =====

const getProjectsCollection = () => getCollection<IProject>(COLLECTIONS.projects);

const revalidateProjectPaths = (slug?: string): void => {
    ['/projects', '/admin/projects', '/'].forEach(p => revalidatePath(p));
    if (slug) {
        revalidatePath(`/projects/${slug}`);
        revalidatePath(`/admin/projects/${slug}/edit`);
    }
};

const findProject = async (slug: string) => (await getProjectsCollection()).findOne({ slug });

// ===== SERVER ACTIONS =====

export const createProject = async (data: ProjectInput): Promise<IApiResponse<string>> => {
    try {
        const parsed = projectInputSchema.safeParse(data);
        if (!parsed.success) return createErrorResponse(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getProjectsCollection();
        if (await collection.findOne({ slug: parsed.data.slug })) return duplicateError('A project with this slug');

        const now = new Date();
        const project: Omit<IProject, '_id'> = {
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            githubUrl: parsed.data.githubUrl || undefined,
            liveUrl: parsed.data.liveUrl || undefined,
            createdAt: now,
            updatedAt: now,
        };

        const result = await collection.insertOne(project as IProject);
        revalidateProjectPaths(parsed.data.slug);

        return { success: true, status: 201, data: result.insertedId.toString(), message: 'Project created successfully' };
    } catch (error) {
        console.error('Failed to create project:', error);
        return createErrorResponse('Failed to create project. Please try again.', 500);
    }
};

export const updateProject = async (slug: string, data: ProjectUpdate): Promise<IApiResponse<void>> => {
    try {
        const parsed = projectUpdateSchema.safeParse(data);
        if (!parsed.success) return createErrorResponse(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getProjectsCollection();
        if (!(await findProject(slug))) return notFoundError('Project');

        if (parsed.data.slug && parsed.data.slug !== slug) {
            if (await collection.findOne({ slug: parsed.data.slug })) return duplicateError('A project with this slug');
        }

        const updateData = {
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            githubUrl: parsed.data.githubUrl || undefined,
            liveUrl: parsed.data.liveUrl || undefined,
            updatedAt: new Date(),
        };
        Object.keys(updateData).forEach(k => updateData[k as keyof typeof updateData] === undefined && delete updateData[k as keyof typeof updateData]);

        await collection.updateOne({ slug }, { $set: updateData });
        revalidateProjectPaths(slug);
        if (parsed.data.slug && parsed.data.slug !== slug) revalidateProjectPaths(parsed.data.slug);

        return createSuccessResponse(undefined, 'Project updated successfully');
    } catch (error) {
        console.error('Failed to update project:', error);
        return createErrorResponse('Failed to update project. Please try again.', 500);
    }
};

export const deleteProject = async (slug: string): Promise<IApiResponse<void>> => {
    try {
        const collection = await getProjectsCollection();
        if (!(await findProject(slug))) return notFoundError('Project');

        await collection.deleteOne({ slug });
        await (await getCollection(COLLECTIONS.articleStats)).deleteOne({ slug: `projects/${slug}` });
        revalidateProjectPaths(slug);

        return createSuccessResponse(undefined, 'Project deleted successfully');
    } catch (error) {
        console.error('Failed to delete project:', error);
        return createErrorResponse('Failed to delete project. Please try again.', 500);
    }
};

export const toggleProjectFeatured = async (slug: string): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getProjectsCollection();
        const project = await findProject(slug);
        if (!project) return notFoundError('Project');

        const newFeatured = !project.featured;
        await collection.updateOne({ slug }, { $set: { featured: newFeatured, updatedAt: new Date() } });
        revalidateProjectPaths(slug);

        return createSuccessResponse(newFeatured, newFeatured ? 'Project featured' : 'Project unfeatured');
    } catch (error) {
        console.error('Failed to toggle project featured:', error);
        return createErrorResponse('Failed to update project. Please try again.', 500);
    }
};

export const updateProjectStatus = async (slug: string, status: 'active' | 'wip' | 'archived'): Promise<IApiResponse<void>> => {
    try {
        const collection = await getProjectsCollection();
        if (!(await findProject(slug))) return notFoundError('Project');

        await collection.updateOne({ slug }, { $set: { status, updatedAt: new Date() } });
        revalidateProjectPaths(slug);

        return createSuccessResponse(undefined, `Project status updated to ${status}`);
    } catch (error) {
        console.error('Failed to update project status:', error);
        return createErrorResponse('Failed to update project status. Please try again.', 500);
    }
};

export const reorderProjects = async (slugs: string[]): Promise<IApiResponse<void>> => {
    try {
        if (!Array.isArray(slugs) || slugs.length === 0) return createErrorResponse('Invalid slugs array');

        const collection = await getProjectsCollection();
        await Promise.all(slugs.map((slug, index) => 
            collection.updateOne({ slug }, { $set: { order: index, updatedAt: new Date() } })
        ));

        revalidatePath('/projects');
        return createSuccessResponse(undefined, 'Projects reordered successfully');
    } catch (error) {
        console.error('Failed to reorder projects:', error);
        return createErrorResponse('Failed to reorder projects. Please try again.', 500);
    }
};
