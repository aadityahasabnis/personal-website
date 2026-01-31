import { getCollection } from '@/lib/db/connect';
import type { IProject } from '@/interfaces';

const COLLECTION_NAME = 'projects';

/**
 * Get all projects, sorted by order
 */
export const getProjects = async (): Promise<IProject[]> => {
    try {
        const collection = await getCollection<IProject>(COLLECTION_NAME);

        const projects = await collection
            .find({})
            .sort({ order: 1, createdAt: -1 })
            .toArray();

        return projects;
    } catch (error) {
        console.error('Failed to fetch projects', error);
        return [];
    }
};

/**
 * Get featured projects
 */
export const getFeaturedProjects = async (limit = 4): Promise<IProject[]> => {
    try {
        const collection = await getCollection<IProject>(COLLECTION_NAME);

        const projects = await collection
            .find({ featured: true })
            .sort({ order: 1 })
            .limit(limit)
            .toArray();

        return projects;
    } catch (error) {
        console.error('Failed to fetch featured projects', error);
        return [];
    }
};

/**
 * Get a single project by slug
 */
export const getProject = async (slug: string): Promise<IProject | null> => {
    try {
        const collection = await getCollection<IProject>(COLLECTION_NAME);
        return await collection.findOne({ slug });
    } catch (error) {
        console.error(`Failed to fetch project: ${slug}`, error);
        return null;
    }
};
