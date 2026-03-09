'use server';

import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants/siteConstants';
import type { IComment, ICommentReply, ISubscriber } from '@/interfaces/schema';

// ===== TYPES =====

export interface ISanitizedComment {
    _id: string;
    author: { name: string; avatar?: string; isAuthor: boolean };
    content: string;
    upvotes: number;
    replies?: ISanitizedReply[];
    createdAt: Date;
}

export interface ISanitizedReply {
    _id: string;
    author: { name: string; avatar?: string; isAuthor: boolean };
    content: string;
    upvotes: number;
    createdAt: Date;
}

export interface ICommentsResult {
    success: boolean;
    data: ISanitizedComment[];
    metadata: { total: number; limit: number; offset: number; hasMore: boolean };
}

export interface IAdminComment {
    _id: string;
    articleSlug: string;
    author: { name: string; email: string; avatar?: string; isAuthor?: boolean };
    content: string;
    upvotes: number;
    replyCount: number;
    approved: boolean;
    reported: boolean;
    createdAt: string;
}

// ===== VALIDATION =====

const commentSchema = z.object({
    author: z.object({ name: z.string().min(2).max(100), email: z.string().email(), avatar: z.string().optional() }),
    content: z.string().min(10).max(5000),
    replyTo: z.string().optional(),
    subscribeToNewsletter: z.boolean().optional().default(true),
});

// ===== HELPERS =====

const getCommentsCollection = () => getCollection<IComment>(COLLECTIONS.comments);

const sanitizeComment = (c: IComment): ISanitizedComment => ({
    _id: c._id?.toString() ?? '',
    author: { name: c.author.name, avatar: c.author.avatar, isAuthor: c.author.isAuthor ?? false },
    content: c.content,
    upvotes: c.upvotes ?? 0,
    replies: c.replies?.map(r => ({
        _id: r._id?.toString() ?? '',
        author: { name: r.author.name, avatar: r.author.avatar, isAuthor: r.author.isAuthor ?? false },
        content: r.content,
        upvotes: r.upvotes ?? 0,
        createdAt: r.createdAt,
    })),
    createdAt: c.createdAt,
});

const subscribeIfNew = async (email: string, name?: string): Promise<void> => {
    try {
        const collection = await getCollection<ISubscriber>(COLLECTIONS.subscribers);
        if (!(await collection.findOne({ email }))) {
            await collection.insertOne({ email, name, confirmed: true, subscribedAt: new Date() } as ISubscriber);
        }
    } catch (error) {
        console.error('Failed to subscribe:', error);
    }
};

// ===== PUBLIC ACTIONS =====

export const getComments = async (slug: string, limit = 20, offset = 0): Promise<ICommentsResult> => {
    try {
        const collection = await getCommentsCollection();
        const [comments, total] = await Promise.all([
            collection.find({ articleSlug: slug, approved: true }).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
            collection.countDocuments({ articleSlug: slug, approved: true }),
        ]);
        return { success: true, data: comments.map(sanitizeComment), metadata: { total, limit, offset, hasMore: offset + comments.length < total } };
    } catch (error) {
        console.error(`Failed to get comments for: ${slug}`, error);
        return { success: false, data: [], metadata: { total: 0, limit, offset, hasMore: false } };
    }
};

