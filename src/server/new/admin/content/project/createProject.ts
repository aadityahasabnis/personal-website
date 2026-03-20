'use server';

import { PUBLISH_STATUS, type ProjectStatusType, type PublishStatusType } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import { calculateReadingTime } from '@/lib/utils';
import Content from '@/server/models/Content';
import { cleanUndefined, created, error, handleError, timestamps } from '../../../utils/helper';
import { buildSeo, getAdminId, revalidateProjectPaths } from '../../shared';
import {
    invalidDateToken,
    isDuplicateSlugError,
    isValidProjectStatus,
    isValidPublishStatus,
    parseOptionalDate,
} from './helpers';
import type { IProjectCreateInput } from './types';

// ========================================================
// Create
// ========================================================

export const createProject = async (input: IProjectCreateInput): Promise<IApiResponse<string>> => {
    try {
        const publishStatus: PublishStatusType = input.publishStatus ?? PUBLISH_STATUS.DRAFT;
        if (!isValidPublishStatus(publishStatus)) return error('Invalid publish status', 400);

        const projectStatus: ProjectStatusType | null = input.status ?? null;
        if (projectStatus !== null && !isValidProjectStatus(projectStatus)) return error('Invalid project status', 400);

        const startDate = parseOptionalDate(input.startDate);
        if (startDate === invalidDateToken) return error('Invalid start date', 400);

        const completedDate = parseOptionalDate(input.completedDate);
        if (completedDate === invalidDateToken) return error('Invalid completed date', 400);

        if (startDate instanceof Date && completedDate instanceof Date && completedDate < startDate) {
            return error('Completed date cannot be before start date', 400);
        }

        await connectDB();

        const admin = await getAdminId();
        if (!admin.success) return admin;

        const now = timestamps();
        const createdProject = await Content.create(
            cleanUndefined({
                type: 'project',
                slug: input.slug,
                title: input.title,
                description: input.description,
                body: input.body,
                tags: input.tags ?? [],
                coverImage: input.coverImage ?? null,
                readingTime: input.readingTime ?? calculateReadingTime(input.body),
                publishStatus,
                publishedAt: publishStatus === PUBLISH_STATUS.PUBLISHED ? new Date() : null,
                featured: input.featured ?? false,
                seo: buildSeo(input.seo),
                techStack: input.techStack ?? [],
                githubUrl: input.githubUrl ?? null,
                liveUrl: input.liveUrl ?? null,
                demoVideo: input.demoVideo ?? null,
                gallery: input.gallery ?? [],
                status: projectStatus,
                startDate: startDate ?? null,
                completedDate: completedDate ?? null,
                order: input.order ?? 0,
                createdBy: admin.data,
                updatedBy: admin.data,
                ...now,
            })
        );

        revalidateProjectPaths(input.slug);
        return created(createdProject._id.toString(), 'Project created successfully');
    } catch (err) {
        if (isDuplicateSlugError(err)) return error('Project with this slug already exists', 409);
        return handleError(err, 'Failed to create project');
    }
};

/*
API Responses:
- 201: Project created successfully.
- 400: Invalid publish status/project status/date input.
- 401: Unauthorized admin session.
- 409: Project slug already exists.
- 500: Unexpected server/database error.
*/
