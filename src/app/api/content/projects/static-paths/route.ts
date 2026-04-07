import { NextResponse } from 'next/server';

import { getPublishedProjectStaticPaths } from '@/server/new/public/content/project';

import { toHttp } from '../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (): Promise<NextResponse> => {
    return toHttp(await getPublishedProjectStaticPaths());
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/projects/static-paths',
        methods: ['GET'],
        responseExamples: {
            get200: {
                success: true,
                status: 200,
                data: [{ contentId: '65f1502cdc9bc503f8d7c001', projectSlug: 'portfolio-v2' }],
            },
        },
    });
};
