'use server';

/**
 * Get Project(s) – Admin Server Actions (queries)
 */

import type { IProject, ProjectStatus, Serialized, ISeoMetadata } from '@/interfaces/schema';
import type { IApiResponse, IPaginatedResponse } from '@/interfaces/IApiResponse';
import type { Filter } from 'mongodb';
import {
    collections,
    findProject,
    notFoundError,
    ok,
    paginatedOk,
    handleError,
    serialize,
    normalizePagination,
    type PaginationParams,
} from '../../../utils';

// ============================================================
// Serialized Types
// ============================================================

/** Admin project list item — excludes body and gallery for performance. */
export type SerializedProject = Pick<
    Serialized<IProject>,
    | '_id'
    | 'slug'
    | 'title'
    | 'description'
    | 'published'
    | 'featured'
    | 'publishedAt'
    | 'createdAt'
    | 'updatedAt'
    | 'tags'
    | 'techStack'
    | 'githubUrl'
    | 'liveUrl'
    | 'demoVideo'
    | 'status'
    | 'startDate'
    | 'completedDate'
    | 'order'
>;

/** Admin project for editing — includes body, gallery + SEO. */
export type SerializedProjectForEdit = SerializedProject & Pick<
    Serialized<IProject>,
    | 'body'
    | 'coverImage'
    | 'gallery'
> & {
    seo: Serialized<ISeoMetadata> | null;
};

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
        const { offset, limit } = normalizePagination(pagination);
        const col = await collections.projects();
        const filter: Filter<IProject> = { type: 'project' };

        const [docs, count] = await Promise.all([
            col
                .find(filter)
                .sort({ order: 1 })
                .skip(offset)
                .limit(limit)
                .project({ body: 0, gallery: 0 })
                .toArray(),
            col.countDocuments(filter),
        ]);

        return paginatedOk(
            (docs as unknown as IProject[]).map(serializeProject),
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
            seo: project.seo
                ? (serialize(project.seo as Record<string, unknown>) as Serialized<ISeoMetadata>)
                : null,
        };

        return ok(serialized);
    } catch (err) {
        return handleError(err, 'Failed to fetch project for edit');
    }
}
