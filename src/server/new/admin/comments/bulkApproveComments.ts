'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import { ObjectId } from 'mongodb';
import { error, handleError, success, updatedNow } from '../../utils/helper';
import { getAdminId } from '../shared';
import { parseCommentIds, revalidateCommentMutationPaths, syncParentReplyCounts } from './shared';

interface IBulkApproveLean {
    _id: ObjectId;
    parentId?: ObjectId | null;
    contentId: ObjectId;
}

// ========================================================
// Mutation: Bulk Approve Comments
// ========================================================

export const bulkApproveComments = async (
    commentIds: string[],
): Promise<IApiResponse<number>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!commentIds.length) return success(0, 'No comments selected');

        const normalizedIds = parseCommentIds(commentIds);
        if (!normalizedIds?.length) return error('One or more comment ids are invalid', 400);

        await connectDB();

        const objectIds = normalizedIds.map((id) => new ObjectId(id));
        const toApprove = await Comment.find({ _id: { $in: objectIds }, approved: false })
            .select('_id parentId contentId')
            .lean<IBulkApproveLean[]>();

        if (!toApprove.length) return success(0, 'Selected comments are already approved');

        const updateIds = toApprove.map((row) => row._id);
        const result = await Comment.updateMany(
            { _id: { $in: updateIds } },
            { $set: { approved: true, ...updatedNow() } }
        );

        const parentIds = toApprove
            .map((row) => row.parentId)
            .filter((id): id is ObjectId => Boolean(id));
        if (parentIds.length) {
            await syncParentReplyCounts(parentIds);
        }

        await revalidateCommentMutationPaths(toApprove.map((row) => row.contentId));

        return success(result.modifiedCount, `Approved ${String(result.modifiedCount)} comments`);
    } catch (err) {
        return handleError(err, 'Failed to bulk approve comments');
    }
};

/*
API Responses:
- 200: Bulk approval completed and modified count returned.
- 400: One or more comment ids are invalid.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/