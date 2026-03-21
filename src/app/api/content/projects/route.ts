import { NextRequest, NextResponse } from 'next/server';

import { PROJECT_STATUS_OPTIONS, type ProjectStatusType } from '@/constants/schemaConstants';
import { getPublishedProjects } from '@/server/new/public/content/project';

import { toHttp } from './_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(request.url);
    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '20');
    const featuredOnly = searchParams.get('featuredOnly') === 'true';
    const statusRaw = searchParams.get('status');
    const status = statusRaw && PROJECT_STATUS_OPTIONS.includes(statusRaw as ProjectStatusType)
        ? (statusRaw as ProjectStatusType)
        : undefined;

    return toHttp(
        await getPublishedProjects({
            featuredOnly,
            ...(status ? { status } : {}),
            pagination: {
                offset: Number.isNaN(offset) ? 0 : offset,
                limit: Number.isNaN(limit) ? 20 : limit,
            },
        })
    );
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/projects',
        methods: ['GET'],
        querySchema: {
            offset: 'number optional default 0',
            limit: 'number optional default 20',
            featuredOnly: 'boolean optional default false',
            status: 'string optional project lifecycle status',
        },
        responseExamples: {
            get200: {
                success: true,
                status: 200,
                data: [
                    {
                        id: '65f1502cdc9bc503f8d7c001',
                        slug: 'portfolio-v2',
                        title: 'Portfolio v2',
                    },
                ],
            },
        },
    });
};
