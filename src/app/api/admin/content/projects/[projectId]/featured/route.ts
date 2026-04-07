import { NextRequest, NextResponse } from 'next/server';

import { setProjectFeatured } from '@/server/new/admin/content/project';

import { parseJsonBody, requireAdmin, toHttp } from '../../_shared';

interface IFeaturedBody {
    featured: boolean;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = async (
    request: NextRequest,
    context: { params: Promise<{ projectId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IFeaturedBody>(request);
    if (typeof body?.featured !== 'boolean') {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Missing or invalid featured flag. Use: { "featured": true | false }',
            },
            { status: 400 }
        );
    }

    const { projectId } = await context.params;
    return toHttp(await setProjectFeatured(projectId, body.featured));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/projects/:projectId/featured',
        methods: ['PATCH'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            featured: 'boolean (required)',
        },
        responseExamples: {
            patch200: { success: true, status: 200, message: 'Project featured', data: true },
        },
    });
};

/*
JSON body example for PATCH /api/admin/content/projects/:projectId/featured
{
  "featured": true
}
*/
