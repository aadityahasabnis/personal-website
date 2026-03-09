'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS, VALIDATION } from '@/constants';
import type { IProject } from '@/interfaces/schema';
import type { ActionResponse } from '../utils';
import { success, duplicate, error, handleError, logCreate } from '../utils';

// ===== REQUEST/RESPONSE TYPES =====

export interface CreateProjectRequest {
    title: string;
    slug: string;
    description: string;
    longDescription: string;
    coverImage?: string;
    tags?: string[];
    techStack: string[];
    githubUrl?: string;
    liveUrl?: string;
    status?: 'active' | 'wip' | 'archived';
    featured?: boolean;
    order?: number;
}

export interface CreateProjectResponse extends ActionResponse<string> {}

// ===== SCHEMA =====

const schema = z.object({
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

// ===== HELPERS =====

const getProjectsCollection = () => getCollection<IProject>(COLLECTIONS.projects);

const revalidateProjectPaths = (slug?: string): void => {
    ['/projects', '/admin/projects', '/'].forEach(p => revalidatePath(p));
    if (slug) {
        revalidatePath(`/projects/${slug}`);
        revalidatePath(`/admin/projects/${slug}/edit`);
    }
};

// ===== SERVER ACTION =====

export const createProject = async (data: CreateProjectRequest): Promise<CreateProjectResponse> => {
    try {
        const parsed = schema.safeParse(data);
        if (!parsed.success) return error(parsed.error.issues[0]?.message ?? 'Invalid input');

        const collection = await getProjectsCollection();
        if (await collection.findOne({ slug: parsed.data.slug })) {
            return duplicate('A project with this slug');
        }

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
        
        await logCreate('project', parsed.data.title, result.insertedId.toString());

        return success(result.insertedId.toString(), 'Project created successfully');
    } catch (err) {
        return handleError(err, 'Failed to create project');
    }
};
