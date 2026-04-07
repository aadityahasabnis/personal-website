import { type ObjectId } from 'mongodb';
import type { IDocument, ITimestamps } from './base';

// ============================================================
// Comment Author (Embedded)
// ============================================================

export interface ICommentAuthor {
    name: string;
    email: string;
    avatar: string | null;
    isOwner: boolean; // Site owner flag
}

// ============================================================
// Comment Interface
// ============================================================

export interface IComment extends IDocument, ITimestamps {
    contentId: ObjectId; // References Content._id
    parentId: ObjectId | null; // null = top-level, ObjectId = reply
    author: ICommentAuthor;
    content: string;
    upvotes: number;
    approved: boolean;
    replyCount: number; // Denormalized count
    ipHash: string | null;
}
