import { NextResponse } from 'next/server';

import { upvotePublicCommentById } from '@/server/new/public/comments';

import { toHttp } from '../../../../../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (
    _request: Request,
    context: { params: Promise<{ contentId: string; commentId: string }> }
): Promise<NextResponse> => {
    const { contentId, commentId } = await context.params;
    return toHttp(await upvotePublicCommentById(contentId, commentId));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/blogs/id/:contentId/comments/:commentId/upvote',
        methods: ['POST'],
        querySchema: {
            contentId: 'string required in path (ObjectId)',
            commentId: 'string required in path (ObjectId)',
        },
    });
};
