'use server';

import { PUBLISH_STATUS, type ProjectStatusType } from '@/constants/schemaConstants';
import type { IApiResponse, IPaginatedResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import { ObjectId } from 'mongodb';
import { buildSort, error, handleError, normalizePagination, paginated, success } from '../../../utils/helper';
import { getAdminId } from '../../shared';
import type { IProjectEdit, IProjectRow, IProjectTableQuery } from './types';

interface IProjectListDoc {
    _id: ObjectId;
    slug: string;
    title: string;
    description: string;
    coverImage?: string | null;
    techStack?: string[];
    githubUrl?: string | null;
    liveUrl?: string | null;
    status?: ProjectStatusType | null;
    publishStatus?: string;
    featured?: boolean;
    order?: number;
    readingTime?: number;
    publishedAt?: Date | null;
    updatedAt: Date;
}

interface IProjectEditDoc extends IProjectListDoc {
    body: string;
    tags?: string[];
    demoVideo?: string | null;
    gallery?: string[];
    startDate?: Date | null;
    completedDate?: Date | null;
    seo?: IProjectEdit['seo'];
}

// ========================================================
// Queries
// ========================================================

export const getProjects = async (params: IProjectTableQuery = {}): Promise<IPaginatedResponse<IProjectRow>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const { offset, limit } = normalizePagination(params.pagination);
        const sort = buildSort(params.sort, { order: 1, updatedAt: -1 });
        const match: Record<string, unknown> = { type: 'project' };

        if (typeof params.publishStatus === 'string') match.publishStatus = params.publishStatus;
        if (typeof params.featured === 'boolean') match.featured = params.featured;
        if (typeof params.status === 'string') match.status = params.status;
        if (params.query?.trim()) {
            const q = params.query.trim();
            match.$or = [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { slug: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } },
                { techStack: { $regex: q, $options: 'i' } },
            ];
        }

        const [docs, total] = await Promise.all([
            Content.find(match)
                .select('_id slug title description coverImage techStack githubUrl liveUrl status publishStatus featured order readingTime publishedAt updatedAt')
                .sort(sort)
                .skip(offset)
                .limit(limit)
                .lean<IProjectListDoc[]>(),
            Content.countDocuments(match),
        ]);

        const rows: IProjectRow[] = docs.map((doc) => ({
            id: doc._id.toString(),
            slug: doc.slug,
            title: doc.title,
            description: doc.description,
            coverImage: doc.coverImage ?? null,
            techStack: doc.techStack ?? [],
            githubUrl: doc.githubUrl ?? null,
            liveUrl: doc.liveUrl ?? null,
            status: doc.status ?? null,
            publishStatus: (doc.publishStatus ?? PUBLISH_STATUS.DRAFT) as IProjectRow['publishStatus'],
            featured: doc.featured ?? false,
            order: doc.order ?? 0,
            readingTime: doc.readingTime ?? 0,
            publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
            updatedAt: doc.updatedAt.toISOString(),
        }));

        return paginated(rows, total, offset, limit);
    } catch (err) {
        return handleError(err, 'Failed to fetch projects') as IPaginatedResponse<IProjectRow>;
    }
};

export const getProjectForEdit = async (
    projectId: string,
): Promise<IApiResponse<IProjectEdit | null>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!ObjectId.isValid(projectId)) return error('Invalid project id', 400);

        await connectDB();

        const doc = await Content.findOne({
            type: 'project',
            _id: projectId,
        })
            .select('_id slug title description body tags coverImage techStack githubUrl liveUrl demoVideo gallery status startDate completedDate publishStatus featured order readingTime publishedAt seo updatedAt')
            .lean<IProjectEditDoc | null>();

        if (!doc) return success(null);

        const payload: IProjectEdit = {
            id: doc._id.toString(),
            slug: doc.slug,
            title: doc.title,
            description: doc.description,
            coverImage: doc.coverImage ?? null,
            techStack: doc.techStack ?? [],
            githubUrl: doc.githubUrl ?? null,
            liveUrl: doc.liveUrl ?? null,
            status: doc.status ?? null,
            publishStatus: (doc.publishStatus ?? PUBLISH_STATUS.DRAFT) as IProjectEdit['publishStatus'],
            featured: doc.featured ?? false,
            order: doc.order ?? 0,
            readingTime: doc.readingTime ?? 0,
            publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
            updatedAt: doc.updatedAt.toISOString(),
            body: doc.body,
            tags: doc.tags ?? [],
            demoVideo: doc.demoVideo ?? null,
            gallery: doc.gallery ?? [],
            startDate: doc.startDate ? doc.startDate.toISOString() : null,
            completedDate: doc.completedDate ? doc.completedDate.toISOString() : null,
            seo: doc.seo ?? null,
        };

        return success(payload);
    } catch (err) {
        return handleError(err, 'Failed to fetch project');
    }
};

/*
API Responses:
- getProjects
    - 200: Projects list returned with pagination metadata.
    - 500: Unexpected server/database error.
- getProjectForEdit
    - 200: Project edit payload returned (or null data when not found).
    - 400: Invalid project id.
    - 500: Unexpected server/database error.
*/
