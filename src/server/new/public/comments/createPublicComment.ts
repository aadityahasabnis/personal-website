'use server';

import { SCHEMA_LIMITS, VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../utils/helper';
import {
    ensurePublishedContent,
    findParentCommentById,
    hashIp,
    normalizeOptionalString,
    sanitizeAuthorName,
} from './shared';
import type { ICreateCommentInput, IPublicCommentNode } from './types';

// ========================================================
// Mutation: Create Public Comment
// ========================================================

export const createPublicComment = async (
    input: ICreateCommentInput,
): Promise<IApiResponse<IPublicCommentNode>> => {
    try {
        if (!ObjectId.isValid(input.contentId)) return error('Invalid content id', 400);

        if (typeof input.parentId === 'string' && !ObjectId.isValid(input.parentId)) {
            return error('Invalid parent comment id', 400);
        }

        const authorName = sanitizeAuthorName(input.authorName);
        if (!authorName || authorName.length < 2) return error('Author name must be at least 2 characters', 400);

        const authorEmail = input.authorEmail.trim().toLowerCase();
        if (!VALIDATION_PATTERNS.EMAIL.test(authorEmail)) return error('Invalid author email', 400);

        const body = input.body.trim();
        if (body.length < SCHEMA_LIMITS.COMMENT_MIN_LENGTH) return error('Comment is too short', 400);
        if (body.length > SCHEMA_LIMITS.COMMENT_MAX_LENGTH) return error('Comment is too long', 400);

        const authorWebsite = normalizeOptionalString(input.authorWebsite);
        if (authorWebsite && !VALIDATION_PATTERNS.URL.test(authorWebsite)) {
            return error('Invalid author website URL', 400);
        }

        await connectDB();

        const contentId = new ObjectId(input.contentId);
        const canRead = await ensurePublishedContent(contentId);
        if (!canRead) return error('Published content not found', 404);

        let parentId: ObjectId | null = null;
        if (typeof input.parentId === 'string') {
            parentId = new ObjectId(input.parentId);
            const parent = await findParentCommentById(parentId, contentId);
            if (!parent) return error('Parent comment not found', 404);
        }

        const created = await Comment.create({
            contentId,
            parentId,
            author: {
                name: authorName,
                email: authorEmail,
                avatar: normalizeOptionalString(input.authorAvatar),
                website: authorWebsite,
                isOwner: false,
            },
            content: body,
            approved: false,
            ipHash: input.ipAddress ? hashIp(input.ipAddress) : null,
        });

        const publicNode: IPublicCommentNode = {
            id: created._id.toString(),
            contentId: created.contentId.toString(),
            parentId: created.parentId ? created.parentId.toString() : null,
            author: {
                name: created.author.name,
                avatar: created.author.avatar ?? null,
                website: created.author.website ?? null,
                isOwner: Boolean(created.author.isOwner),
            },
            content: created.content,
            upvotes: created.upvotes,
            replyCount: created.replyCount,
            createdAt: created.createdAt.toISOString(),
            replies: [],
        };

        return success(publicNode, 'Comment submitted for moderation');
    } catch (err) {
        return handleError(err, 'Failed to submit comment');
    }
};

/*
API Responses:
- 200: Comment created and returned in pending moderation state.
- 400: Invalid payload values (content id, parent id, email, length, URL).
- 404: Published content or parent comment not found.
- 500: Unexpected server/database error.
*/
