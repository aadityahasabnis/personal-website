import { type NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { IArticleStats } from '@/interfaces';

interface IRouteContext {
    params: Promise<{ slug: string }>;
}

/**
 * GET /api/notes/[slug]/views
 * Returns current view count for a note
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
                views: stats?.views ?? 0,
                likes: stats?.likes ?? 0,
            },
        });
    } catch (error) {
        console.error('Failed to get views:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch views' },
            { status: 500 }
        );
    }
};

/**
 * POST /api/notes/[slug]/views
 * Increments view count and returns new value
 */
export const POST = async (
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

        const result = await collection.findOneAndUpdate(
            { slug },
            {
                $inc: { views: 1 },
                $set: { lastViewedAt: new Date(), updatedAt: new Date() },
                $setOnInsert: { createdAt: new Date(), likes: 0, shares: 0 },
            },
            {
                upsert: true,
                returnDocument: 'after',
            }
        );

        return NextResponse.json({
            success: true,
            data: {
                views: result?.views ?? 1,
            },
        });
    } catch (error) {
        console.error('Failed to increment views:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to increment views' },
            { status: 500 }
        );
    }
};
