import type { ITableQueryParams } from '../shared';

// ========================================================
// Subtopic Types
// ========================================================

export interface ISubtopicCreateInput {
    topicId: string;
    slug: string;
    title: string;
    description?: string | null;
    order?: number;
}

export interface ISubtopicUpdateInput extends Partial<ISubtopicCreateInput> {
    published?: boolean;
}

export interface ISubtopicTableQuery extends ITableQueryParams {
    topicId?: string;
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
