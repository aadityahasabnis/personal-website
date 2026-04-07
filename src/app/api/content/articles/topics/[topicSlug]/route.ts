import { NextResponse } from 'next/server';

import { getPublishedTopicTreeBySlug } from '@/server/new/public/content/article';

import { toHttp } from '../../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (
    _request: Request,
    context: { params: Promise<{ topicSlug: string }> }
): Promise<NextResponse> => {
    const { topicSlug } = await context.params;
    return toHttp(await getPublishedTopicTreeBySlug(topicSlug));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/articles/topics/:topicSlug',
        methods: ['GET'],
        description: 'Returns topic + subtopic sections + article cards for accordion UI',
    });
};