export const postComment = async (
    slug: string,
    payload: { author: { name: string; email: string; avatar?: string }; content: string; replyTo?: string; subscribeToNewsletter?: boolean }
): Promise<{ success: boolean; message: string; data?: { _id: string; parentId?: string } }> => {
    try {
        const validation = commentSchema.safeParse(payload);
        if (!validation.success) return { success: false, message: 'Validation failed' };

        const { author, content, replyTo, subscribeToNewsletter } = validation.data;
        const collection = await getCommentsCollection();

        if (replyTo) {
            const parent = await collection.findOne({ _id: new ObjectId(replyTo), articleSlug: slug, approved: true });
            if (!parent) return { success: false, message: 'Parent comment not found' };

            const replyId = new ObjectId();
            const newReply: ICommentReply = {
                _id: replyId,
                author: { name: author.name, email: author.email, avatar: author.avatar },
                content,
                upvotes: 0,
                createdAt: new Date(),
            };

            await collection.updateOne({ _id: new ObjectId(replyTo) }, { $push: { replies: newReply }, $set: { updatedAt: new Date() } });
            if (subscribeToNewsletter) await subscribeIfNew(author.email, author.name);

            return { success: true, message: 'Reply submitted successfully', data: { _id: replyId.toString(), parentId: replyTo } };
        }

        const newComment: Omit<IComment, '_id'> = {
            articleSlug: slug,
            author: { name: author.name, email: author.email, avatar: author.avatar },
            content,
            upvotes: 0,
            replies: [],
            approved: true,
            reported: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await collection.insertOne(newComment as IComment);
        if (subscribeToNewsletter) await subscribeIfNew(author.email, author.name);

        return { success: true, message: 'Comment posted successfully', data: { _id: result.insertedId.toString() } };
    } catch (error) {
        console.error('Failed to post comment:', error);
        return { success: false, message: 'Failed to submit comment' };
    }
};

export const upvoteComment = async (slug: string, commentId: string): Promise<{ success: boolean; upvotes: number }> => {
    try {
        if (!ObjectId.isValid(commentId)) return { success: false, upvotes: 0 };

        const collection = await getCommentsCollection();

        // Try top-level comment
        const topLevel = await collection.findOneAndUpdate(
            { _id: new ObjectId(commentId), articleSlug: slug, approved: true },
            { $inc: { upvotes: 1 }, $set: { updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        if (topLevel) return { success: true, upvotes: topLevel.upvotes ?? 1 };

        // Try as reply
        const replyResult = await collection.findOneAndUpdate(
            { articleSlug: slug, approved: true, 'replies._id': new ObjectId(commentId) },
            { $inc: { 'replies.$.upvotes': 1 }, $set: { updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
        if (replyResult) {
            const updated = replyResult.replies?.find(r => r._id?.toString() === commentId);
            return { success: true, upvotes: updated?.upvotes ?? 1 };
        }

        return { success: false, upvotes: 0 };
    } catch (error) {
        console.error('Failed to upvote comment:', error);
        return { success: false, upvotes: 0 };
    }
};

// ===== ADMIN ACTIONS =====

export const getAllComments = async (): Promise<IAdminComment[]> => {
    try {
        const collection = await getCommentsCollection();
        const comments = await collection.find({}).sort({ createdAt: -1 }).toArray();
        return comments.map(c => ({
            _id: c._id!.toString(),
            articleSlug: c.articleSlug,
            author: c.author,
            content: c.content,
            upvotes: c.upvotes ?? 0,
            replyCount: c.replies?.length ?? 0,
            approved: c.approved,
            reported: c.reported ?? false,
            createdAt: c.createdAt.toISOString(),
        }));
    } catch (error) {
        console.error('Failed to get all comments:', error);
        return [];
    }
};

export const approveComment = async (id: string): Promise<{ success: boolean }> => {
    try {
        await (await getCommentsCollection()).updateOne({ _id: new ObjectId(id) }, { $set: { approved: true, updatedAt: new Date() } });
        return { success: true };
    } catch (error) {
        console.error('Failed to approve comment:', error);
        return { success: false };
    }
};

export const rejectComment = async (id: string): Promise<{ success: boolean }> => {
    try {
        await (await getCommentsCollection()).updateOne({ _id: new ObjectId(id) }, { $set: { approved: false, updatedAt: new Date() } });
        return { success: true };
    } catch (error) {
        console.error('Failed to reject comment:', error);
        return { success: false };
    }
};

export const deleteComment = async (id: string): Promise<{ success: boolean }> => {
    try {
        await (await getCommentsCollection()).deleteOne({ _id: new ObjectId(id) });
        return { success: true };
    } catch (error) {
        console.error('Failed to delete comment:', error);
        return { success: false };
    }
};

export const clearReportedFlag = async (id: string): Promise<{ success: boolean }> => {
    try {
        await (await getCommentsCollection()).updateOne({ _id: new ObjectId(id) }, { $set: { reported: false, updatedAt: new Date() } });
        return { success: true };
    } catch (error) {
        console.error('Failed to clear reported flag:', error);
        return { success: false };
    }
};
