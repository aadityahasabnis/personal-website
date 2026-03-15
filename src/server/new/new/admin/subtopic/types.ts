import type { ITableQueryParams } from '../shared';

// ========================================================
// Subtopic Types
// ========================================================

export interface ISubtopicCreateInput {
    topicSlug: string;
    slug: string;
    title: string;
    description?: string | null;
    order?: number;
    published?: boolean;
}

export type ISubtopicUpdateInput = Partial<ISubtopicCreateInput>;

export interface ISubtopicTableQuery extends ITableQueryParams {
    topicSlug?: string;
    published?: boolean;
}

export interface ISubtopicRow {
    id: string;
    topicId: string;
    topicSlug: string;
    topicTitle: string;
    slug: string;
    title: string;
    description: string | null;
    order: number;
    published: boolean;
    contentCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ISubtopicEdit extends Omit<ISubtopicRow, 'id' | 'topicTitle'> {
    _id: string;
}
