import type { ITopic } from '@/interfaces/schema';
import type { ISeoMetadata } from '@/interfaces/schema/content';
import type { ITableQueryParams } from '../shared';

// ========================================================
// Topic Types
// ========================================================

export interface ITopicSeoInput {
    title?: string | null;
    description?: string | null;
    keywords?: string[];
    ogImage?: string | null;
    canonicalUrl?: string | null;
    noIndex?: boolean;
}

export interface ITopicCreateInput {
    slug: string;
    title: string;
    description: string;
    coverImage?: string | null;
    order?: number;
    tags?: string[];
    seo?: ITopicSeoInput | null;
}

export type ITopicUpdateInput = Partial<ITopicCreateInput>;

export interface ITopicTableQuery extends ITableQueryParams {
    published?: boolean;
    featured?: boolean;
}

export interface ITopicRow {
    id: string;
    slug: string;
    title: string;
    description: string;
    coverImage: string | null;
    order: number;
    published: boolean;
    featured: boolean;
    subTopicCount: number;
    contentCount: number;
    tags: string[];
    seo: ISeoMetadata | null;
    createdAt: string;
    updatedAt: string;
}

export interface ITopicEdit extends Omit<ITopicRow, 'id'> {
    _id: string;
}

export type ITopicDocumentInput = Omit<ITopic, '_id'>;
