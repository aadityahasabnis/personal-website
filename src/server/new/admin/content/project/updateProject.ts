'use server';

import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import { calculateReadingTime } from '@/lib/utils';
import Content from '@/server/models/Content';
import { ObjectId } from 'mongodb';
import { cleanUndefined, error, handleError, success, updatedNow } from '../../../utils/helper';
import { buildSeo, getAdminId, revalidateProjectPaths } from '../../shared';
import {
    invalidDateToken,
    isDuplicateSlugError,
    isPublishedProject,
    isValidProjectStatus,
    isValidPublishStatus,
    parseOptionalDate,
    type IProjectActionBase,
} from './helpers';
import type { IProjectUpdateInput } from './types';

// ========================================================
// Update
// ========================================================

export const updateProject = async (
    projectId: string,
    input: IProjectUpdateInput,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(projectId)) return error('Invalid project id', 400);
        if (input.publishStatus && !isValidPublishStatus(input.publishStatus)) return error('Invalid publish status', 400);
        if (input.status !== undefined && input.status !== null && !isValidProjectStatus(input.status)) {
            return error('Invalid project status', 400);
        }

        const parsedStartDate = parseOptionalDate(input.startDate);
        if (parsedStartDate === invalidDateToken) return error('Invalid start date', 400);

        const parsedCompletedDate = parseOptionalDate(input.completedDate);
        if (parsedCompletedDate === invalidDateToken) return error('Invalid completed date', 400);

        await connectDB();

        const admin = await getAdminId();
        if (!admin.success) return admin;

        const project = await Content.findOne({
            type: 'project',
            _id: projectId,
        }).select('_id slug publishStatus startDate completedDate').lean<
            Pick<IProjectActionBase, '_id' | 'slug' | 'publishStatus' | 'startDate' | 'completedDate'> | null
        >();

        if (!project) return error('Project not found', 404);

        const currentPublished = isPublishedProject(project);
        const nextPublishStatus: PublishStatusType = input.publishStatus ?? project.publishStatus;
        const nextPublished = nextPublishStatus === PUBLISH_STATUS.PUBLISHED;
        const nextPublishedAt = !currentPublished && nextPublished
            ? new Date()
            : currentPublished && !nextPublished
                ? null
                : undefined;

        const nextStartDate = parsedStartDate === undefined ? project.startDate : parsedStartDate;
        const nextCompletedDate = parsedCompletedDate === undefined ? project.completedDate : parsedCompletedDate;

        if (nextStartDate instanceof Date && nextCompletedDate instanceof Date && nextCompletedDate < nextStartDate) {
            return error('Completed date cannot be before start date', 400);
        }

        await Content.updateOne(
            { _id: project._id },
            {
                $set: cleanUndefined({
                    slug: input.slug,
                    title: input.title,
                    description: input.description,
                    body: input.body,
                    tags: input.tags,
                    coverImage: input.coverImage,
                    readingTime: input.body ? calculateReadingTime(input.body) : input.readingTime,
                    publishStatus: nextPublishStatus,
                    publishedAt: nextPublishedAt,
                    featured: input.featured,
                    seo: input.seo ? buildSeo(input.seo) : undefined,
                    techStack: input.techStack,
                    githubUrl: input.githubUrl,
                    liveUrl: input.liveUrl,
                    demoVideo: input.demoVideo,
                    gallery: input.gallery,
                    status: input.status,
                    startDate: parsedStartDate,
                    completedDate: parsedCompletedDate,
                    order: input.order,
                    updatedBy: admin.data,
                    ...updatedNow(),
                }),
            }
        );

        revalidateProjectPaths(project.slug);
        if (input.slug && input.slug !== project.slug) revalidateProjectPaths(input.slug);

        return success(true, 'Project updated successfully');
    } catch (err) {
        if (isDuplicateSlugError(err)) return error('Project with this slug already exists', 409);
        return handleError(err, 'Failed to update project');
    }
};

/*
API Responses:
- 200: Project updated successfully.
- 400: Invalid project id, publish status, project status, or date input.
- 401: Unauthorized admin session.
- 404: Project not found.
- 409: Project slug conflict.
- 500: Unexpected server/database error.
*/
