import { PUBLISH_STATUS, SCHEMA_LIMITS } from '@/constants/schemaConstants';
import Comment from '@/server/models/Comment';
import Content from '@/server/models/Content';
import { createHash } from 'crypto';
import { ObjectId } from 'mongodb';
import { parsePublicContentObjectId } from '../content/shared';
import { toObjectIdOrNull } from '../shared';
import type { IPublicCommentNode } from './types';

export interface ICommentLean {
    _id: ObjectId;
    contentId: ObjectId;
    parentId?: ObjectId | null;
    author: {
        name: string;
        avatar?: string | null;
        isOwner?: boolean;
    };
    content: string;
    upvotes?: number;
    replyCount?: number;
    createdAt: Date;
}

export const sanitizeAuthorName = (name: string): string =>
    name.trim().slice(0, SCHEMA_LIMITS.AUTHOR_NAME_MAX_LENGTH);

export const normalizeOptionalString = (value: string | null | undefined): string | null => {
    if (!value) return null;
    const normalized = value.trim();
    return normalized.length ? normalized : null;
};

export const hashIp = (ipAddress: string): string => createHash('sha256').update(ipAddress).digest('hex');

export const parseCommentContentObjectId = (contentId: string): ObjectId | null => {
    return parsePublicContentObjectId(contentId);
};

export const parseCommentObjectId = (commentId: string): ObjectId | null => {
    return toObjectIdOrNull(commentId);
};

export const mapComment = (row: ICommentLean): IPublicCommentNode => ({
    id: row._id.toString(),
    contentId: row.contentId.toString(),
    parentId: row.parentId ? row.parentId.toString() : null,
    author: {
        name: row.author.name,
        avatar: row.author.avatar ?? null,
        isOwner: Boolean(row.author.isOwner),
    },
    content: row.content,
    upvotes: row.upvotes ?? 0,
    replyCount: row.replyCount ?? 0,
    createdAt: row.createdAt.toISOString(),
    replies: [],
});

export const ensurePublishedContent = async (contentId: ObjectId): Promise<boolean> => {
    const row = await Content.findOne({
        _id: contentId,
        publishStatus: PUBLISH_STATUS.PUBLISHED,
    })
        .select('_id')
        .lean<{ _id: ObjectId } | null>();

    return Boolean(row);
};

export const findParentCommentById = async (parentId: ObjectId, contentId: ObjectId) => {
    return Comment.findOne({
        _id: parentId,
        contentId,
        approved: true,
    })
        .select('_id')
        .lean<{ _id: ObjectId } | null>();
};
