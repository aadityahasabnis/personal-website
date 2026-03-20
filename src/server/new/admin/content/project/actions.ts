'use server';

import { PUBLISH_STATUS, type ProjectStatusType, type PublishStatusType } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import Content from '@/server/models/Content';
import PageStats from '@/server/models/PageStats';
import { ObjectId } from 'mongodb';
import { cleanUndefined, error, handleError, success, updatedNow } from '../../../utils/helper';
import { revalidateProjectPaths } from '../../shared';
import {
    isValidProjectStatus,
    isValidPublishStatus,
    normalizeProjectIds,
    toObjectIds,
    type IProjectActionBase,
} from './helpers';
import { changeProjectPublishStatus } from './publishProject';

interface IProjectBulkStatusBase {
    _id: ObjectId;
    slug: string;
    publishStatus: PublishStatusType;
}

interface IProjectBulkDeleteBase {
    _id: ObjectId;
    slug: string;
}

// ========================================================
// Quick Actions
// ========================================================

export const setProjectStatus = async (
    projectId: string,
    status: PublishStatusType,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(projectId)) return error('Invalid project id', 400);
        if (!isValidPublishStatus(status)) return error('Invalid publish status', 400);
        return changeProjectPublishStatus(projectId, status);
    } catch (err) {
        return handleError(err, 'Failed to set project status');
    }
};

export const toggleProjectFeatured = async (
    projectId: string,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(projectId)) return error('Invalid project id', 400);

        await connectDB();

        const project = await Content.findOne({ type: 'project', _id: projectId })
            .select('featured')
            .lean<Pick<IProjectActionBase, 'featured'> | null>();

        if (!project) return error('Project not found', 404);
        return setProjectFeatured(projectId, !project.featured);
    } catch (err) {
        return handleError(err, 'Failed to toggle project featured');
    }
};

export const setProjectFeatured = async (
    projectId: string,
    featured: boolean,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(projectId)) return error('Invalid project id', 400);

        await connectDB();

        const project = await Content.findOne({ type: 'project', _id: projectId })
            .select('_id slug featured')
            .lean<Pick<IProjectActionBase, '_id' | 'slug' | 'featured'> | null>();
        if (!project) return error('Project not found', 404);

        if (project.featured === featured) {
            return success(featured, featured ? 'Project already featured' : 'Project already unfeatured');
        }

        await Content.updateOne({ _id: project._id }, { $set: { featured, ...updatedNow() } });
        revalidateProjectPaths(project.slug);

        return success(featured, featured ? 'Project featured' : 'Project unfeatured');
    } catch (err) {
        return handleError(err, 'Failed to set project featured state');
    }
};

export const setProjectLifecycleStatus = async (
    projectId: string,
    status: ProjectStatusType | null,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(projectId)) return error('Invalid project id', 400);
        if (typeof status === 'string' && !isValidProjectStatus(status)) return error('Invalid project status', 400);

        await connectDB();

        const project = await Content.findOne({ type: 'project', _id: projectId })
            .select('_id slug status')
            .lean<Pick<IProjectActionBase, '_id' | 'slug' | 'status'> | null>();

        if (!project) return error('Project not found', 404);

        if (project.status === status) {
            return success(true, status ? `Project status already ${status}` : 'Project status already cleared');
        }

        await Content.updateOne({ _id: project._id }, { $set: { status, ...updatedNow() } });
        revalidateProjectPaths(project.slug);

        return success(true, status ? `Project status changed to ${status}` : 'Project status cleared');
    } catch (err) {
        return handleError(err, 'Failed to set project lifecycle status');
    }
};

// ========================================================
// Bulk Actions
// ========================================================

export const bulkDeleteProjects = async (
    projectIds: string[],
): Promise<IApiResponse<boolean>> => {
    try {
        if (!projectIds.length) return success(true, 'No projects selected');
        if (!projectIds.every((id) => ObjectId.isValid(id))) return error('One or more project ids are invalid', 400);

        const uniqueProjectIds = normalizeProjectIds(projectIds);
        const objectIds = toObjectIds(uniqueProjectIds);

        await connectDB();

        const projects = await Content.find({
            type: 'project',
            _id: { $in: objectIds },
        }).select('_id slug').lean<IProjectBulkDeleteBase[]>();

        if (projects.length !== uniqueProjectIds.length) return error('One or more projects not found', 404);

        await Promise.all([
            Content.deleteMany({ type: 'project', _id: { $in: objectIds } }),
            PageStats.deleteMany({ contentId: { $in: objectIds } }),
            Comment.deleteMany({ contentId: { $in: objectIds } }),
        ]);

        projects.forEach((project) => revalidateProjectPaths(project.slug));
        return success(true, 'Projects deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to bulk delete projects');
    }
};

