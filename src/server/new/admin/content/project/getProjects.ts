'use server';

/**
 * Get Project(s) – Admin Server Actions (queries)
 */

import type { IProject } from '@/interfaces/schema';
import type { IApiResponse, IPaginatedResponse } from '@/interfaces/IApiResponse';
import {
    ensureConnection,
    Content,
    findProject,
    notFoundError,
    ok,
    paginatedOk,
    handleError,
    normalizePagination,
    type PaginationParams,
} from '../../../utils';
import { ProjectStatus } from '@/constants';

// ============================================================
// Serialized Types
// ============================================================

/** Admin project list item — excludes body and gallery for performance. */
export interface SerializedProject {
    _id: string;
    slug: string;
    title: string;
    description: string;
    published: boolean;
    featured: boolean;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    techStack: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    demoVideo: string | null;
    status: ProjectStatus;
    startDate: string | null;
    completedDate: string | null;
    order: number;
}

/** Admin project for editing — includes body, gallery + SEO. */
export interface SerializedProjectForEdit extends SerializedProject {
    body: string;
    coverImage: string | null;
    gallery: string[];
    seo: {
        title: string | null;
        description: string | null;
        keywords: string[];
        ogImage: string | null;
        canonicalUrl: string | null;
        noIndex: boolean;
    } | null;
}

// ============================================================
// Serializer
// ============================================================

function serializeProject(p: IProject): SerializedProject {
    return {
        _id: p._id?.toString() ?? '',
        slug: p.slug,
        title: p.title,
        description: p.description,
        published: p.published,
        featured: p.featured,
        publishedAt: p.publishedAt?.toISOString?.() ?? (p.publishedAt as unknown as string) ?? null,
        createdAt: p.createdAt?.toISOString?.() ?? (p.createdAt as unknown as string),
        updatedAt: p.updatedAt?.toISOString?.() ?? (p.updatedAt as unknown as string),
        tags: p.tags ?? [],
        techStack: p.techStack ?? [],
        githubUrl: p.githubUrl,
        liveUrl: p.liveUrl,
        demoVideo: p.demoVideo,
        status: p.status,
        startDate: p.startDate?.toISOString?.() ?? (p.startDate as unknown as string) ?? null,
        completedDate: p.completedDate?.toISOString?.() ?? (p.completedDate as unknown as string) ?? null,
        order: p.order,
    };
}

// ============================================================
// Queries
// ============================================================

export async function getProjects(
    pagination?: PaginationParams,
): Promise<IPaginatedResponse<SerializedProject>> {
    try {
        await ensureConnection();
        const { offset, limit } = normalizePagination(pagination);
        const filter = { type: 'project' as const };

        const [docs, count] = await Promise.all([
            Content.find(filter)
                .sort({ order: 1 })
                .skip(offset)
                .limit(limit)
                .select('-body -gallery')
                .lean<IProject[]>(),
            Content.countDocuments(filter),
        ]);

        return paginatedOk(
            docs.map(serializeProject),
            count,
            offset,
            limit,
        );
    } catch (err) {
        return handleError(err, 'Failed to fetch projects') as unknown as IPaginatedResponse<SerializedProject>;
    }
}

export async function getProjectForEdit(
    slug: string,
): Promise<IApiResponse<SerializedProjectForEdit | null>> {
    try {
        const project = await findProject(slug);
        if (!project) return notFoundError('Project');

        const serialized: SerializedProjectForEdit = {
            ...serializeProject(project),
            body: project.body,
            coverImage: project.coverImage,
            gallery: project.gallery ?? [],
            seo: project.seo ? {
                title: project.seo.title,
                description: project.seo.description,
                keywords: project.seo.keywords,
                ogImage: project.seo.ogImage,
                canonicalUrl: project.seo.canonicalUrl,
                noIndex: project.seo.noIndex,
            } : null,
        };

        return ok(serialized);
    } catch (err) {
        return handleError(err, 'Failed to fetch project for edit');
    }
}
