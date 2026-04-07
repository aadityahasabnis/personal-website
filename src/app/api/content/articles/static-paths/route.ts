import { NextResponse } from 'next/server';

import { getPublishedArticleStaticPaths } from '@/server/new/public/content/article';

import { toHttp } from '../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (): Promise<NextResponse> => {
    return toHttp(await getPublishedArticleStaticPaths());
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/articles/static-paths',
        methods: ['GET'],
        responseExamples: {
            get200: {
                success: true,
                status: 200,
                data: [
                    {
                        contentId: '65f1502cdc9bc503f8d7c001',
                        topicSlug: 'system-design',
                        articleSlug: 'cache-invalidation',
                    },
                ],
            },
        },
        tests: [
            {
                name: 'Read static params source rows',
                request: 'GET /api/content/articles/static-paths',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data is array'],
            },
        ],
    });
};
