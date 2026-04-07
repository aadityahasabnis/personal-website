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
        endpoint: '/api/content/articles/id/:contentId/comments/:commentId/upvote',
        methods: ['POST'],
        querySchema: {
            contentId: 'string required in path (ObjectId)',
            commentId: 'string required in path (ObjectId)',
        },
        responseExamples: {
            post200: {
                success: true,
                status: 200,
                message: 'Comment upvoted',
                data: {
                    id: '65f1a0cddc9bc503f8d7f101',
                    contentId: '65f1502cdc9bc503f8d7c001',
                    upvotes: 4,
                },
            },
        },
        tests: [
            {
                name: 'Upvote approved comment',
                request: 'POST /api/content/articles/id/65f1502cdc9bc503f8d7c001/comments/65f1a0cddc9bc503f8d7f101/upvote',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data.upvotes increments by 1'],
            },
        ],
        errorCases: [
            { code: 400, when: 'Invalid content/comment id format' },
            { code: 404, when: 'Published content or approved comment not found' },
        ],
    });
};
