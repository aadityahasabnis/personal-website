import { NextResponse } from 'next/server';

import { getPublishedProjectByPath } from '@/server/new/public/content/project';

import { toHttp } from '../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (
    _request: Request,
    context: { params: Promise<{ projectSlug: string }> }
): Promise<NextResponse> => {
    const { projectSlug } = await context.params;
    return toHttp(await getPublishedProjectByPath(projectSlug));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/projects/:projectSlug',
        methods: ['GET'],
        querySchema: {
            projectSlug: 'string required in path',
        },
        responseExamples: {
            get200: {
                success: true,
                status: 200,
                data: {
                    id: '65f1502cdc9bc503f8d7c001',
                    slug: 'portfolio-v2',
                    title: 'Portfolio v2',
                },
            },
        },
    });
};
