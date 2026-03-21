import { NextResponse } from 'next/server';

import { getPublishedArticleById } from '@/server/new/public/content/article';

import { toHttp } from '../../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (
    _request: Request,
    context: { params: Promise<{ contentId: string }> }
): Promise<NextResponse> => {
    const { contentId } = await context.params;
    return toHttp(await getPublishedArticleById(contentId));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/articles/id/:contentId',
        methods: ['GET'],
        querySchema: {
            contentId: 'string required in path (ObjectId)',
        },
        responseExamples: {
            get200: {
                success: true,
                status: 200,
                data: {
                    id: '65f1502cdc9bc503f8d7c001',
                    slug: 'cache-invalidation',
                    title: 'Cache Invalidation',
                },
            },
        },
        tests: [
            {
                name: 'Fetch published article by id',
                request: 'GET /api/content/articles/id/65f1502cdc9bc503f8d7c001',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data is object or null'],
            },
        ],
        errorCases: [
            { code: 400, when: 'Invalid content id format' },
        ],
    });
};
