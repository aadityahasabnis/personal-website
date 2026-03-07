'use server';

/**
 * Comments Admin Queries
 * 
 * Server queries for fetching comments data in the admin panel.
 */

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IComment } from '@/interfaces';
import type { ActionResponse, PaginatedResponse } from '../utils/types';
import { success, paginated } from '../utils/response';
import { handleError } from '../utils/errorHandler';
import type { AdminComment } from './actions';

// ===== TYPES =====

export interface GetCommentsRequest {
    limit?: number;
    offset?: number;
    filter?: 'all' | 'approved' | 'pending' | 'reported';
    articleSlug?: string;
}

export interface CommentStats {
    total: number;
    approved: number;
    pending: number;
    reported: number;
}

// ===== HELPERS =====

const getCommentsCollection = () => getCollection<IComment>(COLLECTIONS.comments);

const serializeComment = (comment: IComment): AdminComment => ({
    _id: comment._id!.toString(),
    articleSlug: comment.articleSlug,
    author: comment.author,
    content: comment.content,
    upvotes: comment.upvotes ?? 0,
    replyCount: comment.replies?.length ?? 0,
    approved: comment.approved,
    reported: comment.reported ?? false,
    createdAt: comment.createdAt.toISOString(),
});

// ===== QUERIES =====

/**
 * Get all comments with optional filtering and pagination
 */
export const getComments = async (request: GetCommentsRequest = {}): Promise<PaginatedResponse<AdminComment>> => {
    try {
        const { limit = 50, offset = 0, filter = 'all', articleSlug } = request;

        const collection = await getCommentsCollection();
        
        // Build query based on filter
        const query: Record<string, unknown> = {};
        
        if (filter === 'approved') {
            query.approved = true;
        } else if (filter === 'pending') {
            query.approved = false;
        } else if (filter === 'reported') {
            query.reported = true;
        }
        
        if (articleSlug) {
            query.articleSlug = articleSlug;
        }

        const [comments, total] = await Promise.all([
            collection.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
            collection.countDocuments(query),
        ]);

        return paginated(comments.map(serializeComment), total, limit, offset);
    } catch (err) {
        const errorResult = handleError(err, 'Failed to get comments');
        return {
            ...errorResult,
            data: [],
            metadata: { total: 0, limit: 50, offset: 0, hasMore: false },
        };
    }
};

/**
 * Get all comments (simplified version for backwards compatibility)
 */
export const getAllComments = async (): Promise<AdminComment[]> => {
    try {
        const collection = await getCommentsCollection();
        const comments = await collection.find({}).sort({ createdAt: -1 }).toArray();
        return comments.map(serializeComment);
    } catch (err) {
        console.error('Failed to get all comments:', err);
        return [];
    }
};

/**
 * Get comment statistics
 */
export const getCommentStats = async (): Promise<ActionResponse<CommentStats>> => {
    try {
        const collection = await getCommentsCollection();
        
        const [total, approved, pending, reported] = await Promise.all([
            collection.countDocuments({}),
            collection.countDocuments({ approved: true }),
            collection.countDocuments({ approved: false }),
            collection.countDocuments({ reported: true }),
        ]);

        return success({
            total,
            approved,
            pending,
            reported,
        });
    } catch (err) {
        return handleError(err, 'Failed to get comment stats');
    }
};

/**
 * Get comments by article slug
 */
export const getCommentsByArticle = async (articleSlug: string): Promise<ActionResponse<AdminComment[]>> => {
    try {
        const collection = await getCommentsCollection();
        const comments = await collection
            .find({ articleSlug })
            .sort({ createdAt: -1 })
            .toArray();

        return success(comments.map(serializeComment));
    } catch (err) {
        return handleError(err, 'Failed to get comments for article');
    }
};
