// =================================================
// Server action shared types
// =================================================

export interface ActionResponse<T = void> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ActionResponse<T[]> {
    metadata: { total: number; limit: number; offset: number; hasMore: boolean };
}

export type ActivityAction = 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'login' | 'export' | 'reorder';
export type ActivityEntity = 'article' | 'note' | 'project' | 'topic' | 'subtopic' | 'comment' | 'subscriber' | 'media' | 'settings' | 'message';
