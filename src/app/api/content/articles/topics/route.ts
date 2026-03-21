import { NextRequest, NextResponse } from 'next/server';

import { getPublishedArticleTopics } from '@/server/new/public/content/article';

import { toHttp } from '../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(request.url);
    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '20');
    const featuredOnly = searchParams.get('featuredOnly') === 'true';

    return toHttp(
        await getPublishedArticleTopics({
            featuredOnly,
            pagination: {
                offset: Number.isNaN(offset) ? 0 : offset,
                limit: Number.isNaN(limit) ? 20 : limit,
            },
        })
    );
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/articles/topics',
        methods: ['GET'],
        querySchema: {
            offset: 'number optional default 0',
            limit: 'number optional default 20',
            featuredOnly: 'boolean optional default false',
        },
        responseExamples: {
            get200: {
                success: true,
                status: 200,
                data: [
                    {
                        id: '65f1502cdc9bc503f8d7c001',
                        slug: 'data-structures',
                        title: 'Data Structures',
                        contentCount: 24,
                    },
                ],
            },
        },
    });
};
