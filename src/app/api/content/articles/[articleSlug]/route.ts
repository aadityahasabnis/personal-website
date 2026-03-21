import { NextResponse } from 'next/server';

import { getPublishedArticleByPath, getPublishedArticleStaticPaths } from '@/server/new/public/content/article';

import { toHttp } from '../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (
    _request: Request,
    context: { params: Promise<{ articleSlug: string }> }
): Promise<NextResponse> => {
    const { articleSlug } = await context.params;

    const pathsResult = await getPublishedArticleStaticPaths();
    if (!pathsResult.success) {
        return toHttp(pathsResult);
    }

    const match = pathsResult.data.find((path) => path.articleSlug === articleSlug);
    if (!match) {
        return toHttp({
            success: true,
            status: 200,
            data: null,
        });
    }

    return toHttp(await getPublishedArticleByPath(match.topicSlug, articleSlug));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/articles/:articleSlug',
        methods: ['GET'],
        description: 'Resolves topic slug internally, then returns published article details',
        querySchema: {
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
    });
};
