'use server';

import { type ProjectStatusType } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../../utils/helper';
import { revalidateProjectPaths } from '../../shared';
import { isValidProjectStatus } from './helpers';

interface IProjectReorderBase {
    _id: ObjectId;
    slug: string;
}

// ========================================================
// Reorder
// ========================================================

export const reorderProjects = async (
    projectIds: string[],
    status?: ProjectStatusType | null,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!projectIds.length) return success(true);
        if (!projectIds.every((id) => ObjectId.isValid(id))) return error('One or more project ids are invalid', 400);
        if (typeof status === 'string' && !isValidProjectStatus(status)) return error('Invalid project status', 400);

        await connectDB();

        const objectIds = projectIds.map((id) => new ObjectId(id));
        const baseFilter: Record<string, unknown> = { type: 'project' };
        if (typeof status === 'string') baseFilter.status = status;
        if (status === null) baseFilter.status = null;

        const scopedProjects = await Content.find({
            ...baseFilter,
            _id: { $in: objectIds },
        }).select('_id slug').lean<IProjectReorderBase[]>();

        if (scopedProjects.length !== projectIds.length) {
            return error('One or more projects are outside the requested status scope', 404);
        }

        const now = new Date();
        await Content.bulkWrite(
            projectIds.map((id, index) => ({
                updateOne: {
                    filter: { ...baseFilter, _id: new ObjectId(id) },
                    update: { $set: { order: index, updatedAt: now } },
                },
            }))
        );

        scopedProjects.forEach((project) => revalidateProjectPaths(project.slug));
        return success(true, 'Projects reordered successfully');
    } catch (err) {
        return handleError(err, 'Failed to reorder projects');
    }
};

/*
API Responses:
- 200: Projects reordered successfully.
- 400: Invalid project id or status input.
- 404: One or more projects outside requested scope.
- 500: Unexpected server/database error.
*/
