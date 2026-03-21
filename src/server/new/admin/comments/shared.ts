import { CONTENT_TYPES, SCHEMA_LIMITS, VALIDATION_PATTERNS, type ContentType, type PublishStatusType } from '@/constants/schemaConstants';
import type { ISortParams } from '@/interfaces/actionHelper';
import Comment from '@/server/models/Comment';
import Content from '@/server/models/Content';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { buildSort, revalidateContent, updatedNow } from '../../utils/helper';
import type {
    AdminCommentFilter,
    AdminCommentGroupBy,
    IAdminCommentRow,
} from './types';

export interface IAdminCommentLean {
    _id: ObjectId;
    contentId: ObjectId;
    parentId?: ObjectId | null;
    author: {
        name: string;
        email: string;
        avatar?: string | null;
        website?: string | null;
        isOwner?: boolean;
    };
    content: string;
    upvotes?: number;
    approved?: boolean;
    replyCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAdminCommentParentLean {
    _id: ObjectId;
    parentId?: ObjectId | null;
    author: {
        name: string;
    };
    content: string;
    approved?: boolean;
}

export interface IAdminCommentAncestryNode {
    id: string;
    parentId: string | null;
}

export interface IAdminCommentContentLean {
    _id: ObjectId;
    type: ContentType;
    slug: string;
    title: string;
    publishStatus?: PublishStatusType;
    topicId?: ObjectId | null;
}

export interface IAdminCommentTopicLean {
    _id: ObjectId;
    slug: string;
    title: string;
}

interface IMapCommentRowContext {
    contentMap: Map<string, IAdminCommentContentLean>;
    topicMap: Map<string, IAdminCommentTopicLean>;
    parentMap: Map<string, IAdminCommentParentLean>;
    ancestryMap: Map<string, IAdminCommentAncestryNode>;
    groupBy: AdminCommentGroupBy;
}

const ALLOWED_COMMENT_SORT_FIELDS = new Set([
    'createdAt',
    'updatedAt',
    'upvotes',
    'replyCount',
    'approved',
    'author.name',
]);

const CONTENT_TYPE_SET = new Set<ContentType>(Object.values(CONTENT_TYPES));

const DEFAULT_ADMIN_REPLY_NAME = 'Aaditya Hasabnis';
const DEFAULT_ADMIN_REPLY_EMAIL = 'admin@aadityahasabnis.com';
const PREVIEW_MAX_LENGTH = 160;

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toParentId = (parentId?: ObjectId | null): string | null => {
    if (!parentId) return null;
    return parentId.toString();
};

const toPreview = (value: string): string => {
    const normalized = value.trim().replace(/\s+/g, ' ');
    if (normalized.length <= PREVIEW_MAX_LENGTH) return normalized;
    return `${normalized.slice(0, PREVIEW_MAX_LENGTH - 3)}...`;
};

const uniqueObjectIds = (ids: ObjectId[]): ObjectId[] => {
    const byKey = new Map<string, ObjectId>();
    for (const id of ids) {
        byKey.set(id.toString(), id);
    }
    return [...byKey.values()];
};

export const isContentType = (value: string): value is ContentType => {
    return CONTENT_TYPE_SET.has(value as ContentType);
};

export const parseCommentObjectId = (commentId: string): ObjectId | null => {
    if (!ObjectId.isValid(commentId)) return null;
    return new ObjectId(commentId);
};

export const parseCommentIds = (commentIds: string[]): string[] | null => {
    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const commentId of commentIds) {
        if (!ObjectId.isValid(commentId)) return null;
        if (seen.has(commentId)) continue;
        seen.add(commentId);
        normalized.push(commentId);
    }

    return normalized;
};

export const buildCommentMatch = (params: {
    filter: AdminCommentFilter;
    query?: string;
    contentId?: ObjectId;
    parentId?: ObjectId;
}): Record<string, unknown> => {
    const match: Record<string, unknown> = {};

    if (params.filter === 'approved') match.approved = true;
    if (params.filter === 'pending') match.approved = false;
    if (params.filter === 'owner') match['author.isOwner'] = true;
    if (params.filter === 'top-level') match.parentId = null;
    if (params.filter === 'replies') match.parentId = { $ne: null };

    if (params.contentId) match.contentId = params.contentId;
    if (params.parentId) match.parentId = params.parentId;

    if (params.query?.trim()) {
        const q = escapeRegex(params.query.trim());
        match.$or = [
            { content: { $regex: q, $options: 'i' } },
            { 'author.name': { $regex: q, $options: 'i' } },
            { 'author.email': { $regex: q, $options: 'i' } },
        ];
    }

    return match;
};

