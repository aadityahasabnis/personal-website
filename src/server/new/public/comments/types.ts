import type { IPublicCommentListQuery } from '../shared';

export interface IPublicCommentAuthor {
    name: string;
    avatar: string | null;
    website: string | null;
    isOwner: boolean;
}

export interface IPublicCommentNode {
    id: string;
    contentId: string;
    parentId: string | null;
    author: IPublicCommentAuthor;
    content: string;
    upvotes: number;
    replyCount: number;
    createdAt: string;
    replies: IPublicCommentNode[];
}

export interface IPublicCommentListResult {
    rows: IPublicCommentNode[];
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
}

export interface ICreateCommentInput {
    contentId: string;
    parentId?: string | null;
    authorName: string;
    authorEmail: string;
    authorWebsite?: string | null;
    authorAvatar?: string | null;
    body: string;
    ipAddress?: string | null;
}

export interface ICommentQuery extends IPublicCommentListQuery {
    contentId: string;
}
