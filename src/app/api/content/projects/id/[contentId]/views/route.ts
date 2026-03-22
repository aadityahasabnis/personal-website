import { NextResponse } from 'next/server';

import { getContentViewsById } from '@/server/new/public/stats';

import { toHttp } from '../../../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (
    _request: Request,
    context: { params: Promise<{ contentId: string }> }
): Promise<NextResponse> => {
    const { contentId } = await context.params;
    return toHttp(await getContentViewsById(contentId));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/projects/id/:contentId/views',
        methods: ['GET'],
        querySchema: {
            contentId: 'string required in path (ObjectId)',
        },
    });
};
