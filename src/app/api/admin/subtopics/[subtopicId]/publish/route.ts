import { NextRequest, NextResponse } from 'next/server';

import { publishSubtopic, toggleSubtopicPublished, unpublishSubtopic } from '@/server/new/admin/subtopic';

import { parseJsonBody, requireAdmin, toHttp } from '../../_shared';

interface IPublishActionBody {
    action: 'publish' | 'unpublish' | 'toggle-published';
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (
    request: NextRequest,
    context: { params: Promise<{ subtopicId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IPublishActionBody>(request);
    if (!body?.action) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Missing action. Use: publish | unpublish | toggle-published',
            },
            { status: 400 }
        );
    }

    const { subtopicId } = await context.params;

    switch (body.action) {
        case 'publish':
            return toHttp(await publishSubtopic(subtopicId));
        case 'unpublish':
            return toHttp(await unpublishSubtopic(subtopicId));
        case 'toggle-published':
            return toHttp(await toggleSubtopicPublished(subtopicId));
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
        endpoint: '/api/admin/subtopics/:subtopicId/publish',
        methods: ['POST'],
        auth: 'Required: NextAuth admin session cookie',
        pathParams: {
            subtopicId: 'string required (ObjectId)',
        },
        bodySchema: {
            action: 'publish | unpublish | toggle-published',
        },
        responseExamples: {
            publish200: { success: true, status: 200, message: 'Subtopic published successfully', data: true },
            unpublish200: { success: true, status: 200, message: 'Subtopic unpublished successfully', data: true },
            toggle200: { success: true, status: 200, message: 'Subtopic published', data: true },
        },
        tests: [
            {
                name: 'Publish subtopic',
                request: 'POST /api/admin/subtopics/:subtopicId/publish',
                body: { action: 'publish' },
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data=true'],
            },
            {
                name: 'Toggle publish status',
                request: 'POST /api/admin/subtopics/:subtopicId/publish',
                body: { action: 'toggle-published' },
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
                when: 'Subtopic id not found',
                sample: '{ "action": "publish" } with missing subtopic',
            },
        ],
    });
};
