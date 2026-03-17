import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import { NextRequest, NextResponse } from 'next/server';

import { bulkSetArticleStatus } from '@/server/new/new/admin/content/article';

import { parseJsonBody, requireAdmin, toHttp } from '../../_shared';

interface IBulkStatusBody {
    articleIds: string[];
    status: PublishStatusType;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IBulkStatusBody>(request);
    if (!Array.isArray(body?.articleIds) || !body.status || !Object.values(PUBLISH_STATUS).includes(body.status)) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Invalid body. Expected: { articleIds: string[], status: draft|published|archived }',
            },
            { status: 400 }
        );
    }

    return toHttp(await bulkSetArticleStatus(body.articleIds, body.status));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/articles/bulk/status',
        methods: ['PATCH'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            articleIds: 'string[] required (ObjectId list)',
            status: 'draft | published | archived (required)',
        },
    });
};
