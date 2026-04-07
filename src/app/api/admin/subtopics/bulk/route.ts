import { NextRequest, NextResponse } from 'next/server';

import { bulkDeleteSubtopics, bulkPublishSubtopics, bulkUnpublishSubtopics } from '@/server/new/admin/subtopic';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

interface IBulkBody {
    action: 'publish' | 'unpublish' | 'delete';
    subtopicIds: string[];
    cascade?: boolean;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IBulkBody>(request);
    if (!body?.action || !Array.isArray(body.subtopicIds)) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Missing action or subtopicIds[]',
            },
            { status: 400 }
        );
    }

    switch (body.action) {
        case 'publish':
            return toHttp(await bulkPublishSubtopics(body.subtopicIds));
        case 'unpublish':
            return toHttp(await bulkUnpublishSubtopics(body.subtopicIds));
        case 'delete':
            return toHttp(await bulkDeleteSubtopics(body.subtopicIds, Boolean(body.cascade)));
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
        endpoint: '/api/admin/subtopics/bulk',
        methods: ['POST'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            action: 'publish | unpublish | delete',
            subtopicIds: 'string[] required (ObjectId list)',
            cascade: 'boolean optional, used only when action=delete',
        },
        responseExamples: {
            bulk200: { success: true, status: 200, message: 'Subtopics updated successfully', data: true },
        },
        tests: {
            bulkPublish: {
                request: 'POST /api/admin/subtopics/bulk',
                body: {
                    action: 'publish',
                    subtopicIds: ['65f13f4ddc9bc503f8d7bf59', '65f1406fdc9bc503f8d7bf73'],
                },
                expectedStatus: 200,
            },
            bulkDeleteCascade: {
                request: 'POST /api/admin/subtopics/bulk',
                body: {
                    action: 'delete',
                    subtopicIds: ['65f13f4ddc9bc503f8d7bf59'],
                    cascade: true,
                },
                expectedStatus: 200,
            },
        },
        errorCases: [
            {
                code: 401,
                when: 'Missing/expired admin session',
                sample: 'Call endpoint without NextAuth cookies',
            },
            {
                code: 400,
                when: 'Missing subtopicIds or unsupported action',
                sample: '{ "action": "archive", "subtopicIds": [] }',
            },
            {
                code: 409,
                when: 'Bulk delete with cascade=false where dependencies exist',
                sample: '{ "action": "delete", "subtopicIds": ["..."], "cascade": false }',
            },
        ],
    });
};
