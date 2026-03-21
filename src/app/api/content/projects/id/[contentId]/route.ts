import { NextResponse } from 'next/server';

import { getPublishedProjectById } from '@/server/new/public/content/project';

import { toHttp } from '../../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (
    _request: Request,
    context: { params: Promise<{ contentId: string }> }
): Promise<NextResponse> => {
    const { contentId } = await context.params;
    return toHttp(await getPublishedProjectById(contentId));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/projects/id/:contentId',
        methods: ['GET'],
        querySchema: {
            contentId: 'string required in path (ObjectId)',
        },
        errorCases: [{ code: 400, when: 'Invalid content id format' }],
    });
};
