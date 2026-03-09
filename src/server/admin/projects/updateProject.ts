'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { IProject } from '@/interfaces/schema';
import type { ActionResponse } from '../utils';
import { success, notFound, duplicate, error, handleError, logUpdate } from '../utils';

// ===== REQUEST/RESPONSE TYPES =====

export interface UpdateProjectRequest {
    title?: string;
    slug?: string;
    description?: string;
    longDescription?: string;
    coverImage?: string;
    tags?: string[];
    techStack?: string[];
    githubUrl?: string;
    liveUrl?: string;
    status?: 'active' | 'wip' | 'archived';
    featured?: boolean;
    order?: number;
}

export interface UpdateProjectResponse extends ActionResponse<void> {}

// ===== SCHEMA =====

const schema = z.object({
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max).optional(),
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern).optional(),
    description: z.string().max(VALIDATION.description.max).optional(),
    longDescription: z.string().min(50).optional(),
    coverImage: z.string().url().optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
    techStack: z.array(z.string()).optional(),
    githubUrl: z.string().url().optional().or(z.literal('')),
    liveUrl: z.string().url().optional().or(z.literal('')),
    status: z.enum(['active', 'wip', 'archived']).optional(),
    featured: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
});

// ===== HELPERS =====

const getProjectsCollection = () => getCollection<IProject>(COLLECTIONS.projects);
const findProject = async (slug: string) => (await getProjectsCollection()).findOne({ slug });

const revalidateProjectPaths = (slug?: string): void => {
    ['/projects', '/admin/projects', '/'].forEach(p => revalidatePath(p));
    if (slug) {
        revalidatePath(`/projects/${slug}`);
        revalidatePath(`/admin/projects/${slug}/edit`);
    }
};

// ===== SERVER ACTION =====

export const updateProject = async (slug: string, data: UpdateProjectRequest): Promise<UpdateProjectResponse> => {
    try {
        const parsed = schema.safeParse(data);
        if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getProjectsCollection();
        const existing = await findProject(slug);
        if (!existing) return notFound('Project');

        if (parsed.data.slug && parsed.data.slug !== slug) {
            if (await collection.findOne({ slug: parsed.data.slug })) {
                return duplicate('A project with this slug');
            }
        }

        const updateData = {
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            githubUrl: parsed.data.githubUrl || undefined,
            liveUrl: parsed.data.liveUrl || undefined,
            updatedAt: new Date(),
        };
        Object.keys(updateData).forEach(k => 
            updateData[k as keyof typeof updateData] === undefined && delete updateData[k as keyof typeof updateData]
        );

        await collection.updateOne({ slug }, { $set: updateData });
        revalidateProjectPaths(slug);
        if (parsed.data.slug && parsed.data.slug !== slug) revalidateProjectPaths(parsed.data.slug);
        
        await logUpdate('project', existing.title, existing._id?.toString());

        return success(undefined, 'Project updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update project');
    }
};
