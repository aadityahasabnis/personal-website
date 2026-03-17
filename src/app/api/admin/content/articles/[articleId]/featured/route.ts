import { NextRequest, NextResponse } from 'next/server';

import { setArticleFeatured } from '@/server/new/new/admin/content/article';

import { parseJsonBody, requireAdmin, toHttp } from '../../_shared';

interface IFeaturedBody {
    featured: boolean;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = async (
    request: NextRequest,
    context: { params: Promise<{ articleId: string }> }
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

    const { articleId } = await context.params;
    return toHttp(await setArticleFeatured(articleId, body.featured));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/articles/:articleId/featured',
        methods: ['PATCH'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            featured: 'boolean (required)',
        },
        responseExamples: {
            patch200: { success: true, status: 200, message: 'Article featured', data: true },
        },
    });
};
