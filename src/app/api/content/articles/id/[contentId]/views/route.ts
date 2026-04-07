import { NextResponse } from 'next/server';

import { getContentViewsById, incrementContentViewsById } from '@/server/new/public/stats';

import { toHttp } from '../../../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (
    _request: Request,
    context: { params: Promise<{ contentId: string }> }
): Promise<NextResponse> => {
    const { contentId } = await context.params;
    return toHttp(await getContentViewsById(contentId));
};

export const POST = async (
    _request: Request,
    context: { params: Promise<{ contentId: string }> }
): Promise<NextResponse> => {
    const { contentId } = await context.params;
    return toHttp(await incrementContentViewsById(contentId));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/articles/id/:contentId/views',
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
                    views: 129,
                    likes: 42,
                    lastViewedAt: '2026-03-21T14:35:01.777Z',
                },
            },
        },
        tests: [
            {
                name: 'Read views snapshot',
                request: 'GET /api/content/articles/id/65f1502cdc9bc503f8d7c001/views',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data.views is number'],
            },
            {
                name: 'Increment views',
                request: 'POST /api/content/articles/id/65f1502cdc9bc503f8d7c001/views',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data.views increments by 1'],
            },
        ],
        errorCases: [
            { code: 400, when: 'Invalid content id format' },
            { code: 404, when: 'Published content not found' },
        ],
    });
};
