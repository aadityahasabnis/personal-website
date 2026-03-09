'use server';

/**
 * Public Project Queries
 *
 * Published project content for the public website.
 * Optimized for SSG/ISR with full SEO metadata.
 */

import type { IProject, ProjectStatus } from '@/interfaces/schema';
import type { IApiResponse, IPaginatedResponse } from '@/interfaces/IApiResponse';
import type { Filter } from 'mongodb';
import {
    collections,
    findPublishedProject,
    notFoundError,
    ok,
    paginatedOk,
    handleError,
    normalizePagination,
    type PaginationParams,
} from '../../utils';
import type { PublicProject, PublicProjectCard } from './types';

// ============================================================
// Serializers
// ============================================================

function serializeProjectFull(p: IProject): PublicProject {
    return {
        _id: p._id?.toString() ?? '',
        slug: p.slug,
        title: p.title,
        description: p.description,
        body: p.body,
        tags: p.tags ?? [],
        coverImage: p.coverImage,
        publishedAt: p.publishedAt?.toISOString?.() ?? (p.publishedAt as unknown as string) ?? '',
        updatedAt: p.updatedAt?.toISOString?.() ?? (p.updatedAt as unknown as string),
        featured: p.featured,
        techStack: p.techStack ?? [],
        githubUrl: p.githubUrl,
        liveUrl: p.liveUrl,
        demoVideo: p.demoVideo,
        gallery: p.gallery ?? [],
        status: p.status,
        startDate: p.startDate?.toISOString?.() ?? (p.startDate as unknown as string) ?? null,
        completedDate: p.completedDate?.toISOString?.() ?? (p.completedDate as unknown as string) ?? null,
        order: p.order,
        seo: {
            title: p.seo?.title ?? null,
            description: p.seo?.description ?? null,
            keywords: p.seo?.keywords ?? [],
            ogImage: p.seo?.ogImage ?? null,
            canonicalUrl: p.seo?.canonicalUrl ?? null,
            noIndex: p.seo?.noIndex ?? false,
        },
    };
}

function serializeProjectCard(p: IProject): PublicProjectCard {
    return {
        slug: p.slug,
        title: p.title,
        description: p.description,
        coverImage: p.coverImage,
        tags: p.tags ?? [],
        techStack: p.techStack ?? [],
        githubUrl: p.githubUrl,
        liveUrl: p.liveUrl,
        status: p.status,
        featured: p.featured,
        order: p.order,
    };
}

// ============================================================
// Queries
// ============================================================

/**
 * Get a single published project by slug.
 * Used for the project detail page (SSG/ISR).
 */
export async function getPublicProject(
    slug: string,
): Promise<IApiResponse<PublicProject>> {
    try {
        const project = await findPublishedProject(slug);
        if (!project) return notFoundError('Project');

        return ok(serializeProjectFull(project));
    } catch (err) {
        return handleError(err, 'Failed to fetch project');
    }
}

/**
 * Get all published projects (paginated, sorted by order).
 */
export async function getPublicProjects(
    pagination?: PaginationParams,
): Promise<IPaginatedResponse<PublicProjectCard>> {
    try {
        const { offset, limit } = normalizePagination(pagination);
        const col = await collections.projects();
        const filter: Filter<IProject> = { type: 'project', published: true };

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
            (docs as unknown as IProject[]).map(serializeProjectCard),
            count,
            offset,
            limit,
        );
    } catch (err) {
        return handleError(err, 'Failed to fetch projects') as unknown as IPaginatedResponse<PublicProjectCard>;
    }
}

/**
 * Get featured published projects for homepage.
 */
export async function getPublicFeaturedProjects(
    limit = 3,
): Promise<IApiResponse<PublicProjectCard[]>> {
    try {
        const col = await collections.projects();
        const docs = await col
            .find({
                type: 'project',
                published: true,
                featured: true,
            } as Filter<IProject>)
            .sort({ order: 1 })
            .limit(limit)
            .project({ body: 0, gallery: 0 })
            .toArray();

        return ok((docs as unknown as IProject[]).map(serializeProjectCard));
    } catch (err) {
        return handleError(err, 'Failed to fetch featured projects');
    }
}

/**
 * Get published projects filtered by status.
 */
export async function getPublicProjectsByStatus(
    status: ProjectStatus,
    pagination?: PaginationParams,
): Promise<IPaginatedResponse<PublicProjectCard>> {
    try {
        const { offset, limit } = normalizePagination(pagination);
        const col = await collections.projects();
        const filter: Filter<IProject> = {
            type: 'project',
            published: true,
            status,
        };

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
            (docs as unknown as IProject[]).map(serializeProjectCard),
            count,
            offset,
            limit,
        );
    } catch (err) {
        return handleError(err, 'Failed to fetch projects by status') as unknown as IPaginatedResponse<PublicProjectCard>;
    }
}

/**
 * Get published projects filtered by tech stack tag.
 */
export async function getPublicProjectsByTech(
    tech: string,
    pagination?: PaginationParams,
): Promise<IPaginatedResponse<PublicProjectCard>> {
    try {
        const { offset, limit } = normalizePagination(pagination);
        const col = await collections.projects();
        const filter: Filter<IProject> = {
            type: 'project',
            published: true,
            techStack: tech,
        };

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
            (docs as unknown as IProject[]).map(serializeProjectCard),
            count,
            offset,
            limit,
        );
    } catch (err) {
        return handleError(err, 'Failed to fetch projects by tech') as unknown as IPaginatedResponse<PublicProjectCard>;
    }
}

/**
 * Get all published project slugs for generateStaticParams.
 */
export async function getPublicProjectSlugs(): Promise<
    Array<{ slug: string }>
> {
    try {
        const col = await collections.projects();
        const docs = await col
            .find({ type: 'project', published: true } as Filter<IProject>)
            .project({ slug: 1, _id: 0 })
            .toArray();

        return docs as Array<{ slug: string }>;
    } catch (err) {
        console.error('Failed to fetch project slugs:', err);
        return [];
    }
}
