import { NextResponse } from 'next/server';

import { getPublishedBlogById } from '@/server/new/public/content/blog';

import { toHttp } from '../../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (
    _request: Request,
    context: { params: Promise<{ contentId: string }> }
): Promise<NextResponse> => {
    const { contentId } = await context.params;
    return toHttp(await getPublishedBlogById(contentId));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/blogs/id/:contentId',
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
                    slug: 'scaling-read-heavy-services',
                    title: 'Scaling Read-Heavy Services',
                },
            },
        },
        errorCases: [
            { code: 400, when: 'Invalid content id format' },
        ],
    });
};
