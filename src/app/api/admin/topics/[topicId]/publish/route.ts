import { NextRequest, NextResponse } from 'next/server';

import { publishTopic, toggleTopicFeatured, toggleTopicPublished, unpublishTopic } from '@/server/new/admin/topic';

import { parseJsonBody, requireAdmin, toHttp } from '../../_shared';

interface IPublishActionBody {
    action: 'publish' | 'unpublish' | 'toggle-published' | 'toggle-featured';
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (
    request: NextRequest,
    context: { params: Promise<{ topicId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IPublishActionBody>(request);
    if (!body?.action) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Missing action. Use: publish | unpublish | toggle-published | toggle-featured',
            },
            { status: 400 }
        );
    }

    const { topicId } = await context.params;

    switch (body.action) {
        case 'publish':
            return toHttp(await publishTopic(topicId));
        case 'unpublish':
            return toHttp(await unpublishTopic(topicId));
        case 'toggle-published':
            return toHttp(await toggleTopicPublished(topicId));
        case 'toggle-featured':
            return toHttp(await toggleTopicFeatured(topicId));
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
        endpoint: '/api/admin/topics/:topicId/publish',
        methods: ['POST'],
        auth: 'Required: NextAuth admin session cookie',
        pathParams: {
            topicId: 'string required (ObjectId)',
        },
        bodySchema: {
            action: 'publish | unpublish | toggle-published | toggle-featured',
        },
        responseExamples: {
            publish200: { success: true, status: 200, message: 'Topic published successfully', data: true },
            unpublish200: { success: true, status: 200, message: 'Topic unpublished successfully', data: true },
            togglePublished200: { success: true, status: 200, message: 'Topic published', data: true },
            toggleFeatured200: { success: true, status: 200, message: 'Topic featured', data: true },
        },
        tests: [
            {
                name: 'Publish topic',
                request: 'POST /api/admin/topics/:topicId/publish',
                body: { action: 'publish' },
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data=true'],
            },
            {
                name: 'Toggle featured',
                request: 'POST /api/admin/topics/:topicId/publish',
                body: { action: 'toggle-featured' },
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data is boolean'],
            },
        ],
        errorCases: [
            {
                code: 401,
                when: 'Missing/expired admin session',
                sample: 'Call endpoint without NextAuth cookies',
            },
            {
                code: 400,
                when: 'Missing action in request body',
                sample: '{}',
            },
            {
                code: 404,
                when: 'Topic id not found',
                sample: '{ "action": "publish" } with missing topic',
            },
        ],
    });
};
