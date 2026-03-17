import { NextRequest, NextResponse } from 'next/server';

import {
    bulkDeleteTopics,
    bulkFeatureTopics,
    bulkPublishTopics,
    bulkUnfeatureTopics,
    bulkUnpublishTopics,
} from '@/server/new/new/admin/topic';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

interface IBulkBody {
    action: 'publish' | 'unpublish' | 'feature' | 'unfeature' | 'delete';
    topicIds: string[];
    cascade?: boolean;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IBulkBody>(request);
    if (!body?.action || !Array.isArray(body.topicIds)) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Missing action or topicIds[]',
            },
            { status: 400 }
        );
    }

    switch (body.action) {
        case 'publish':
            return toHttp(await bulkPublishTopics(body.topicIds));
        case 'unpublish':
            return toHttp(await bulkUnpublishTopics(body.topicIds));
        case 'feature':
            return toHttp(await bulkFeatureTopics(body.topicIds));
        case 'unfeature':
            return toHttp(await bulkUnfeatureTopics(body.topicIds));
        case 'delete':
            return toHttp(await bulkDeleteTopics(body.topicIds, Boolean(body.cascade)));
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
        endpoint: '/api/admin/topics/bulk',
        methods: ['POST'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            action: 'publish | unpublish | feature | unfeature | delete',
            topicIds: 'string[] required (ObjectId list)',
            cascade: 'boolean optional, used only when action=delete',
        },
        responseExamples: {
            bulk200: { success: true, status: 200, message: 'Topics updated successfully', data: true },
        },
        tests: {
            bulkPublish: {
                request: 'POST /api/admin/topics/bulk',
                body: {
                    action: 'publish',
                    topicIds: ['65f13ea3dc9bc503f8d7bf21', '65f13ec8dc9bc503f8d7bf37'],
                },
                expectedStatus: 200,
            },
            bulkDeleteCascade: {
                request: 'POST /api/admin/topics/bulk',
                body: {
                    action: 'delete',
                    topicIds: ['65f13ea3dc9bc503f8d7bf21'],
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
                when: 'Missing topicIds or unsupported action',
                sample: '{ "action": "archive", "topicIds": [] }',
            },
            {
                code: 409,
                when: 'Bulk delete with cascade=false where dependencies exist',
                sample: '{ "action": "delete", "topicIds": ["..."], "cascade": false }',
            },
        ],
    });
};
