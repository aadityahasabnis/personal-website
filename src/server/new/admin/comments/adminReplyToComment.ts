'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import type { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import {
    parseCommentObjectId,
    resolveAdminReplyAuthor,
    revalidateCommentMutationPaths,
    validateReplyContent,
} from './shared';
import type { IAdminReplyInput } from './types';

interface IReplyTargetLean {
    _id: ObjectId;
    contentId: ObjectId;
}

// ========================================================
// Mutation: Admin Reply To Comment
// ========================================================

export const adminReplyToComment = async (
    input: IAdminReplyInput,
): Promise<IApiResponse<string>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const commentObjectId = parseCommentObjectId(input.commentId);
        if (!commentObjectId) return error('Invalid comment id', 400);

        const replyContent = validateReplyContent(input.content);
        if (!replyContent) {
            return error('Reply content must be between 2 and 2000 characters', 400);
        }

        await connectDB();

        const parentComment = await Comment.findById(commentObjectId)
            .select('_id contentId')
            .lean<IReplyTargetLean | null>();
        if (!parentComment) return error('Comment not found', 404);

        const created = await Comment.create({
            contentId: parentComment.contentId,
            parentId: parentComment._id,
            author: resolveAdminReplyAuthor(),
            content: replyContent,
            approved: true,
            ipHash: null,
        });

        await revalidateCommentMutationPaths([parentComment.contentId]);
        return success(created._id.toString(), 'Reply posted successfully');
    } catch (err) {
        return handleError(err, 'Failed to reply to comment');
    }
};

/*
API Responses:
- 200: Admin reply created and reply id returned.
- 400: Invalid comment id or invalid reply content length.
- 401: Admin authentication required.
- 404: Target comment not found.
- 500: Unexpected server/database error.
*/