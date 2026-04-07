import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import { NextRequest, NextResponse } from 'next/server';

import { setArticleStatus } from '@/server/new/admin/content/article';

import { parseJsonBody, requireAdmin, toHttp } from '../../_shared';

interface IAliasBody {
    action?: 'set-status';
    status?: PublishStatusType;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Backward-compatible alias for older clients/tests.
export const POST = async (
    request: NextRequest,
    context: { params: Promise<{ articleId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IAliasBody>(request);
    if (!body) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Invalid JSON body',
            },
            { status: 400 }
        );
    }

    if (body.action && body.action !== 'set-status') {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Unsupported action for this endpoint. Use action=set-status.',
            },
            { status: 400 }
        );
    }

    if (!body.status || !Object.values(PUBLISH_STATUS).includes(body.status)) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Missing or invalid status. Use: draft | published | archived',
            },
            { status: 400 }
        );
    }

    const { articleId } = await context.params;
    return toHttp(await setArticleStatus(articleId, body.status));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/articles/:articleId/publish',
        deprecated: true,
        replacement: '/api/admin/content/articles/:articleId/status',
        methods: ['POST'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            action: 'set-status (optional)',
            status: 'draft | published | archived (required)',
        },
    });
};
