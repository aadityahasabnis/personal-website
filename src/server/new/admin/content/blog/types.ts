import type { PublishStatusType } from '@/constants/schemaConstants';
import type { ISeoMetadata } from '@/interfaces/schema';
import type { ITableQueryParams } from '../../shared';

// ========================================================
// Blog Types
// ========================================================

export interface IBlogCreateInput {
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
}

export type IBlogUpdateInput = Partial<IBlogCreateInput>;

export interface IBlogTableQuery extends ITableQueryParams {
    publishStatus?: PublishStatusType;
    featured?: boolean;
}

export interface IBlogRow {
    id: string;
    slug: string;
    title: string;
    description: string;
    publishStatus: PublishStatusType;
    featured: boolean;
    readingTime: number;
    publishedAt: string | null;
    updatedAt: string;
}

export interface IBlogEdit extends IBlogRow {
    body: string;
    tags: string[];
    coverImage: string | null;
    seo: ISeoMetadata | null;
}