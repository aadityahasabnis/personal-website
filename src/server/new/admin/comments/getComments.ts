'use server';

import { CONTENT_TYPES, type ContentType } from '@/constants/schemaConstants';
import type { IPaginatedResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import Content from '@/server/models/Content';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, normalizePagination, paginated } from '../../utils/helper';
import { getAdminId } from '../shared';
import {
    buildCommentMatch,
    buildCommentSort,
    isContentType,
    mapAdminCommentRow,
    parseCommentObjectId,
    resolveCommentContentTypeMatch,
    type IAdminCommentAncestryNode,
    type IAdminCommentContentLean,
    type IAdminCommentLean,
    type IAdminCommentParentLean,
    type IAdminCommentTopicLean,
} from './shared';
import type { IAdminCommentRow, IAdminCommentsTableQuery } from './types';

const uniqueObjectIds = (ids: ObjectId[]): ObjectId[] => {
    const map = new Map<string, ObjectId>();
    for (const id of ids) {
        map.set(id.toString(), id);
    }
    return [...map.values()];
};

const toParentId = (parentId?: ObjectId | null): string | null => {
    if (!parentId) return null;
    return parentId.toString();
};

const addAncestryNode = (
    map: Map<string, IAdminCommentAncestryNode>,
    id: ObjectId,
    parentId?: ObjectId | null,
): void => {
    map.set(id.toString(), {
        id: id.toString(),
        parentId: toParentId(parentId),
    });
};

const resolveContentType = (value?: string): ContentType | null => {
    if (!value) return null;
    return isContentType(value) ? value : null;
};

// ========================================================
// Query: Admin Comments Table
// ========================================================

export const getComments = async (
    params: IAdminCommentsTableQuery = {},
): Promise<IPaginatedResponse<IAdminCommentRow>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        const contentId = typeof params.contentId === 'string'
            ? parseCommentObjectId(params.contentId)
            : null;
        if (typeof params.contentId === 'string' && !contentId) {
            return error('Invalid content id', 400) as IPaginatedResponse<IAdminCommentRow>;
        }

        const parentId = typeof params.parentId === 'string'
            ? parseCommentObjectId(params.parentId)
            : null;
        if (typeof params.parentId === 'string' && !parentId) {
            return error('Invalid parent comment id', 400) as IPaginatedResponse<IAdminCommentRow>;
        }

        const contentType = resolveContentType(params.contentType);
        if (typeof params.contentType === 'string' && !contentType) {
            return error('Invalid content type', 400) as IPaginatedResponse<IAdminCommentRow>;
        }

        await connectDB();

        const { offset, limit } = normalizePagination(params.pagination);

        const match = buildCommentMatch({
            filter: params.filter ?? 'all',
            query: params.query,
            contentId: contentId ?? undefined,
            parentId: parentId ?? undefined,
        });

        if (contentType) {
            const contentIds = await resolveCommentContentTypeMatch(contentType);
            if (!contentIds.length) return paginated([], 0, offset, limit);
            match.contentId = { $in: contentIds };
        }

        const sort = buildCommentSort(params.sort);

        const [rows, total] = await Promise.all([
            Comment.find(match)
                .select('_id contentId parentId author content upvotes approved replyCount createdAt updatedAt')
                .sort(sort)
                .skip(offset)
                .limit(limit)
                .lean<IAdminCommentLean[]>(),
            Comment.countDocuments(match),
        ]);

        if (!rows.length) return paginated([], total, offset, limit);

        const contentIds = uniqueObjectIds(rows.map((row) => row.contentId));
        const parentIds = uniqueObjectIds(
            rows
                .map((row) => row.parentId)
                .filter((id): id is ObjectId => Boolean(id))
        );

        const [contentRows, directParentRows] = await Promise.all([
            contentIds.length
                ? Content.find({ _id: { $in: contentIds } })
                    .select('_id type slug title publishStatus topicId')
                    .lean<IAdminCommentContentLean[]>()
                : Promise.resolve([] as IAdminCommentContentLean[]),
            parentIds.length
                ? Comment.find({ _id: { $in: parentIds } })
                    .select('_id parentId author content approved')
                    .lean<IAdminCommentParentLean[]>()
                : Promise.resolve([] as IAdminCommentParentLean[]),
        ]);

        const topicIds = uniqueObjectIds(
            contentRows
                .filter((content) => content.type === CONTENT_TYPES.ARTICLE && content.topicId)
                .map((content) => content.topicId as ObjectId)
        );

        const topicRows = topicIds.length
            ? await Topic.find({ _id: { $in: topicIds } })
                .select('_id slug title')
                .lean<IAdminCommentTopicLean[]>()
            : [];

        const contentMap = new Map<string, IAdminCommentContentLean>(
            contentRows.map((row) => [row._id.toString(), row])
        );
        const topicMap = new Map<string, IAdminCommentTopicLean>(
            topicRows.map((row) => [row._id.toString(), row])
        );
        const parentMap = new Map<string, IAdminCommentParentLean>(
            directParentRows.map((row) => [row._id.toString(), row])
        );

        const ancestryMap = new Map<string, IAdminCommentAncestryNode>();
        for (const row of rows) {
            addAncestryNode(ancestryMap, row._id, row.parentId);
        }
        for (const parent of directParentRows) {
            addAncestryNode(ancestryMap, parent._id, parent.parentId);
        }

        const pendingAncestors = new Set<string>();
        for (const node of ancestryMap.values()) {
            if (node.parentId && !ancestryMap.has(node.parentId)) {
                pendingAncestors.add(node.parentId);
            }
        }

        while (pendingAncestors.size) {
            const unresolved = [...pendingAncestors].filter((id) => !ancestryMap.has(id));
            pendingAncestors.clear();
            if (!unresolved.length) break;

            const ancestorIds = unresolved.map((id) => new ObjectId(id));
            const ancestorRows = await Comment.find({ _id: { $in: ancestorIds } })
                .select('_id parentId')
                .lean<Array<{ _id: ObjectId; parentId?: ObjectId | null }>>();

            for (const ancestor of ancestorRows) {
                addAncestryNode(ancestryMap, ancestor._id, ancestor.parentId);
            }

            for (const ancestor of ancestorRows) {
                const parentKey = toParentId(ancestor.parentId);
                if (parentKey && !ancestryMap.has(parentKey)) {
                    pendingAncestors.add(parentKey);
                }
            }
        }

        const mappedRows = rows.map((row) =>
            mapAdminCommentRow(row, {
                contentMap,
                topicMap,
                parentMap,
                ancestryMap,
                groupBy: params.groupBy ?? 'none',
            })
        );

        return paginated(mappedRows, total, offset, limit);
    } catch (err) {
        return handleError(err, 'Failed to fetch comments') as IPaginatedResponse<IAdminCommentRow>;
    }
};

/*
API Responses:
- 200: Comments list returned with pagination and grouping metadata.
- 400: Invalid content id, parent id, or content type filter.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/