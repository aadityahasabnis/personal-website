import type { PublishStatusType } from '@/constants/schemaConstants';
import type { ISeoMetadata } from '@/interfaces/schema';
import type { ITableQueryParams } from '../../shared';

// ========================================================
// Article Types
// ========================================================

export interface IArticleCreateInput {
    slug: string;
    title: string;
    description: string;
    body: string;
    topicId: string;
    subtopicId?: string | null;
    tags?: string[];
    coverImage?: string | null;
    readingTime?: number;
    publishStatus?: PublishStatusType;
    featured?: boolean;
    order?: number;
    seo?: Partial<ISeoMetadata> | null;
}

export type IArticleUpdateInput = Partial<IArticleCreateInput>;

export interface IArticleTableQuery extends ITableQueryParams {
    topicId?: string;
    subtopicId?: string;
    publishStatus?: PublishStatusType;
    featured?: boolean;
}

export interface IArticleRow {
    id: string;
    slug: string;
    title: string;
    description: string;
    topicId: string;
    topicSlug: string;
    topicTitle: string;
    subtopicId: string | null;
    subtopicSlug: string | null;
    subtopicTitle: string | null;
    publishStatus: PublishStatusType;
    featured: boolean;
    readingTime: number;
    order: number;
    publishedAt: string | null;
    updatedAt: string;
}

export interface IArticleEdit extends IArticleRow {
    body: string;
    tags: string[];
    coverImage: string | null;
    seo: ISeoMetadata | null;
}
