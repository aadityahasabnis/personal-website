'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import Content from '@/server/models/Content';
import PageStats from '@/server/models/PageStats';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../../utils/helper';
import { revalidateProjectPaths } from '../../shared';

interface IProjectDeleteBase {
    _id: ObjectId;
    slug: string;
}

// ========================================================
// Delete
// ========================================================

export const deleteProject = async (projectId: string): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(projectId)) return error('Invalid project id', 400);

        await connectDB();

        const project = await Content.findOne({
            type: 'project',
            _id: projectId,
        }).select('_id slug').lean<IProjectDeleteBase | null>();

        if (!project) return error('Project not found', 404);

        await Promise.all([
            Content.deleteOne({ _id: project._id }),
            PageStats.deleteOne({ contentId: project._id }),
            Comment.deleteMany({ contentId: project._id }),
        ]);

        revalidateProjectPaths(project.slug);
        return success(true, 'Project deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete project');
    }
};

/*
API Responses:
- 200: Project deleted successfully.
- 400: Invalid project id.
- 404: Project not found.
- 500: Unexpected server/database error.
*/
