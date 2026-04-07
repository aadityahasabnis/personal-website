'use server';

import { type ContentType } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import { handleError, success } from '../../utils/helper';
import { getAdminId } from '../shared';
import type { IAdminCommentStats, IAdminCommentStatsTopContent } from './types';

interface ITopContentAggregateRow {
    contentId: string;
    contentType: ContentType | null;
    contentSlug: string | null;
    contentTitle: string | null;
    total: number;
    pending: number;
    ownerReplies: number;
    lastCommentAt: Date | null;
}

interface IContentTypeAggregateRow {
    _id: ContentType;
    count: number;
}

// ========================================================
// Query: Comment Stats
// ========================================================

export const getCommentStats = async (): Promise<IApiResponse<IAdminCommentStats>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        await connectDB();

        const [total, approved, pending, topLevel, replies, ownerReplies, byContentTypeRows, topContentRows] = await Promise.all([
            Comment.countDocuments({}),
            Comment.countDocuments({ approved: true }),
            Comment.countDocuments({ approved: false }),
            Comment.countDocuments({ parentId: null }),
            Comment.countDocuments({ parentId: { $ne: null } }),
            Comment.countDocuments({ 'author.isOwner': true }),
            Comment.aggregate<IContentTypeAggregateRow>([
                {
                    $lookup: {
                        from: 'content',
                        localField: 'contentId',
                        foreignField: '_id',
                        as: 'content',
                        pipeline: [{ $project: { _id: 1, type: 1 } }],
                    },
                },
                { $unwind: '$content' },
                {
                    $group: {
                        _id: '$content.type',
                        count: { $sum: 1 },
                    },
                },
            ]),
            Comment.aggregate<ITopContentAggregateRow>([
                {
                    $group: {
                        _id: '$contentId',
                        total: { $sum: 1 },
                        pending: {
                            $sum: {
                                $cond: [{ $eq: ['$approved', false] }, 1, 0],
                            },
                        },
                        ownerReplies: {
                            $sum: {
                                $cond: [{ $eq: ['$author.isOwner', true] }, 1, 0],
                            },
                        },
                        lastCommentAt: { $max: '$createdAt' },
                    },
                },
                { $sort: { pending: -1, total: -1, lastCommentAt: -1 } },
                { $limit: 8 },
                {
                    $lookup: {
                        from: 'content',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'content',
                        pipeline: [{ $project: { _id: 1, type: 1, slug: 1, title: 1 } }],
                    },
                },
                { $unwind: { path: '$content', preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 0,
                        contentId: { $toString: '$_id' },
                        contentType: { $ifNull: ['$content.type', null] },
                        contentSlug: { $ifNull: ['$content.slug', null] },
                        contentTitle: { $ifNull: ['$content.title', null] },
                        total: 1,
                        pending: 1,
                        ownerReplies: 1,
                        lastCommentAt: 1,
                    },
                },
            ]),
        ]);

        const byContentType: Record<ContentType, number> = {
            article: 0,
            blog: 0,
            project: 0,
        };

        for (const row of byContentTypeRows) {
            byContentType[row._id] = row.count;
        }

        const topContent: IAdminCommentStatsTopContent[] = topContentRows.map((row) => ({
            contentId: row.contentId,
            contentType: row.contentType,
            contentSlug: row.contentSlug,
            contentTitle: row.contentTitle,
            total: row.total,
            pending: row.pending,
            ownerReplies: row.ownerReplies,
            lastCommentAt: row.lastCommentAt ? row.lastCommentAt.toISOString() : null,
        }));

        return success({
            total,
            approved,
            pending,
            topLevel,
            replies,
            ownerReplies,
            byContentType,
            topContent,
        });
    } catch (err) {
        return handleError(err, 'Failed to fetch comment stats');
    }
};

/*
API Responses:
- 200: Comment moderation stats returned.
- 401: Admin authentication required.
- 500: Unexpected server/database error.
*/