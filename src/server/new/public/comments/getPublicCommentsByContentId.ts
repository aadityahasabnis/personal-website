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

        // Fetch top-level comments (parentId is null)
        const baseMatch = {
            contentId,
            parentId: null,
            approved: true,
        };

        const [topLevelComments, total] = await Promise.all([
            Comment.find(baseMatch)
                .sort({ createdAt: -1, _id: -1 })
                .skip(offset)
                .limit(limit)
                .select('_id contentId parentId author content upvotes replyCount createdAt')
                .lean<ICommentLean[]>(),
            Comment.countDocuments(baseMatch),
        ]);

        const rowNodes = topLevelComments.map(mapComment);
        const topLevelIds = topLevelComments.map((row) => row._id);

        if (topLevelIds.length > 0) {
            // Fetch ALL nested replies for this content (both level 1 and level 2)
            const allReplies = await Comment.find({
                contentId,
                parentId: { $ne: null },
                approved: true,
            })
                .sort({ createdAt: 1, _id: 1 })
                .select('_id contentId parentId author content upvotes replyCount createdAt')
                .lean<ICommentLean[]>();

            // Build a map of parentId -> replies
            const repliesByParent = new Map<string, IPublicCommentNode[]>();
            for (const reply of allReplies) {
                if (!reply.parentId) continue;
                const key = reply.parentId.toString();
                const list = repliesByParent.get(key) ?? [];
                list.push(mapComment(reply));
                repliesByParent.set(key, list);
            }

            // Recursive function to attach replies
            const attachReplies = (node: IPublicCommentNode, depth: number): void => {
                if (depth >= 2) return; // Max 2 levels of nesting
                const replies = repliesByParent.get(node.id) ?? [];
                node.replies = replies;
                for (const reply of replies) {
                    attachReplies(reply, depth + 1);
                }
            };

            // Attach replies to top-level comments
            for (const row of rowNodes) {
                attachReplies(row, 0);
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
- 200: Comment list returned with paginated top-level rows and nested replies (up to 2 levels deep).
- 400: Invalid content id.
- 404: Published content not found.
- 500: Unexpected server/database error.
*/
