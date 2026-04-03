import type { ProjectStatusType } from '@/constants/schemaConstants';
import type { ISeoMetadata } from '@/interfaces/schema';
import type { IPublicListQuery } from '../../shared';

export interface IPublicProjectListItem {
    id: string;
    slug: string;
    title: string;
    description: string;
    coverImage: string | null;
    techStack: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    status: ProjectStatusType | null;
    startDate: string | null;
    completedDate: string | null;
    order: number;
    featured: boolean;
    publishedAt: string | null;
}

export interface IPublicProjectDetail extends IPublicProjectListItem {
    body: string;
    html: string | null;
    tags: string[];
    demoVideo: string | null;
    gallery: string[];
    readingTime: number;
    updatedAt: string;
    seo: ISeoMetadata | null;
}

export interface IProjectListQuery extends IPublicListQuery {
    featuredOnly?: boolean;
    status?: ProjectStatusType;
}

export interface IProjectStaticPath {
    contentId: string;
    projectSlug: string;
}
