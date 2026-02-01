import { type NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IComment } from '@/interfaces';

interface IRouteContext {
    params: Promise<{ slug: string; commentId: string }>;
}

/**
 * POST /api/articles/[slug]/comments/[commentId]/upvote
 * Increment upvote count for a comment or reply
 */
export const POST = async (
    request: NextRequest,
    { params }: IRouteContext
): Promise<NextResponse> => {
    try {
        const { slug, commentId } = await params;

        if (!slug || !commentId) {
            return NextResponse.json(
                { error: 'Slug and commentId are required' },
                { status: 400 }
            );
        }

        // Validate ObjectId format
        if (!ObjectId.isValid(commentId)) {
            return NextResponse.json(
                { error: 'Invalid comment ID format' },
                { status: 400 }
            );
        }

        const collection = await getCollection<IComment>(COLLECTIONS.comments);

        // Try to find and update as a top-level comment first
        const topLevelResult = await collection.findOneAndUpdate(
            {
                _id: new ObjectId(commentId),
                articleSlug: slug,
                approved: true,
            },
            {
                $inc: { upvotes: 1 },
                $set: { updatedAt: new Date() },
            },
            {
                returnDocument: 'after',
            }
        );

        if (topLevelResult) {
            return NextResponse.json({
                success: true,
                data: {
                    upvotes: topLevelResult.upvotes ?? 1,
                },
            });
        }

        // If not found as top-level, try to find as a reply
        const replyResult = await collection.findOneAndUpdate(
            {
                articleSlug: slug,
                approved: true,
                'replies._id': new ObjectId(commentId),
            },
            {
                $inc: { 'replies.$.upvotes': 1 },
                $set: { updatedAt: new Date() },
            },
            {
                returnDocument: 'after',
            }
        );

        if (replyResult) {
            // Find the updated reply to return its upvote count
            const updatedReply = replyResult.replies?.find(
                (r) => r._id?.toString() === commentId
            );

            return NextResponse.json({
                success: true,
                data: {
                    upvotes: updatedReply?.upvotes ?? 1,
                },
            });
        }

        // Comment/reply not found
        return NextResponse.json(
            { success: false, error: 'Comment not found' },
            { status: 404 }
        );
    } catch (error) {
        console.error('Failed to upvote comment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upvote comment' },
            { status: 500 }
        );
    }
};
