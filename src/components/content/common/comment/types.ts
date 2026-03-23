import type { ICreateCommentInput, IPublicCommentListResult, IPublicCommentNode } from '@/server/new/public/comments/types';

export type IContentCommentType = 'articles' | 'blogs' | 'projects';

export interface IContentCommentProps {
    contentType: IContentCommentType;
    contentId: string;
    className?: string;
}

export type ICreateCommentPayload = Omit<ICreateCommentInput, 'contentId' | 'ipAddress'>;

export interface IListCommentsInput {
    contentType: IContentCommentType;
    contentId: string;
    offset?: number;
    limit?: number;
}

export interface ICreateCommentRequest {
    contentType: IContentCommentType;
    contentId: string;
    payload: ICreateCommentPayload;
}

export interface IUpvoteCommentInput {
    contentType: IContentCommentType;
    contentId: string;
    commentId: string;
}

export type ICommentsListResult = IPublicCommentListResult;
export type ICommentNode = IPublicCommentNode;
