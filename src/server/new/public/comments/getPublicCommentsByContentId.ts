'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import { error, handleError, normalizePagination, success } from '../../utils/helper';
import {
    ensurePublishedContent,
    mapComment,
    parseCommentContentObjectId,
    type ICommentLean,
} from './shared';
import type { ICommentQuery, IPublicCommentListResult, IPublicCommentNode } from './types';

// ========================================================
// Query: Public Comments By Content Id
// ========================================================

export const getPublicCommentsByContentId = async (
    params: ICommentQuery,
): Promise<IApiResponse<IPublicCommentListResult>> => {
    try {
        const contentId = parseCommentContentObjectId(params.contentId);
        if (!contentId) return error('Invalid content id', 400);

        await connectDB();

        const canRead = await ensurePublishedContent(contentId);
        if (!canRead) return error('Published content not found', 404);

        const { offset, limit } = normalizePagination(params.pagination);
        const approvedOnly = true;

        const baseMatch: Record<string, unknown> = {
            contentId,
            parentId: null,
            ...(approvedOnly ? { approved: true } : {}),
        };

        const [rows, total] = await Promise.all([
            Comment.find(baseMatch)
                .sort({ createdAt: -1, _id: -1 })
                .skip(offset)
                .limit(limit)
                .select('_id contentId parentId author content upvotes replyCount createdAt')
                .lean<ICommentLean[]>(),
            Comment.countDocuments(baseMatch),
        ]);

        const rowNodes = rows.map(mapComment);
        const parentIds = rows.map((row) => row._id);

        if (parentIds.length) {
            const replyRows = await Comment.find({
                contentId,
                parentId: { $in: parentIds },
                ...(approvedOnly ? { approved: true } : {}),
            })
                .sort({ createdAt: 1, _id: 1 })
                .select('_id contentId parentId author content upvotes replyCount createdAt')
                .lean<ICommentLean[]>();

            const replyByParent = new Map<string, IPublicCommentNode[]>();
            for (const reply of replyRows) {
                if (!reply.parentId) continue;
                const key = reply.parentId.toString();
                const list = replyByParent.get(key) ?? [];
                list.push(mapComment(reply));
                replyByParent.set(key, list);
            }

            for (const row of rowNodes) {
                row.replies = replyByParent.get(row.id) ?? [];
            }
        }

        return success({
            rows: rowNodes,
            total,
            offset,
            limit,
            hasMore: offset + rowNodes.length < total,
        });
    } catch (err) {
        return handleError(err, 'Failed to fetch comments');
    }
};

/*
API Responses:
- 200: Comment list returned with paginated top-level rows and nested replies.
- 400: Invalid content id.
- 404: Published content not found.
- 500: Unexpected server/database error.
*/