export const buildCommentSort = (sort?: ISortParams): Record<string, 1 | -1> => {
    if (!sort?.sortBy || !ALLOWED_COMMENT_SORT_FIELDS.has(sort.sortBy)) {
        return { createdAt: -1, _id: -1 };
    }

    return buildSort(sort, { createdAt: -1, _id: -1 });
};

export const resolveThreadMeta = (
    commentId: string,
    parentId: string | null,
    ancestryMap: Map<string, IAdminCommentAncestryNode>,
): { depth: number; isReply: boolean; threadRootId: string } => {
    let depth = 0;
    let threadRootId = commentId;
    let cursor = parentId;
    const seen = new Set<string>([commentId]);

    while (cursor) {
        if (seen.has(cursor)) break;
        seen.add(cursor);
        depth += 1;
        threadRootId = cursor;

        const node = ancestryMap.get(cursor);
        if (!node?.parentId) break;
        cursor = node.parentId;

        if (depth >= SCHEMA_LIMITS.COMMENT_MAX_DEPTH + 2) break;
    }

    return {
        depth,
        isReply: depth > 0,
        threadRootId,
    };
};

export const resolveGroupKey = (
    groupBy: AdminCommentGroupBy,
    row: Pick<IAdminCommentRow, 'contentId' | 'moderationStatus' | 'threadRootId' | 'id'>,
): string => {
    if (groupBy === 'content') return row.contentId;
    if (groupBy === 'status') return row.moderationStatus;
    if (groupBy === 'thread') return row.threadRootId;
    return row.id;
};

export const mapAdminCommentRow = (
    row: IAdminCommentLean,
    context: IMapCommentRowContext,
): IAdminCommentRow => {
    const id = row._id.toString();
    const contentId = row.contentId.toString();
    const parentId = toParentId(row.parentId);
    const moderationStatus = row.approved ? 'approved' : 'pending';

    const threadMeta = resolveThreadMeta(id, parentId, context.ancestryMap);
    const content = context.contentMap.get(contentId);
    const topic = content?.topicId ? context.topicMap.get(content.topicId.toString()) : undefined;
    const parent = parentId ? context.parentMap.get(parentId) : undefined;

    const mapped: IAdminCommentRow = {
        id,
        contentId,
        parentId,
        author: {
            name: row.author.name,
            email: row.author.email,
            avatar: row.author.avatar ?? null,
            website: row.author.website ?? null,
            isOwner: Boolean(row.author.isOwner),
        },
        body: row.content,
        bodyPreview: toPreview(row.content),
        upvotes: row.upvotes ?? 0,
        approved: Boolean(row.approved),
        moderationStatus,
        replyCount: row.replyCount ?? 0,
        hasReplies: (row.replyCount ?? 0) > 0,
        depth: threadMeta.depth,
        isReply: threadMeta.isReply,
        threadRootId: threadMeta.threadRootId,
        groupKey: '',
        contentType: content?.type ?? null,
        contentSlug: content?.slug ?? null,
        contentTitle: content?.title ?? null,
        contentPublishStatus: content?.publishStatus ?? null,
        topicId: content?.topicId ? content.topicId.toString() : null,
        topicSlug: topic?.slug ?? null,
        topicTitle: topic?.title ?? null,
        parentAuthorName: parent?.author.name ?? null,
        parentPreview: parent?.content ? toPreview(parent.content) : null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };

    mapped.groupKey = resolveGroupKey(context.groupBy, mapped);
    return mapped;
};

export const resolveCommentContentTypeMatch = async (
    contentType: ContentType,
): Promise<ObjectId[]> => {
    const rows = await Content.find({ type: contentType }).select('_id').lean<Array<{ _id: ObjectId }>>();
    return rows.map((row) => row._id);
};

