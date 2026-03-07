'use server';

import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IProject } from '@/interfaces';
import type { ActionResponse } from '../utils';
import { success, notFound, handleError, logDelete } from '../utils';

// ===== RESPONSE TYPE =====

export interface DeleteProjectResponse extends ActionResponse<void> {}

// ===== SERVER ACTION =====

export const deleteProject = async (slug: string): Promise<DeleteProjectResponse> => {
    try {
        const collection = await getCollection<IProject>(COLLECTIONS.projects);
        const project = await collection.findOne({ slug });
        if (!project) return notFound('Project');

        await collection.deleteOne({ slug });
        await (await getCollection(COLLECTIONS.articleStats)).deleteOne({ slug: `projects/${slug}` });
        
        ['/projects', '/admin/projects', '/', `/projects/${slug}`].forEach(p => revalidatePath(p));
        
        await logDelete('project', project.title, project._id?.toString());

        return success(undefined, 'Project deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete project');
    }
};
