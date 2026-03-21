import { NextResponse } from 'next/server';

import { getContentLikesById, incrementContentLikesById } from '@/server/new/public/stats';

import { toHttp } from '../../../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (
    _request: Request,
    context: { params: Promise<{ contentId: string }> }
): Promise<NextResponse> => {
    const { contentId } = await context.params;
    return toHttp(await getContentLikesById(contentId));
};

export const POST = async (
    _request: Request,
    context: { params: Promise<{ contentId: string }> }
): Promise<NextResponse> => {
    const { contentId } = await context.params;
    return toHttp(await incrementContentLikesById(contentId));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/projects/id/:contentId/likes',
        methods: ['GET', 'POST'],
        querySchema: {
            contentId: 'string required in path (ObjectId)',
        },
    });
};
