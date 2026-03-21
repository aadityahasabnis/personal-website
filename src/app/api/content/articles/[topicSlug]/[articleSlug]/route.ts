import { NextResponse } from 'next/server';

import { getPublishedArticleByPath } from '@/server/new/public/content/article';

import { toHttp } from '../../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (
    _request: Request,
    context: { params: Promise<{ topicSlug: string; articleSlug: string }> }
): Promise<NextResponse> => {
    const { topicSlug, articleSlug } = await context.params;
    return toHttp(await getPublishedArticleByPath(topicSlug, articleSlug));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/articles/:topicSlug/:articleSlug',
        methods: ['GET'],
        querySchema: {
            topicSlug: 'string required in path',
            articleSlug: 'string required in path',
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
                name: 'Get published article by slugs',
                request: 'GET /api/content/articles/system-design/cache-invalidation',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data is object or null'],
            },
        ],
    });
};
