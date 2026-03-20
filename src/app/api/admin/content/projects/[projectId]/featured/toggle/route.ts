import { NextRequest, NextResponse } from 'next/server';

import { toggleProjectFeatured } from '@/server/new/admin/content/project';

import { requireAdmin, toHttp } from '../../../_shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (
    _request: NextRequest,
    context: { params: Promise<{ projectId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { projectId } = await context.params;
    return toHttp(await toggleProjectFeatured(projectId));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/projects/:projectId/featured/toggle',
        methods: ['POST'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            post: 'No body required',
        },
        responseExamples: {
            post200: { success: true, status: 200, message: 'Project featured', data: true },
        },
    });
};