export const syncParentReplyCounts = async (parentIds: ObjectId[]): Promise<void> => {
    const uniqueParents = uniqueObjectIds(parentIds);
    if (!uniqueParents.length) return;

    const counts = await Comment.aggregate<Array<{ _id: ObjectId; count: number }>>([
        {
            $match: {
                parentId: { $in: uniqueParents },
                approved: true,
            },
        },
        {
            $group: {
                _id: '$parentId',
                count: { $sum: 1 },
            },
        },
    ]);

    const countMap = new Map<string, number>();
    for (const row of counts) {
        countMap.set(row._id.toString(), row.count);
    }

    await Promise.all(
        uniqueParents.map((parentId) =>
            Comment.updateOne(
                { _id: parentId },
                { $set: { replyCount: countMap.get(parentId.toString()) ?? 0, ...updatedNow() } }
            )
        )
    );
};

export const getCommentTreeIds = async (rootId: ObjectId): Promise<ObjectId[]> => {
    const seen = new Set<string>();
    const queue: ObjectId[] = [rootId];

    while (queue.length) {
        const batch = queue.splice(0, 40);
        for (const id of batch) {
            seen.add(id.toString());
        }

        const children = await Comment.find({ parentId: { $in: batch } })
            .select('_id')
            .lean<Array<{ _id: ObjectId }>>();

        for (const child of children) {
            const key = child._id.toString();
            if (seen.has(key)) continue;
            queue.push(child._id);
        }
    }

    return [...seen].map((id) => new ObjectId(id));
};

export const resolveAdminReplyAuthor = (): {
    name: string;
    email: string;
    avatar: null;
    website: null;
    isOwner: true;
} => {
    const configuredName = process.env.ADMIN_COMMENT_AUTHOR_NAME?.trim();
    const configuredEmail = process.env.ADMIN_COMMENT_AUTHOR_EMAIL?.trim().toLowerCase();

    const name = configuredName && configuredName.length >= 2
        ? configuredName
        : DEFAULT_ADMIN_REPLY_NAME;
    const email = configuredEmail && VALIDATION_PATTERNS.EMAIL.test(configuredEmail)
        ? configuredEmail
        : DEFAULT_ADMIN_REPLY_EMAIL;

    return {
        name,
        email,
        avatar: null,
        website: null,
        isOwner: true,
    };
};

export const validateReplyContent = (value: string): string | null => {
    const normalized = value.trim();
    if (normalized.length < SCHEMA_LIMITS.COMMENT_MIN_LENGTH) return null;
    if (normalized.length > SCHEMA_LIMITS.COMMENT_MAX_LENGTH) return null;
    return normalized;
};

export const revalidateAdminCommentsPaths = (): void => {
    const paths = ['/admin/comments', '/admin'];
    for (const path of paths) {
        revalidatePath(path);
    }
};

export const revalidateCommentMutationPaths = async (contentIds: ObjectId[]): Promise<void> => {
    revalidateAdminCommentsPaths();

    const uniqueContentIds = uniqueObjectIds(contentIds);
    if (!uniqueContentIds.length) return;

    const contentRows = await Content.find({ _id: { $in: uniqueContentIds } })
        .select('_id type slug topicId')
        .lean<Array<Pick<IAdminCommentContentLean, '_id' | 'type' | 'slug' | 'topicId'>>>();

    const topicIds = contentRows
        .filter((row) => row.type === CONTENT_TYPES.ARTICLE && row.topicId)
        .map((row) => row.topicId as ObjectId);
    const uniqueTopicIds = uniqueObjectIds(topicIds);

    const topicRows = uniqueTopicIds.length
        ? await Topic.find({ _id: { $in: uniqueTopicIds } }).select('_id slug').lean<Array<{ _id: ObjectId; slug: string }>>()
        : [];

    const topicSlugById = new Map<string, string>(
        topicRows.map((row) => [row._id.toString(), row.slug])
    );

    for (const content of contentRows) {
        const topicSlug = content.type === CONTENT_TYPES.ARTICLE && content.topicId
            ? topicSlugById.get(content.topicId.toString())
            : undefined;
        revalidateContent(content.type, content.slug, topicSlug);
    }
};