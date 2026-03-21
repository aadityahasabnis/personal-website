import { NextResponse } from 'next/server';

import { getContentLikesById, incrementContentLikesById } from '@/server/new/public/stats';

import { toHttp } from '../../../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (
    _request: Request,
    context: { params: Promise<{ contentId: string }> }
): Promise<NextResponse> => {
    const { contentId } = await context.params;
    return toHttp(await getContentLikesById(contentId));
};

export const POST = async (
    _request: Request,
    context: { params: Promise<{ contentId: string }> }
): Promise<NextResponse> => {
    const { contentId } = await context.params;
    return toHttp(await incrementContentLikesById(contentId));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/articles/id/:contentId/likes',
        methods: ['GET', 'POST'],
        querySchema: {
            contentId: 'string required in path (ObjectId)',
        },
        responseExamples: {
            get200: {
                success: true,
                status: 200,
                data: {
                    contentId: '65f1502cdc9bc503f8d7c001',
                    views: 128,
                    likes: 42,
                    lastViewedAt: '2026-03-21T14:32:11.113Z',
                },
            },
            post200: {
                success: true,
                status: 200,
                message: 'Success',
                data: {
                    contentId: '65f1502cdc9bc503f8d7c001',
                    views: 128,
                    likes: 43,
                    lastViewedAt: '2026-03-21T14:32:11.113Z',
                },
            },
        },
        tests: [
            {
                name: 'Read likes snapshot',
                request: 'GET /api/content/articles/id/65f1502cdc9bc503f8d7c001/likes',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data.likes is number'],
            },
            {
                name: 'Increment likes',
                request: 'POST /api/content/articles/id/65f1502cdc9bc503f8d7c001/likes',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data.likes increments by 1'],
            },
        ],
        errorCases: [
            { code: 400, when: 'Invalid content id format' },
            { code: 404, when: 'Published content not found' },
        ],
    });
};
