import type { ProjectStatusType } from '@/constants/schemaConstants';
import { CONTENT_TYPES } from '@/constants/schemaConstants';
import type { ISeoMetadata } from '@/interfaces/schema';
import Content from '@/server/models/Content';
import { ObjectId } from 'mongodb';
import { toIsoOrNull } from '../../shared';
import { buildPublishedContentMatch } from '../shared';
import type { IPublicProjectDetail, IPublicProjectListItem } from './types';

export interface IProjectLean {
    _id: ObjectId;
    slug: string;
    title: string;
    description: string;
    body: string;
    html?: string | null;
    coverImage?: string | null;
    tags?: string[];
    techStack?: string[];
    githubUrl?: string | null;
    liveUrl?: string | null;
    demoVideo?: string | null;
    gallery?: string[];
    status?: ProjectStatusType | null;
    startDate?: Date | null;
    completedDate?: Date | null;
    order?: number;
    readingTime?: number;
    featured?: boolean;
    publishedAt?: Date | null;
    updatedAt: Date;
    seo?: ISeoMetadata | null;
}

export const toPublicProjectListItem = (row: IProjectLean): IPublicProjectListItem => ({
    id: row._id.toString(),
    slug: row.slug,
    title: row.title,
    description: row.description,
    coverImage: row.coverImage ?? null,
    tags: row.tags ?? [],
    techStack: row.techStack ?? [],
    githubUrl: row.githubUrl ?? null,
    liveUrl: row.liveUrl ?? null,
    demoVideo: row.demoVideo ?? null,
    gallery: row.gallery ?? [],
    status: row.status ?? null,
    startDate: toIsoOrNull(row.startDate),
    completedDate: toIsoOrNull(row.completedDate),
    order: row.order ?? 0,
    readingTime: row.readingTime ?? 0,
    featured: Boolean(row.featured),
    publishedAt: toIsoOrNull(row.publishedAt),
    updatedAt: row.updatedAt.toISOString(),
});

export const toPublicProjectDetail = (row: IProjectLean): IPublicProjectDetail => ({
    ...toPublicProjectListItem(row),
    body: row.body,
    html: row.html ?? null,
    seo: row.seo ?? null,
});

export const getPublishedProjectBySlug = async (projectSlug: string): Promise<IProjectLean | null> => {
    return Content.findOne(
        buildPublishedContentMatch(CONTENT_TYPES.PROJECT, {
            slug: projectSlug,
        })
    )
        .select(
            '_id slug title description body html coverImage tags techStack githubUrl liveUrl demoVideo gallery status startDate completedDate order readingTime featured publishedAt updatedAt seo'
        )
        .lean<IProjectLean | null>();
};

export const getPublishedProjectByObjectId = async (projectId: ObjectId): Promise<IProjectLean | null> => {
    return Content.findOne(
        buildPublishedContentMatch(CONTENT_TYPES.PROJECT, {
            _id: projectId,
        })
    )
        .select(
            '_id slug title description body html coverImage tags techStack githubUrl liveUrl demoVideo gallery status startDate completedDate order readingTime featured publishedAt updatedAt seo'
        )
        .lean<IProjectLean | null>();
};
