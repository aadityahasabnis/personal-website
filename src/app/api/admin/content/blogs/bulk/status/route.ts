import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import { NextRequest, NextResponse } from 'next/server';

import { bulkSetBlogStatus } from '@/server/new/admin/content/blog';

import { parseJsonBody, requireAdmin, toHttp } from '../../_shared';

interface IBulkStatusBody {
    blogIds: string[];
    status: PublishStatusType;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IBulkStatusBody>(request);
    if (!Array.isArray(body?.blogIds) || !body.status || !Object.values(PUBLISH_STATUS).includes(body.status)) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Invalid body. Expected: { blogIds: string[], status: draft|published|archived }',
            },
            { status: 400 }
        );
    }

    return toHttp(await bulkSetBlogStatus(body.blogIds, body.status));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/blogs/bulk/status',
        methods: ['PATCH'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            blogIds: 'string[] required (ObjectId list)',
            status: 'draft | published | archived (required)',
        },
    });
};
