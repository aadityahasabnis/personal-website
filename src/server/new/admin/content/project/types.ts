import type { ProjectStatusType, PublishStatusType } from '@/constants/schemaConstants';
import type { ISeoMetadata } from '@/interfaces/schema';
import type { ITableQueryParams } from '../../shared';

// ========================================================
// Project Types
// ========================================================

export interface IProjectCreateInput {
    slug: string;
    title: string;
    description: string;
    body: string;
    tags?: string[];
    coverImage?: string | null;
    readingTime?: number;
    publishStatus?: PublishStatusType;
    featured?: boolean;
    seo?: Partial<ISeoMetadata> | null;

    techStack?: string[];
    githubUrl?: string | null;
    liveUrl?: string | null;
    demoVideo?: string | null;
    gallery?: string[];
    status?: ProjectStatusType | null;
    startDate?: string | Date | null;
    completedDate?: string | Date | null;
    order?: number;
}

export type IProjectUpdateInput = Partial<IProjectCreateInput>;

export interface IProjectTableQuery extends ITableQueryParams {
    publishStatus?: PublishStatusType;
    featured?: boolean;
    status?: ProjectStatusType;
}

export interface IProjectRow {
    id: string;
    slug: string;
    title: string;
    description: string;
    coverImage: string | null;

    techStack: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    status: ProjectStatusType | null;

    publishStatus: PublishStatusType;
    featured: boolean;
    order: number;
    readingTime: number;
    publishedAt: string | null;
    updatedAt: string;
}

export interface IProjectEdit extends IProjectRow {
    body: string;
    tags: string[];
    demoVideo: string | null;
    gallery: string[];
    startDate: string | null;
    completedDate: string | null;
    seo: ISeoMetadata | null;
}
