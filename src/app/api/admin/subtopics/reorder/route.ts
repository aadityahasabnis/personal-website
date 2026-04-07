import { NextRequest, NextResponse } from 'next/server';

import { reorderSubtopics } from '@/server/new/admin/subtopic';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

interface IReorderBody {
    topicId: string;
    subtopicIds: string[];
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IReorderBody>(request);
    if (!body || typeof body.topicId !== 'string' || !Array.isArray(body.subtopicIds)) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Invalid body. Expected: { topicId: string, subtopicIds: string[] }',
            },
            { status: 400 }
        );
    }

    const result = await reorderSubtopics(body.topicId, body.subtopicIds);
    return toHttp(result);
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/subtopics/reorder',
        methods: ['POST'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            topicId: 'string required (ObjectId)',
            subtopicIds: 'string[] required (ordered ObjectId list)',
        },
        responseExamples: {
            reorder200: { success: true, status: 200, message: 'Subtopics reordered successfully', data: true },
        },
        tests: {
            reorder: {
                request: 'POST /api/admin/subtopics/reorder',
                body: {
                    topicId: '65f13ea3dc9bc503f8d7bf21',
                    subtopicIds: [
                        '65f13f4ddc9bc503f8d7bf59',
                        '65f1406fdc9bc503f8d7bf73',
                        '65f14170dc9bc503f8d7bf8f',
                    ],
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
                when: 'Body is missing topicId/subtopicIds[]',
                sample: '{}',
            },
            {
                code: 400,
                when: 'One or more ids are not valid ObjectId values',
                sample: '{ "topicId": "abc", "subtopicIds": ["abc"] }',
            },
            {
                code: 404,
                when: 'Topic not found, or one or more subtopic ids do not belong to topic',
                sample: '{ "topicId": "65f13ea3dc9bc503f8d7bf21", "subtopicIds": ["65f999..." ] }',
            },
        ],
    });
};
