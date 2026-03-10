import { type ContentType } from '@/constants/schemaConstants';
import { type ObjectId } from 'mongodb';

// ============================================================
// Exports
// ============================================================

export * from './admin';
export * from './base';
export * from './comment';
export * from './contact';
export * from './content';
export * from './pageStats';
export * from './subscriber';
export * from './subtopic';
export * from './topic';

// ============================================================
// Utility Types
// ============================================================

export type Serialized<T> =
    T extends ObjectId ? string :
    T extends Date ? string :
    T extends (infer U)[] ? Serialized<U>[] :
    T extends Record<string, unknown> ? { [K in keyof T]: Serialized<T[K]> } :
    T;

export type ContentByType<T extends ContentType> = 
    T extends 'article' ? import('./content').IArticle :
    T extends 'blog' ? import('./content').IBlog :
    T extends 'project' ? import('./content').IProject :
    never;

export type CreateInput<T extends import('./base').IDocument & import('./base').ITimestamps> = Omit<T, '_id' | 'createdAt' | 'updatedAt'>;

export type UpdateInput<T extends import('./base').IDocument & import('./base').ITimestamps> = Partial<Omit<T, '_id' | 'createdAt' | 'updatedAt'>>;

export type PublicContent<T extends import('./content').IContent> = Omit<T, 'html'> & { _id: string };

export type ContentWithEngagement<T extends import('./content').IContent> = T & {
    stats: {
        views: number;
        likes: number;
        lastViewedAt: Date | null;
    };
    comments: {
        total: number;
        approved: number;
        items: import('./comment').IComment[];
    };
};

export type CommentWithReplies = import('./comment').IComment & {
    replies: import('./comment').IComment[];
};
