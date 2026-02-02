import { type NextRequest, NextResponse } from 'next/server';
import { handleGetComments, handlePostComment } from '@/lib/api/comment-handlers';

interface IRouteContext {
    params: Promise<{ slug: string }>;
}

/**
 * GET /api/articles/[slug]/comments
 * Returns approved comments for an article
 */
export const GET = async (
    request: NextRequest,
    { params }: IRouteContext
): Promise<NextResponse> => {
    const { slug } = await params;
    return handleGetComments(request, slug);
};

/**
 * POST /api/articles/[slug]/comments
 * Creates a new comment or reply (pending moderation)
 */
export const POST = async (
    request: NextRequest,
    { params }: IRouteContext
): Promise<NextResponse> => {
    const { slug } = await params;
    return handlePostComment(request, slug);
};
