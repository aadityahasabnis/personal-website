'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import type { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import { getCommentTreeIds, parseCommentObjectId, revalidateCommentMutationPaths, syncParentReplyCounts } from './shared';

interface IDeleteCommentLean {
    _id: ObjectId;
    parentId?: ObjectId | null;
    contentId: ObjectId;
}

// ========================================================
// Mutation: Delete Comment Tree
// ========================================================

export const deleteComment = async (commentId: string): Promise<IApiResponse<number>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const commentObjectId = parseCommentObjectId(commentId);
        if (!commentObjectId) return error('Invalid comment id', 400);

        await connectDB();

        const root = await Comment.findById(commentObjectId)
            .select('_id parentId contentId')
            .lean<IDeleteCommentLean | null>();
        if (!root) return error('Comment not found', 404);

        const treeIds = await getCommentTreeIds(root._id);
        const result = await Comment.deleteMany({ _id: { $in: treeIds } });

        if (root.parentId) {
            await syncParentReplyCounts([root.parentId]);
        }

        await revalidateCommentMutationPaths([root.contentId]);

        return success(result.deletedCount, `Deleted ${String(result.deletedCount)} comments`);
    } catch (err) {
        return handleError(err, 'Failed to delete comment');
    }
};

/*
API Responses:
- 200: Comment tree deleted and deleted count returned.
- 400: Invalid comment id.
- 401: Admin authentication required.
- 404: Comment not found.
- 500: Unexpected server/database error.
*/