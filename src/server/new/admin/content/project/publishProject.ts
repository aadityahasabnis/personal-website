'use server';

import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import { ObjectId } from 'mongodb';
import { error, handleError, success, updatedNow } from '../../../utils/helper';
import { getAdminId, revalidateProjectPaths } from '../../shared';
import { isPublishedProject, isValidPublishStatus, type IProjectActionBase } from './helpers';

// ========================================================
// Status Change
// ========================================================

export const changeProjectPublishStatus = async (
    projectId: string,
    nextStatus: PublishStatusType,
): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!ObjectId.isValid(projectId)) return error('Invalid project id', 400);
        if (!isValidPublishStatus(nextStatus)) return error('Invalid publish status', 400);

        await connectDB();

        const project = await Content.findOne({
            type: 'project',
            _id: projectId,
        }).select('_id slug publishStatus').lean<Pick<IProjectActionBase, '_id' | 'slug' | 'publishStatus'> | null>();

        if (!project) return error('Project not found', 404);
        if (project.publishStatus === nextStatus) return success(true, `Project already ${nextStatus}`);

        const wasPublished = isPublishedProject(project);
        const willBePublished = nextStatus === PUBLISH_STATUS.PUBLISHED;
        const nextPublishedAt = !wasPublished && willBePublished
            ? new Date()
            : wasPublished && !willBePublished
                ? null
                : undefined;

        await Content.updateOne(
            { _id: project._id },
            {
                $set: {
                    publishStatus: nextStatus,
                    publishedAt: nextPublishedAt,
                    ...updatedNow(),
                },
            }
        );

        revalidateProjectPaths(project.slug);
        return success(true, `Project status changed to ${nextStatus}`);
    } catch (err) {
        return handleError(err, 'Failed to change project status');
    }
};

export const setProjectPublished = async (projectId: string): Promise<IApiResponse<boolean>> => {
    return changeProjectPublishStatus(projectId, PUBLISH_STATUS.PUBLISHED);
};

export const setProjectDraft = async (projectId: string): Promise<IApiResponse<boolean>> => {
    return changeProjectPublishStatus(projectId, PUBLISH_STATUS.DRAFT);
};

export const setProjectArchived = async (projectId: string): Promise<IApiResponse<boolean>> => {
    return changeProjectPublishStatus(projectId, PUBLISH_STATUS.ARCHIVED);
};

/*
API Responses:
- changeProjectPublishStatus/setProjectPublished/setProjectDraft/setProjectArchived
    - 200: Action completed successfully.
    - 400: Invalid project id or publish status.
    - 404: Project not found.
    - 500: Unexpected server/database error.
*/
