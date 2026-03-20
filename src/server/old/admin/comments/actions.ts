'use server';

/**
 * Comments Admin Actions
 * 
 * Server actions for managing comments in the admin panel.
 */

import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants/siteConstants';
import type { IComment } from '@/interfaces/schema';
import type { ActionResponse } from '../utils/types';
import { success, error, notFound } from '../utils/response';
import { handleError } from '../utils/errorHandler';
import { logUpdate, logDelete } from '../utils/activityLogger';

// ===== TYPES =====

export interface AdminComment {
    _id: string;
    articleSlug: string;
    author: { 
        name: string; 
        email: string; 
        avatar?: string; 
        isAuthor?: boolean;
    };
    content: string;
    upvotes: number;
    replyCount: number;
    approved: boolean;
    reported: boolean;
    createdAt: string;
}

export interface ApproveCommentRequest {
    id: string;
}

export interface RejectCommentRequest {
    id: string;
}

export interface DeleteCommentRequest {
    id: string;
}

export interface ClearReportedFlagRequest {
    id: string;
}

export interface BulkCommentRequest {
    ids: string[];
}

export interface AdminReplyRequest {
    commentId: string;
    content: string;
}

// ===== HELPERS =====

const getCommentsCollection = () => getCollection<IComment>(COLLECTIONS.comments);

const revalidateComments = () => {
    revalidatePath('/admin/comments');
    revalidatePath('/admin');
};

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

// ===== ACTIONS =====

/**
 * Approve a comment
 */
export const approveComment = async (request: ApproveCommentRequest): Promise<ActionResponse<void>> => {
    try {
        const { id } = request;
        
        if (!ObjectId.isValid(id)) {
            return error('Invalid comment ID');
        }

        const collection = await getCommentsCollection();
        const comment = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!comment) {
            return notFound('Comment');
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { approved: true, updatedAt: new Date() } }
        );

        await logUpdate('comment', comment.content.substring(0, 50), id, { action: 'approved' });
        revalidateComments();

        return success(undefined, 'Comment approved successfully');
    } catch (err) {
        return handleError(err, 'Failed to approve comment');
    }
};

/**
 * Reject a comment (set approved to false)
 */
export const rejectComment = async (request: RejectCommentRequest): Promise<ActionResponse<void>> => {
    try {
        const { id } = request;
        
        if (!ObjectId.isValid(id)) {
            return error('Invalid comment ID');
        }

        const collection = await getCommentsCollection();
        const comment = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!comment) {
            return notFound('Comment');
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { approved: false, updatedAt: new Date() } }
        );

        await logUpdate('comment', comment.content.substring(0, 50), id, { action: 'rejected' });
        revalidateComments();

        return success(undefined, 'Comment rejected successfully');
    } catch (err) {
        return handleError(err, 'Failed to reject comment');
    }
};

/**
 * Delete a comment
 */
export const deleteComment = async (request: DeleteCommentRequest): Promise<ActionResponse<void>> => {
    try {
        const { id } = request;
        
        if (!ObjectId.isValid(id)) {
            return error('Invalid comment ID');
        }

        const collection = await getCommentsCollection();
        const comment = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!comment) {
            return notFound('Comment');
        }

        await collection.deleteOne({ _id: new ObjectId(id) });

        await logDelete('comment', comment.content.substring(0, 50), id);
        revalidateComments();

        return success(undefined, 'Comment deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete comment');
    }
};

/**
 * Clear the reported flag from a comment
 */
export const clearReportedFlag = async (request: ClearReportedFlagRequest): Promise<ActionResponse<void>> => {
    try {
        const { id } = request;
        
        if (!ObjectId.isValid(id)) {
            return error('Invalid comment ID');
        }

        const collection = await getCommentsCollection();
        const comment = await collection.findOne({ _id: new ObjectId(id) });
        
        if (!comment) {
            return notFound('Comment');
        }

        await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { reported: false, updatedAt: new Date() } }
        );

        await logUpdate('comment', comment.content.substring(0, 50), id, { action: 'cleared_reported_flag' });
        revalidateComments();

        return success(undefined, 'Reported flag cleared successfully');
    } catch (err) {
        return handleError(err, 'Failed to clear reported flag');
    }
};

/**
 * Bulk approve comments
 */
export const bulkApproveComments = async (request: BulkCommentRequest): Promise<ActionResponse<number>> => {
    try {
        const { ids } = request;
        
        const validIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
        if (validIds.length === 0) {
            return error('No valid comment IDs provided');
        }

        const collection = await getCommentsCollection();
        const result = await collection.updateMany(
            { _id: { $in: validIds } },
            { $set: { approved: true, updatedAt: new Date() } }
        );

        revalidateComments();

        return success(result.modifiedCount, `Approved ${result.modifiedCount} comments`);
    } catch (err) {
        return handleError(err, 'Failed to bulk approve comments');
    }
};

/**
 * Bulk delete comments
 */
export const bulkDeleteComments = async (request: BulkCommentRequest): Promise<ActionResponse<number>> => {
    try {
        const { ids } = request;
        
        const validIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
        if (validIds.length === 0) {
            return error('No valid comment IDs provided');
        }

        const collection = await getCommentsCollection();
        const result = await collection.deleteMany({ _id: { $in: validIds } });

        revalidateComments();

        return success(result.deletedCount, `Deleted ${result.deletedCount} comments`);
    } catch (err) {
        return handleError(err, 'Failed to bulk delete comments');
    }
};

/**
 * Admin reply to a comment
 * Creates a reply with the site owner badge (isAuthor: true)
 */
export const adminReplyToComment = async (request: AdminReplyRequest): Promise<ActionResponse<void>> => {
    try {
        const { commentId, content } = request;
        
        if (!ObjectId.isValid(commentId)) {
            return error('Invalid comment ID');
        }

        if (!content || content.trim().length === 0) {
            return error('Reply content is required');
        }

        if (content.length > 2000) {
            return error('Reply content exceeds maximum length of 2000 characters');
        }

        const collection = await getCommentsCollection();
        const comment = await collection.findOne({ _id: new ObjectId(commentId) });
        
        if (!comment) {
            return notFound('Comment');
        }

        // Create the admin reply with isAuthor flag
        const reply = {
            _id: new ObjectId(),
            author: {
                name: 'Aaditya Hasabnis',  // Site owner name
                email: 'admin@aadityahasabnis.com',  // Can be configured
                isAuthor: true,  // Mark as site owner reply
            },
            content: content.trim(),
            upvotes: 0,
            createdAt: new Date(),
        };

        // Add reply to the comment
        await collection.updateOne(
            { _id: new ObjectId(commentId) },
            { 
                $push: { replies: reply },
                $set: { updatedAt: new Date() }
            }
        );

        await logUpdate('comment', `Reply to: ${comment.content.substring(0, 30)}...`, commentId, { 
            action: 'admin_reply',
            replyPreview: content.substring(0, 50)
        });
        
        // Revalidate the article page as well
        revalidatePath(`/articles/${comment.articleSlug}`);
        revalidateComments();

        return success(undefined, 'Reply posted successfully');
    } catch (err) {
        return handleError(err, 'Failed to post reply');
    }
};
