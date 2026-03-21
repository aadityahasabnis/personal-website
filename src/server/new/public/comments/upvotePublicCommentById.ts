'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import { error, handleError, success } from '../../utils/helper';
import {
    ensurePublishedContent,
    mapComment,
    parseCommentContentObjectId,
    parseCommentObjectId,
    type ICommentLean,
} from './shared';
import type { IPublicCommentNode } from './types';

// ========================================================
// Mutation: Upvote Public Comment By Id
// ========================================================

export const upvotePublicCommentById = async (
    contentId: string,
    commentId: string,
): Promise<IApiResponse<IPublicCommentNode>> => {
    try {
        const contentObjectId = parseCommentContentObjectId(contentId);
        if (!contentObjectId) return error('Invalid content id', 400);

        const commentObjectId = parseCommentObjectId(commentId);
        if (!commentObjectId) return error('Invalid comment id', 400);

        await connectDB();

        const canRead = await ensurePublishedContent(contentObjectId);
        if (!canRead) return error('Published content not found', 404);

        const updated = await Comment.findOneAndUpdate(
            {
                _id: commentObjectId,
                contentId: contentObjectId,
                approved: true,
            },
            { $inc: { upvotes: 1 } },
            { new: true }
        )
            .select('_id contentId parentId author content upvotes replyCount createdAt')
            .lean<ICommentLean | null>();

        if (!updated) return error('Approved comment not found', 404);
        return success(mapComment(updated), 'Comment upvoted');
    } catch (err) {
        return handleError(err, 'Failed to upvote comment');
    }
};

/*
API Responses:
- 200: Approved comment upvoted and updated comment returned.
- 400: Invalid content/comment id.
- 404: Published content or approved comment not found.
- 500: Unexpected server/database error.
*/
