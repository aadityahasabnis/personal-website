import type { ProjectStatusType } from '@/constants/schemaConstants';
import type { ISeoMetadata } from '@/interfaces/schema';
import type { IPublicListQuery } from '../../shared';

export interface IPublicProjectListItem {
    id: string;
    slug: string;
    title: string;
    description: string;
    coverImage: string | null;
    tags: string[];
    techStack: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    demoVideo: string | null;
    gallery: string[];
    status: ProjectStatusType | null;
    startDate: string | null;
    completedDate: string | null;
    order: number;
    readingTime: number;
    featured: boolean;
    publishedAt: string | null;
    updatedAt: string;
}

export interface IPublicProjectDetail extends IPublicProjectListItem {
    body: string;
    html: string | null;
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
