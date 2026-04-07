import { NextRequest, NextResponse } from 'next/server';

import { deleteSubtopic, updateSubtopic } from '@/server/new/admin/subtopic';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

interface ISubtopicUpdateBody {
    topicId?: string;
    slug?: string;
    title?: string;
    description?: string | null;
    order?: number;
    published?: boolean;
}

interface ISubtopicDeleteBody {
    cascade?: boolean;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = async (
    request: NextRequest,
    context: { params: Promise<{ subtopicId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<ISubtopicUpdateBody>(request);
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

    const { subtopicId } = await context.params;
    const result = await updateSubtopic(subtopicId, body);

    return toHttp(result);
};

export const DELETE = async (
    request: NextRequest,
    context: { params: Promise<{ subtopicId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<ISubtopicDeleteBody>(request);
    const { subtopicId } = await context.params;
    const result = await deleteSubtopic(subtopicId, Boolean(body?.cascade));

    return toHttp(result);
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/subtopics/:subtopicId',
        methods: ['PATCH', 'DELETE'],
        auth: 'Required: NextAuth admin session cookie',
        pathParams: {
            subtopicId: 'string required (ObjectId)',
        },
        bodySchema: {
            patch: {
                topicId: 'string optional (ObjectId)',
                slug: 'string optional',
                title: 'string optional',
                description: 'string | null optional',
                order: 'number optional',
                published: 'boolean optional',
            },
            delete: {
                cascade: 'boolean optional default false',
            },
        },
        responseExamples: {
            patch200: { success: true, status: 200, message: 'Subtopic updated successfully', data: true },
            delete200: { success: true, status: 200, message: 'Subtopic deleted successfully', data: true },
        },
        tests: [
            {
                name: 'Move subtopic across topics',
                request: 'PATCH /api/admin/subtopics/:subtopicId',
                body: { topicId: '65f13ea3dc9bc503f8d7bf21' },
                expectedStatus: '200 or 404',
                expectedChecks: ['200 moves topic ownership and rebalances counters'],
            },
            {
                name: 'Delete with cascade false',
                request: 'DELETE /api/admin/subtopics/:subtopicId',
                body: { cascade: false },
                expectedStatus: '200 or 409',
                expectedChecks: ['409 when related articles exist'],
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
                when: 'Invalid subtopicId/topicId format',
                sample: 'PATCH /api/admin/subtopics/not-an-object-id',
            },
            {
                code: 404,
                when: 'Subtopic or target topic not found',
                sample: '{ "topicId": "65f13ea3dc9bc503f8d7bf21" } with non-existing records',
            },
            {
                code: 409,
                when: 'Delete without cascade while related articles exist',
                sample: '{ "cascade": false }',
            },
        ],
    });
};
