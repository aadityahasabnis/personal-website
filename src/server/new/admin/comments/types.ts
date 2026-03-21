import type { ContentType, PublishStatusType } from '@/constants/schemaConstants';
import type { ITableQueryParams } from '../shared';

// ========================================================
// Admin Comments Types
// ========================================================

export type AdminCommentFilter = 'all' | 'approved' | 'pending' | 'owner' | 'top-level' | 'replies';
export type AdminCommentGroupBy = 'none' | 'content' | 'status' | 'thread';

export interface IAdminCommentsTableQuery extends ITableQueryParams {
    filter?: AdminCommentFilter;
    contentId?: string;
    contentType?: ContentType;
    parentId?: string;
    groupBy?: AdminCommentGroupBy;
}

export interface IAdminCommentAuthor {
    name: string;
    email: string;
    avatar: string | null;
    website: string | null;
    isOwner: boolean;
}

export interface IAdminCommentRow {
    id: string;
    contentId: string;
    parentId: string | null;
    author: IAdminCommentAuthor;
    body: string;
    bodyPreview: string;
    upvotes: number;
    approved: boolean;
    moderationStatus: 'approved' | 'pending';
    replyCount: number;
    hasReplies: boolean;
    depth: number;
    isReply: boolean;
    threadRootId: string;
    groupKey: string;
    contentType: ContentType | null;
    contentSlug: string | null;
    contentTitle: string | null;
    contentPublishStatus: PublishStatusType | null;
    topicId: string | null;
    topicSlug: string | null;
    topicTitle: string | null;
    parentAuthorName: string | null;
    parentPreview: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IAdminCommentStatsTopContent {
    contentId: string;
    contentType: ContentType | null;
    contentSlug: string | null;
    contentTitle: string | null;
    total: number;
    pending: number;
    ownerReplies: number;
    lastCommentAt: string | null;
}

export interface IAdminCommentStats {
    total: number;
    approved: number;
    pending: number;
    topLevel: number;
    replies: number;
    ownerReplies: number;
    byContentType: Record<ContentType, number>;
    topContent: IAdminCommentStatsTopContent[];
}

export interface IAdminReplyInput {
    commentId: string;
    content: string;
}