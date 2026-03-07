'use server';

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IProject } from '@/interfaces';

// ===== SERIALIZED TYPES =====

export interface SerializedProject {
    _id: string;
    slug: string;
    title: string;
    description: string;
    longDescription?: string;
    coverImage?: string;
    tags: string[];
    techStack?: string[];
    githubUrl?: string;
    liveUrl?: string;
    featured: boolean;
    status: 'active' | 'archived' | 'wip';
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectForEdit extends SerializedProject {}

// ===== QUERIES =====

export const getProjects = async (): Promise<SerializedProject[]> => {
    try {
        const collection = await getCollection<IProject>(COLLECTIONS.projects);
        const projects = await collection.find({}).sort({ order: 1 }).toArray();

        return projects.map(p => ({
            _id: p._id!.toString(),
            slug: p.slug,
            title: p.title,
            description: p.description,
            longDescription: p.longDescription,
            coverImage: p.coverImage,
            tags: p.tags,
            techStack: p.techStack,
            githubUrl: p.githubUrl,
            liveUrl: p.liveUrl,
            featured: p.featured,
            status: p.status,
            order: p.order,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
        }));
    } catch (err) {
        console.error('Failed to fetch projects:', err);
        return [];
    }
};

export const getProjectForEdit = async (slug: string): Promise<ProjectForEdit | null> => {
    try {
        const collection = await getCollection<IProject>(COLLECTIONS.projects);
        const project = await collection.findOne({ slug });
        
        if (!project) return null;

        return {
            _id: project._id!.toString(),
            slug: project.slug,
            title: project.title,
            description: project.description,
            longDescription: project.longDescription,
            coverImage: project.coverImage,
            tags: project.tags,
            techStack: project.techStack,
            githubUrl: project.githubUrl,
            liveUrl: project.liveUrl,
            featured: project.featured,
            status: project.status,
            order: project.order,
            createdAt: project.createdAt.toISOString(),
            updatedAt: project.updatedAt.toISOString(),
        };
    } catch (err) {
        console.error('Failed to fetch project for edit:', err);
        return null;
    }
};

export const getFeaturedProjects = async (limit = 3): Promise<SerializedProject[]> => {
    try {
        const collection = await getCollection<IProject>(COLLECTIONS.projects);
        const projects = await collection
            .find({ featured: true, status: 'active' })
            .sort({ order: 1 })
            .limit(limit)
            .toArray();

        return projects.map(p => ({
            _id: p._id!.toString(),
            slug: p.slug,
            title: p.title,
            description: p.description,
            longDescription: p.longDescription,
            coverImage: p.coverImage,
            tags: p.tags,
            techStack: p.techStack,
            githubUrl: p.githubUrl,
            liveUrl: p.liveUrl,
            featured: p.featured,
            status: p.status,
            order: p.order,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
        }));
    } catch (err) {
        console.error('Failed to fetch featured projects:', err);
        return [];
    }
};
