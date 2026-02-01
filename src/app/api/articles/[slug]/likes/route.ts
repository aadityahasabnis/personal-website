import { type NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IArticleStats } from '@/interfaces';

interface IRouteContext {
    params: Promise<{ slug: string }>;
}

/**
 * GET /api/articles/[slug]/likes
 * Returns current like count for an article
 */
export const GET = async (
    _request: NextRequest,
    { params }: IRouteContext
): Promise<NextResponse> => {
    try {
        const { slug } = await params;
        
        if (!slug) {
            return NextResponse.json(
                { error: 'Slug is required' },
                { status: 400 }
            );
        }

        const collection = await getCollection<IArticleStats>(COLLECTIONS.articleStats);
        const stats = await collection.findOne({ slug });

        return NextResponse.json({
            success: true,
            data: {
                likes: stats?.likes ?? 0,
                userHasLiked: false, // Frontend handles this via localStorage
            },
        });
    } catch (error) {
        console.error('Failed to get likes:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch likes' },
            { status: 500 }
        );
    }
};

/**
 * POST /api/articles/[slug]/likes
 * Toggles like: increment or decrement based on current state
 * 
 * Body: { action: 'like' | 'unlike' }
 */
export const POST = async (
    request: NextRequest,
    { params }: IRouteContext
): Promise<NextResponse> => {
    try {
        const { slug } = await params;
        
        if (!slug) {
            return NextResponse.json(
                { error: 'Slug is required' },
                { status: 400 }
            );
        }

        // Parse action from body
        const body = await request.json().catch(() => ({}));
        const action = body.action || 'like'; // Default to like for backwards compatibility

        const collection = await getCollection<IArticleStats>(COLLECTIONS.articleStats);

        // Toggle: increment or decrement
        const increment = action === 'like' ? 1 : -1;

        const result = await collection.findOneAndUpdate(
            { slug },
            {
                $inc: { likes: increment },
                $set: { updatedAt: new Date() },
                $setOnInsert: { createdAt: new Date(), views: 0, shares: 0 },
            },
            {
                upsert: true,
                returnDocument: 'after',
            }
        );

        // Ensure likes never go below 0
        const finalLikes = Math.max(result?.likes ?? 0, 0);
        if (finalLikes !== result?.likes) {
            await collection.updateOne(
                { slug },
                { $set: { likes: finalLikes } }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                likes: finalLikes,
                userHasLiked: action === 'like',
            },
        });
    } catch (error) {
        console.error('Failed to toggle like:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save like' },
            { status: 500 }
        );
    }
};