export const bulkPublishProjects = async (
    projectIds: string[],
): Promise<IApiResponse<boolean>> => {
    return bulkSetProjectStatus(projectIds, PUBLISH_STATUS.PUBLISHED);
};

export const bulkSetProjectStatus = async (
    projectIds: string[],
    status: PublishStatusType,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!projectIds.length) return success(true, 'No projects selected');
        if (!projectIds.every((id) => ObjectId.isValid(id))) return error('One or more project ids are invalid', 400);
        if (!isValidPublishStatus(status)) return error('Invalid publish status', 400);

        const uniqueProjectIds = normalizeProjectIds(projectIds);
        const objectIds = toObjectIds(uniqueProjectIds);

        await connectDB();

        const projects = await Content.find({
            type: 'project',
            _id: { $in: objectIds },
        }).select('_id slug publishStatus').lean<IProjectBulkStatusBase[]>();

        if (projects.length !== uniqueProjectIds.length) return error('One or more projects not found', 404);

        const projectsToUpdate = projects.filter((project) => project.publishStatus !== status);

        if (projectsToUpdate.length) {
            const updateIds = projectsToUpdate.map((project) => project._id);

            if (status === PUBLISH_STATUS.PUBLISHED) {
                await Content.updateMany(
                    { type: 'project', _id: { $in: updateIds } },
                    { $set: cleanUndefined({ publishStatus: status, publishedAt: new Date(), ...updatedNow() }) }
                );
            } else {
                await Content.updateMany(
                    { type: 'project', _id: { $in: updateIds } },
                    { $set: cleanUndefined({ publishStatus: status, publishedAt: null, ...updatedNow() }) }
                );
            }
        }

        projects.forEach((project) => revalidateProjectPaths(project.slug));
        return success(true, `Projects status changed to ${status}`);
    } catch (err) {
        return handleError(err, 'Failed to bulk set project status');
    }
};

export const bulkSetProjectLifecycleStatus = async (
    projectIds: string[],
    status: ProjectStatusType | null,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!projectIds.length) return success(true, 'No projects selected');
        if (!projectIds.every((id) => ObjectId.isValid(id))) return error('One or more project ids are invalid', 400);
        if (typeof status === 'string' && !isValidProjectStatus(status)) return error('Invalid project status', 400);

        const uniqueProjectIds = normalizeProjectIds(projectIds);
        const objectIds = toObjectIds(uniqueProjectIds);

        await connectDB();

        const projects = await Content.find({
            type: 'project',
            _id: { $in: objectIds },
        }).select('_id slug').lean<IProjectBulkDeleteBase[]>();

        if (projects.length !== uniqueProjectIds.length) return error('One or more projects not found', 404);

        await Content.updateMany(
            { type: 'project', _id: { $in: objectIds } },
            { $set: { status, ...updatedNow() } }
        );

        projects.forEach((project) => revalidateProjectPaths(project.slug));
        return success(true, status ? `Projects lifecycle status changed to ${status}` : 'Projects lifecycle status cleared');
    } catch (err) {
        return handleError(err, 'Failed to bulk set project lifecycle status');
    }
};

export const bulkArchiveProjects = async (
    projectIds: string[],
): Promise<IApiResponse<boolean>> => {
    return bulkSetProjectStatus(projectIds, PUBLISH_STATUS.ARCHIVED);
};

export const bulkDraftProjects = async (
    projectIds: string[],
): Promise<IApiResponse<boolean>> => {
    return bulkSetProjectStatus(projectIds, PUBLISH_STATUS.DRAFT);
};

/*
API Responses:
- setProjectStatus/setProjectFeatured/toggleProjectFeatured/setProjectLifecycleStatus
    - 200: Action completed successfully.
    - 400: Invalid project id/status.
    - 404: Project not found.
    - 500: Unexpected server/database error.
- bulkDeleteProjects/bulkSetProjectStatus/bulkPublishProjects/bulkArchiveProjects/bulkDraftProjects/bulkSetProjectLifecycleStatus
    - 200: Bulk action completed successfully.
    - 400: One or more project ids are invalid.
    - 404: One or more requested projects not found.
    - 500: Unexpected server/database error.
*/
