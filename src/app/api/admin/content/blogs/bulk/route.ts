import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import { NextRequest, NextResponse } from 'next/server';

import { bulkDeleteBlogs, bulkSetBlogStatus } from '@/server/new/admin/content/blog';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

interface IBulkBody {
    action: 'set-status' | 'delete';
    status?: PublishStatusType;
    blogIds: string[];
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IBulkBody>(request);
    if (!body?.action || !Array.isArray(body.blogIds)) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Missing action or blogIds[]',
            },
            { status: 400 }
        );
    }

    switch (body.action) {
        case 'set-status':
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
            return toHttp(await bulkSetBlogStatus(body.blogIds, body.status));
        case 'delete':
            return toHttp(await bulkDeleteBlogs(body.blogIds));
        default:
            return NextResponse.json(
                {
                    success: false,
                    status: 400,
                    error: 'Unsupported action',
                },
                { status: 400 }
            );
    }
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/blogs/bulk',
        methods: ['POST'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            action: 'set-status | delete',
            status: 'draft | published | archived (required when action=set-status)',
            blogIds: 'string[] required (ObjectId list)',
        },
        responseExamples: {
            bulk200: { success: true, status: 200, message: 'Bulk action completed', data: true },
        },
        tests: {
            bulkSetStatus: {
                request: 'POST /api/admin/content/blogs/bulk',
                body: {
                    action: 'set-status',
                    status: 'published',
                    blogIds: ['65f1502cdc9bc503f8d7c101', '65f1502cdc9bc503f8d7c102'],
                },
                expectedStatus: 200,
            },
        },
        errorCases: [
            {
                code: 401,
                when: 'Missing or expired admin session',
                sample: 'Call endpoint without NextAuth cookies',
            },
            {
                code: 400,
                when: 'Missing ids or unsupported action',
                sample: '{ "action": "set-status", "status": "invalid", "blogIds": [] }',
            },
            {
                code: 404,
                when: 'Any blog id not found',
                sample: '{ "action": "delete", "blogIds": ["65f...missing"] }',
            },
        ],
    });
};
