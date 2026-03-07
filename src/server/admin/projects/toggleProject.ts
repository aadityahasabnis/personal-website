'use server';

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IProject } from '@/interfaces';
import type { ActionResponse } from '../utils';
import { success, notFound, error, handleError, logUpdate, logReorder } from '../utils';

// ===== RESPONSE TYPES =====

export interface ToggleProjectResponse extends ActionResponse<boolean> {}
export interface UpdateStatusResponse extends ActionResponse<void> {}
export interface ReorderProjectsResponse extends ActionResponse<void> {}

// ===== HELPERS =====

const getProjectsCollection = () => getCollection<IProject>(COLLECTIONS.projects);
const findProject = async (slug: string) => (await getProjectsCollection()).findOne({ slug });

const revalidateProjectPaths = (slug?: string): void => {
    ['/projects', '/admin/projects', '/'].forEach(p => revalidatePath(p));
    if (slug) revalidatePath(`/projects/${slug}`);
};

// ===== SERVER ACTIONS =====

export const toggleProjectFeatured = async (slug: string): Promise<ToggleProjectResponse> => {
    try {
        const collection = await getProjectsCollection();
        const project = await findProject(slug);
        if (!project) return notFound('Project');

        const newFeatured = !project.featured;
        await collection.updateOne({ slug }, { $set: { featured: newFeatured, updatedAt: new Date() } });
        revalidateProjectPaths(slug);
        
        await logUpdate('project', project.title, project._id?.toString(), { featured: newFeatured });

        return success(newFeatured, newFeatured ? 'Project featured' : 'Project unfeatured');
    } catch (err) {
        return handleError(err, 'Failed to update project');
    }
};

export const updateProjectStatus = async (slug: string, status: 'active' | 'wip' | 'archived'): Promise<UpdateStatusResponse> => {
    try {
        const collection = await getProjectsCollection();
        const project = await findProject(slug);
        if (!project) return notFound('Project');

        await collection.updateOne({ slug }, { $set: { status, updatedAt: new Date() } });
        revalidateProjectPaths(slug);
        
        await logUpdate('project', project.title, project._id?.toString(), { status });

        return success(undefined, `Project status updated to ${status}`);
    } catch (err) {
        return handleError(err, 'Failed to update project status');
    }
};

export const reorderProjects = async (slugs: string[]): Promise<ReorderProjectsResponse> => {
    try {
        if (!Array.isArray(slugs) || slugs.length === 0) return error('Invalid slugs array');

        const collection = await getProjectsCollection();
        await Promise.all(slugs.map((slug, index) => 
            collection.updateOne({ slug }, { $set: { order: index, updatedAt: new Date() } })
        ));

        revalidatePath('/projects');
        
        await logReorder('project', { count: slugs.length });
        
        return success(undefined, 'Projects reordered successfully');
    } catch (err) {
        return handleError(err, 'Failed to reorder projects');
    }
};
