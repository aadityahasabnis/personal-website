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
 * One-time like only (no unlike)
 * 
 * Body: { action: 'like' }
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

        const collection = await getCollection<IArticleStats>(COLLECTIONS.articleStats);

        // Increment like count (ONE-TIME ONLY)
        const result = await collection.findOneAndUpdate(
            { slug },
            {
                $inc: { likes: 1 },
                $set: { updatedAt: new Date() },
                $setOnInsert: { createdAt: new Date(), views: 0, shares: 0 },
            },
            {
                upsert: true,
                returnDocument: 'after',
            }
        );

        return NextResponse.json({
            success: true,
            data: {
                likes: result?.likes ?? 1,
                userHasLiked: true,
            },
        });
    } catch (error) {
        console.error('Failed to like:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save like' },
            { status: 500 }
        );
    }
};
