'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import type { ObjectId } from 'mongodb';
import { error, handleError, success, updatedNow } from '../../utils/helper';
import { getAdminId } from '../shared';
import { parseCommentObjectId, revalidateCommentMutationPaths, syncParentReplyCounts } from './shared';

interface IRejectCommentLean {
    approved?: boolean;
    parentId?: ObjectId | null;
    contentId: ObjectId;
}

// ========================================================
// Mutation: Reject Comment
// ========================================================

export const rejectComment = async (commentId: string): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const commentObjectId = parseCommentObjectId(commentId);
        if (!commentObjectId) return error('Invalid comment id', 400);

        await connectDB();

        const comment = await Comment.findById(commentObjectId)
            .select('approved parentId contentId')
            .lean<IRejectCommentLean | null>();

        if (!comment) return error('Comment not found', 404);
        if (!comment.approved) return success(true, 'Comment already pending');

        await Comment.updateOne(
            { _id: commentObjectId },
            { $set: { approved: false, ...updatedNow() } }
        );

        if (comment.parentId) {
            await syncParentReplyCounts([comment.parentId]);
        }

        await revalidateCommentMutationPaths([comment.contentId]);
        return success(true, 'Comment moved to pending moderation');
    } catch (err) {
        return handleError(err, 'Failed to reject comment');
    }
};

/*
API Responses:
- 200: Comment moved to pending moderation (or already pending).
- 400: Invalid comment id.
- 401: Admin authentication required.
- 404: Comment not found.
- 500: Unexpected server/database error.
*/