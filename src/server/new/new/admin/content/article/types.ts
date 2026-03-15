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
    topicSlug: string;
    subtopicSlug?: string | null;
    tags?: string[];
    coverImage?: string | null;
    readingTime?: number;
    order?: number;
    published?: boolean;
    featured?: boolean;
    seo?: Partial<ISeoMetadata> | null;
}

export type IArticleUpdateInput = Partial<IArticleCreateInput>;

export interface IArticleTableQuery extends ITableQueryParams {
    topicSlug?: string;
    subtopicSlug?: string;
    published?: boolean;
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
    published: boolean;
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
    scheduledAt: string | null;
    seo: ISeoMetadata | null;
}
