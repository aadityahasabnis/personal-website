import { NextRequest, NextResponse } from 'next/server';

import { deleteTopic, updateTopic } from '@/server/new/new/admin/topic';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

interface ITopicUpdateBody {
    slug?: string;
    title?: string;
    description?: string;
    coverImage?: string | null;
    order?: number;
    published?: boolean;
    featured?: boolean;
}

interface ITopicDeleteBody {
    cascade?: boolean;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = async (
    request: NextRequest,
    context: { params: Promise<{ topicId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<ITopicUpdateBody>(request);
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

    const { topicId } = await context.params;
    const result = await updateTopic(topicId, body);
    return toHttp(result);
};

export const DELETE = async (
    request: NextRequest,
    context: { params: Promise<{ topicId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<ITopicDeleteBody>(request);
    const { topicId } = await context.params;
    const result = await deleteTopic(topicId, Boolean(body?.cascade));

    return toHttp(result);
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/topics/:topicId',
        methods: ['PATCH', 'DELETE'],
        auth: 'Required: NextAuth admin session cookie',
        pathParams: {
            topicId: 'string required (ObjectId)',
        },
        bodySchema: {
            patch: {
                slug: 'string optional',
                title: 'string optional',
                description: 'string optional',
                coverImage: 'string | null optional',
                order: 'number optional',
                published: 'boolean optional',
                featured: 'boolean optional',
            },
            delete: {
                cascade: 'boolean optional default false',
            },
        },
        responseExamples: {
            patch200: { success: true, status: 200, message: 'Topic updated successfully', data: true },
            delete200: { success: true, status: 200, message: 'Topic deleted successfully', data: true },
        },
        tests: [
            {
                name: 'Update topic title',
                request: 'PATCH /api/admin/topics/:topicId',
                body: { title: 'Updated Topic Name' },
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data=true'],
            },
            {
                name: 'Delete topic safely',
                request: 'DELETE /api/admin/topics/:topicId',
                body: { cascade: false },
                expectedStatus: '200 or 409',
                expectedChecks: ['409 when dependencies exist'],
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
                when: 'Invalid topicId format',
                sample: 'PATCH /api/admin/topics/not-an-object-id',
            },
            {
                code: 404,
                when: 'Topic not found',
                sample: 'Use valid ObjectId format that does not exist in DB',
            },
            {
                code: 409,
                when: 'Delete without cascade while related subtopics/articles exist',
                sample: '{ "cascade": false }',
            },
        ],
    });
};
