'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { VALIDATION } from '@/constants';
import type { IProject, IApiResponse } from '@/interfaces';

// ===== VALIDATION SCHEMAS =====

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

const projectUpdateSchema = projectInputSchema.partial().extend({
    slug: z.string().min(VALIDATION.slug.min).max(VALIDATION.slug.max).regex(VALIDATION.slug.pattern).optional(),
});

type ProjectInput = z.infer<typeof projectInputSchema>;
type ProjectUpdate = z.infer<typeof projectUpdateSchema>;

// ===== HELPER FUNCTIONS =====

const revalidateProjectPaths = (slug?: string): void => {
    revalidatePath('/projects');
    revalidatePath('/admin/projects'); // Admin list page
    if (slug) {
        revalidatePath(`/projects/${slug}`);
        revalidatePath(`/admin/projects/${slug}/edit`);
    }
    revalidatePath('/'); // Homepage shows featured projects
};

// ===== SERVER ACTIONS =====

/**
 * Create a new project
 */
export const createProject = async (data: ProjectInput): Promise<IApiResponse<string>> => {
    try {
        const parsed = projectInputSchema.safeParse(data);
        if (!parsed.success) {
            return {
                success: false,
                status: 400,
                error: parsed.error.issues[0]?.message ?? 'Invalid input',
            };
        }

        const collection = await getCollection<IProject>('projects');

        // Check if slug already exists
        const existing = await collection.findOne({ slug: parsed.data.slug });
        if (existing) {
            return {
                success: false,
                status: 409,
                error: 'A project with this slug already exists',
            };
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

        return {
            success: true,
            status: 201,
            data: result.insertedId.toString(),
            message: 'Project created successfully',
        };
    } catch (error) {
        console.error('Failed to create project:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to create project. Please try again.',
        };
    }
};

/**
 * Update an existing project
 */
export const updateProject = async (
    slug: string,
    data: ProjectUpdate
): Promise<IApiResponse<void>> => {
    try {
        const parsed = projectUpdateSchema.safeParse(data);
        if (!parsed.success) {
            return {
                success: false,
                status: 400,
                error: parsed.error.issues[0]?.message ?? 'Invalid input',
            };
        }

        const collection = await getCollection<IProject>('projects');

        // Check if project exists
        const existing = await collection.findOne({ slug });
        if (!existing) {
            return {
                success: false,
                status: 404,
                error: 'Project not found',
            };
        }

        // If changing slug, check for conflicts
        if (parsed.data.slug && parsed.data.slug !== slug) {
            const slugConflict = await collection.findOne({ slug: parsed.data.slug });
            if (slugConflict) {
                return {
                    success: false,
                    status: 409,
                    error: 'A project with this slug already exists',
                };
            }
        }

        const updateData = {
            ...parsed.data,
            coverImage: parsed.data.coverImage || undefined,
            githubUrl: parsed.data.githubUrl || undefined,
            liveUrl: parsed.data.liveUrl || undefined,
            updatedAt: new Date(),
        };

        // Remove undefined values
        Object.keys(updateData).forEach(key => {
            if (updateData[key as keyof typeof updateData] === undefined) {
                delete updateData[key as keyof typeof updateData];
            }
        });

        await collection.updateOne({ slug }, { $set: updateData });

        revalidateProjectPaths(slug);
        if (parsed.data.slug && parsed.data.slug !== slug) {
            revalidateProjectPaths(parsed.data.slug);
        }

        return {
            success: true,
            status: 200,
            message: 'Project updated successfully',
        };
    } catch (error) {
        console.error('Failed to update project:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update project. Please try again.',
        };
    }
};

/**
 * Delete a project
 */
export const deleteProject = async (slug: string): Promise<IApiResponse<void>> => {
    try {
        const collection = await getCollection<IProject>('projects');

        // Check if project exists
        const project = await collection.findOne({ slug });
        if (!project) {
            return {
                success: false,
                status: 404,
                error: 'Project not found',
            };
        }

        await collection.deleteOne({ slug });

        // Also delete associated stats if they exist
        const statsCollection = await getCollection('pageStats');
        await statsCollection.deleteOne({ slug: `projects/${slug}` });

        revalidateProjectPaths(slug);

        return {
            success: true,
            status: 200,
            message: 'Project deleted successfully',
        };
    } catch (error) {
        console.error('Failed to delete project:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to delete project. Please try again.',
        };
    }
};

/**
 * Toggle project featured status
 */
export const toggleProjectFeatured = async (slug: string): Promise<IApiResponse<boolean>> => {
    try {
        const collection = await getCollection<IProject>('projects');

        const project = await collection.findOne({ slug });
        if (!project) {
            return {
                success: false,
                status: 404,
                error: 'Project not found',
            };
        }

        const newFeatured = !project.featured;
        await collection.updateOne(
            { slug },
            { $set: { featured: newFeatured, updatedAt: new Date() } }
        );

        revalidateProjectPaths(slug);

        return {
            success: true,
            status: 200,
            data: newFeatured,
            message: newFeatured ? 'Project featured' : 'Project unfeatured',
        };
    } catch (error) {
        console.error('Failed to toggle project featured:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update project. Please try again.',
        };
    }
};

/**
 * Update project status
 */
export const updateProjectStatus = async (
    slug: string,
    status: 'active' | 'wip' | 'archived'
): Promise<IApiResponse<void>> => {
    try {
        const collection = await getCollection<IProject>('projects');

        const project = await collection.findOne({ slug });
        if (!project) {
            return {
                success: false,
                status: 404,
                error: 'Project not found',
            };
        }

        await collection.updateOne(
            { slug },
            { $set: { status, updatedAt: new Date() } }
        );

        revalidateProjectPaths(slug);

        return {
            success: true,
            status: 200,
            message: `Project status updated to ${status}`,
        };
    } catch (error) {
        console.error('Failed to update project status:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to update project status. Please try again.',
        };
    }
};

/**
 * Reorder projects
 */
export const reorderProjects = async (slugs: string[]): Promise<IApiResponse<void>> => {
    try {
        if (!Array.isArray(slugs) || slugs.length === 0) {
            return {
                success: false,
                status: 400,
                error: 'Invalid slugs array',
            };
        }

        const collection = await getCollection<IProject>('projects');

        // Update order for each project
        const updatePromises = slugs.map((slug, index) =>
            collection.updateOne(
                { slug },
                { $set: { order: index, updatedAt: new Date() } }
            )
        );

        await Promise.all(updatePromises);

        revalidatePath('/projects');

        return {
            success: true,
            status: 200,
            message: 'Projects reordered successfully',
        };
    } catch (error) {
        console.error('Failed to reorder projects:', error);
        return {
            success: false,
            status: 500,
            error: 'Failed to reorder projects. Please try again.',
        };
    }
};
