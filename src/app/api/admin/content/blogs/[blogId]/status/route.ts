import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import { NextRequest, NextResponse } from 'next/server';

import { setBlogStatus } from '@/server/new/admin/content/blog';

import { parseJsonBody, requireAdmin, toHttp } from '../../_shared';

interface IStatusBody {
    status: PublishStatusType;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = async (
    request: NextRequest,
    context: { params: Promise<{ blogId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IStatusBody>(request);
    if (!body?.status || !Object.values(PUBLISH_STATUS).includes(body.status)) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Missing or invalid status. Use: draft | published | archived',
            },
            { status: 400 }
        );
    }

    const { blogId } = await context.params;
    return toHttp(await setBlogStatus(blogId, body.status));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/blogs/:blogId/status',
        methods: ['PATCH'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            status: 'draft | published | archived (required)',
        },
        responseExamples: {
            patch200: { success: true, status: 200, message: 'Blog status changed to published', data: true },
        },
    });
};
