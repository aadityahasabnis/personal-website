import { NextResponse } from 'next/server';

import { getPublishedBlogStaticPaths } from '@/server/new/public/content/blog';

import { toHttp } from '../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (): Promise<NextResponse> => {
    return toHttp(await getPublishedBlogStaticPaths());
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/blogs/static-paths',
        methods: ['GET'],
        responseExamples: {
            get200: {
                success: true,
                status: 200,
                data: [
                    {
                        contentId: '65f1502cdc9bc503f8d7c001',
                        blogSlug: 'scaling-read-heavy-services',
                    },
                ],
            },
        },
    });
};
