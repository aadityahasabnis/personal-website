import type { ITopic } from '@/interfaces/schema';
import type { ITableQueryParams } from '../shared';

// ========================================================
// Topic Types
// ========================================================

export interface ITopicCreateInput {
    slug: string;
    title: string;
    description: string;
    coverImage?: string | null;
    order?: number;
    published?: boolean;
    featured?: boolean;
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
    contentCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ITopicEdit extends Omit<ITopicRow, 'id'> {
    _id: string;
}

export type ITopicDocumentInput = Omit<ITopic, '_id'>;
