'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import type { ObjectId } from 'mongodb';
import { error, handleError, success, updatedNow } from '../../utils/helper';
import { getAdminId } from '../shared';
import { parseCommentObjectId, revalidateCommentMutationPaths, syncParentReplyCounts } from './shared';

interface IApproveCommentLean {
    approved?: boolean;
    parentId?: ObjectId | null;
    contentId: ObjectId;
}

// ========================================================
// Mutation: Approve Comment
// ========================================================

export const approveComment = async (commentId: string): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const commentObjectId = parseCommentObjectId(commentId);
        if (!commentObjectId) return error('Invalid comment id', 400);

        await connectDB();

        const comment = await Comment.findById(commentObjectId)
            .select('_id approved parentId contentId')
            .lean<IApproveCommentLean | null>();

        if (!comment) return error('Comment not found', 404);
        if (comment.approved) return success(true, 'Comment already approved');

        await Comment.updateOne(
            { _id: commentObjectId },
            { $set: { approved: true, ...updatedNow() } }
        );

        if (comment.parentId) {
            await syncParentReplyCounts([comment.parentId]);
        }

        await revalidateCommentMutationPaths([comment.contentId]);
        return success(true, 'Comment approved');
    } catch (err) {
        return handleError(err, 'Failed to approve comment');
    }
};

/*
API Responses:
- 200: Comment approved (or already approved).
- 400: Invalid comment id.
- 401: Admin authentication required.
- 404: Comment not found.
- 500: Unexpected server/database error.
*/