import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IComment, ISubscriber, ICommentReply } from '@/interfaces';

/**
 * Shared Comment API Handlers
 * 
 * This module contains shared logic for comment operations across different content types.
 * Eliminates ~400 LOC duplication between articles and notes comment routes.
 */

// Validation schema for new comment
export const commentSchema = z.object({
    author: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').max(100),
        email: z.string().email('Invalid email address'),
        avatar: z.string().optional(),
    }),
    content: z.string().min(10, 'Comment must be at least 10 characters').max(5000),
    replyTo: z.string().optional(), // Parent comment ID for replies
}).passthrough(); // Allow extra fields like subscribeToNewsletter

/**
 * Sanitizes a comment for public response (removes sensitive data like email)
 */
export function sanitizeComment(comment: IComment) {
    return {
        _id: comment._id?.toString(),
        author: {
            name: comment.author.name,
            avatar: comment.author.avatar,
            isAuthor: comment.author.isAuthor ?? false,
        },
        content: comment.content,
        upvotes: comment.upvotes ?? 0,
        replies: comment.replies?.map((reply) => ({
            _id: reply._id?.toString(),
            author: {
                name: reply.author.name,
                avatar: reply.author.avatar,
                isAuthor: reply.author.isAuthor ?? false,
            },
            content: reply.content,
            upvotes: reply.upvotes ?? 0,
            createdAt: reply.createdAt,
        })),
        createdAt: comment.createdAt,
    };
}

/**
 * GET handler - Fetches approved comments for a content slug
 */
export async function handleGetComments(
    request: NextRequest,
    slug: string
): Promise<NextResponse> {
    try {
        if (!slug) {
            return NextResponse.json(
                { error: 'Slug is required' },
                { status: 400 }
            );
        }

        // Parse query params for pagination
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        const collection = await getCollection<IComment>(COLLECTIONS.comments);

        // Get approved comments, newest first
        const [comments, total] = await Promise.all([
            collection
                .find({ articleSlug: slug, approved: true })
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .toArray(),
            collection.countDocuments({ articleSlug: slug, approved: true }),
        ]);

        // Sanitize comments for response
        const sanitizedComments = comments.map(sanitizeComment);

        return NextResponse.json({
            success: true,
            data: sanitizedComments,
            metadata: {
                total,
                limit,
                offset,
                hasMore: offset + comments.length < total,
            },
        });
    } catch (error) {
        console.error('Failed to get comments:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

/**
 * POST handler - Creates a new comment or reply
 */
export async function handlePostComment(
    request: NextRequest,
    slug: string
): Promise<NextResponse> {
    try {
        if (!slug) {
            return NextResponse.json(
                { error: 'Slug is required' },
                { status: 400 }
            );
        }

        const body = await request.json();

        // Validate request body
        const validation = commentSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    details: validation.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const { author, content, replyTo } = validation.data;
        const subscribeToNewsletter = (validation.data as any).subscribeToNewsletter ?? true;

        const commentsCollection = await getCollection<IComment>(COLLECTIONS.comments);

        // Handle reply to existing comment
        if (replyTo) {
            const parentComment = await commentsCollection.findOne({
                _id: new ObjectId(replyTo),
                articleSlug: slug,
                approved: true,
            });

            if (!parentComment) {
                return NextResponse.json(
                    { success: false, error: 'Parent comment not found' },
                    { status: 404 }
                );
            }

            // Create the reply
            const replyId = new ObjectId();
            const newReply: ICommentReply = {
                _id: replyId,
                author: {
                    name: author.name,
                    email: author.email,
                    avatar: author.avatar,
                },
                content,
                upvotes: 0,
                createdAt: new Date(),
            };

            // Add reply to parent comment
            await commentsCollection.updateOne(
                { _id: new ObjectId(replyTo) },
                { 
                    $push: { replies: newReply },
                    $set: { updatedAt: new Date() },
                }
            );

            // Subscribe to newsletter if opted in
            if (subscribeToNewsletter) {
                await subscribeToNewsletterIfNew(author.email, author.name);
            }

            return NextResponse.json({
                success: true,
                message: 'Reply submitted successfully',
                data: {
                    _id: replyId.toString(),
                    parentId: replyTo,
                },
            });
        }

        // Create new top-level comment (auto-approved for better UX)
        const newComment: Omit<IComment, '_id'> = {
            articleSlug: slug,
            author: {
                name: author.name,
                email: author.email,
                avatar: author.avatar,
            },
            content,
            upvotes: 0,
            replies: [],
            approved: true, // Auto-approve for instant feedback
            reported: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await commentsCollection.insertOne(newComment as IComment);

        // Subscribe to newsletter if opted in
        if (subscribeToNewsletter) {
            await subscribeToNewsletterIfNew(author.email, author.name);
        }

        return NextResponse.json({
            success: true,
            message: 'Comment posted successfully',
            data: {
                _id: result.insertedId.toString(),
            },
        });
    } catch (error) {
        console.error('Failed to create comment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit comment' },
            { status: 500 }
        );
    }
}

/**
 * Subscribe user to newsletter if they're not already subscribed
 */
async function subscribeToNewsletterIfNew(email: string, name?: string): Promise<void> {
    try {
        const subscribersCollection = await getCollection<ISubscriber>(COLLECTIONS.subscribers);
        
        // Check if already subscribed
        const existing = await subscribersCollection.findOne({ email });
        
        if (!existing) {
            await subscribersCollection.insertOne({
                email,
                name,
                confirmed: true, // Auto-confirm since they're commenting
                subscribedAt: new Date(),
            } as ISubscriber);
        }
    } catch (error) {
        // Don't fail the comment submission if newsletter fails
        console.error('Failed to subscribe to newsletter:', error);
    }
}
