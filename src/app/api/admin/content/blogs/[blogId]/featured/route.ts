import { NextRequest, NextResponse } from 'next/server';

import { setBlogFeatured } from '@/server/new/admin/content/blog';

import { parseJsonBody, requireAdmin, toHttp } from '../../_shared';

interface IFeaturedBody {
    featured: boolean;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = async (
    request: NextRequest,
    context: { params: Promise<{ blogId: string }> }
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

    const { blogId } = await context.params;
    return toHttp(await setBlogFeatured(blogId, body.featured));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/blogs/:blogId/featured',
        methods: ['PATCH'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            featured: 'boolean (required)',
        },
        responseExamples: {
            patch200: { success: true, status: 200, message: 'Blog featured', data: true },
        },
    });
};
