'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import {
    getCommentTreeIds,
    parseCommentIds,
    revalidateCommentMutationPaths,
    syncParentReplyCounts,
} from './shared';

interface IBulkDeleteRootLean {
    _id: ObjectId;
    parentId?: ObjectId | null;
    contentId: ObjectId;
}

const uniqueObjectIds = (ids: ObjectId[]): ObjectId[] => {
    const map = new Map<string, ObjectId>();
    for (const id of ids) {
        map.set(id.toString(), id);
    }
    return [...map.values()];
};

// ========================================================
// Mutation: Bulk Delete Comments
// ========================================================

export const bulkDeleteComments = async (
    commentIds: string[],
): Promise<IApiResponse<number>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!commentIds.length) return success(0, 'No comments selected');

        const normalizedIds = parseCommentIds(commentIds);
        if (!normalizedIds?.length) return error('One or more comment ids are invalid', 400);

        await connectDB();

        const rootIds = normalizedIds.map((id) => new ObjectId(id));
        const roots = await Comment.find({ _id: { $in: rootIds } })
            .select('_id parentId contentId')
            .lean<IBulkDeleteRootLean[]>();

        if (!roots.length) return success(0, 'No matching comments found');

        const treeGroups = await Promise.all(roots.map((root) => getCommentTreeIds(root._id)));
        const allTreeIds = uniqueObjectIds(treeGroups.flat());
        const result = await Comment.deleteMany({ _id: { $in: allTreeIds } });

        const parentIds = roots
            .map((root) => root.parentId)
            .filter((id): id is ObjectId => Boolean(id));
        if (parentIds.length) {
            await syncParentReplyCounts(parentIds);
        }

        await revalidateCommentMutationPaths(roots.map((root) => root.contentId));

        return success(result.deletedCount, `Deleted ${String(result.deletedCount)} comments`);
    } catch (err) {
        return handleError(err, 'Failed to bulk delete comments');
    }
};

/*
API Responses:
- 200: Bulk delete completed and deleted count returned.
- 400: One or more comment ids are invalid.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/