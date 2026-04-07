'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import { headers } from 'next/headers';
import { error, handleError, success } from '../../utils/helper';
import { buildClientFingerprint, consumePublicRateLimit } from '../shared';
import {
    ensurePublishedContent,
    mapComment,
    parseCommentContentObjectId,
    parseCommentObjectId,
    type ICommentLean,
} from './shared';
import type { IPublicCommentNode } from './types';

const COMMENT_UPVOTE_WINDOW_MS = 24 * 60 * 60 * 1000;
const COMMENT_UPVOTE_MAX_PER_WINDOW = 1;

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

        let clientFingerprint: string | null = null;
        try {
            const requestHeaders = await headers();
            const clientIp = requestHeaders.get('x-forwarded-for')
                ?? requestHeaders.get('x-real-ip')
                ?? requestHeaders.get('cf-connecting-ip');
            const userAgent = requestHeaders.get('user-agent');
            clientFingerprint = buildClientFingerprint(clientIp, userAgent);
        } catch {
            clientFingerprint = null;
        }

        if (clientFingerprint) {
            const limiter = await consumePublicRateLimit({
                scope: `public:comment:upvote:${contentId}:${commentId}`,
                key: clientFingerprint,
                limit: COMMENT_UPVOTE_MAX_PER_WINDOW,
                windowMs: COMMENT_UPVOTE_WINDOW_MS,
            });

            if (!limiter.allowed) {
                const current = await Comment.findOne({
                    _id: commentObjectId,
                    contentId: contentObjectId,
                    approved: true,
                })
                    .select('_id contentId parentId author content upvotes replyCount createdAt')
                    .lean<ICommentLean | null>();

                if (!current) return error('Approved comment not found', 404);
                return success(mapComment(current), 'Upvote already counted recently');
            }
        }

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
