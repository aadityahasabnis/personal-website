import { NextRequest, NextResponse } from 'next/server';

import { reorderTopics } from '@/server/new/new/admin/topic';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

interface IReorderBody {
    topicIds: string[];
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IReorderBody>(request);
    if (!body || !Array.isArray(body.topicIds)) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Invalid body. Expected: { topicIds: string[] }',
            },
            { status: 400 }
        );
    }

    const result = await reorderTopics(body.topicIds);
    return toHttp(result);
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/topics/reorder',
        methods: ['POST'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            topicIds: 'string[] required (ordered ObjectId list)',
        },
        responseExamples: {
            reorder200: { success: true, status: 200, message: 'Topics reordered successfully', data: true },
        },
        tests: {
            reorder: {
                request: 'POST /api/admin/topics/reorder',
                body: {
                    topicIds: [
                        '65f13ea3dc9bc503f8d7bf21',
                        '65f13ec8dc9bc503f8d7bf37',
                        '65f13eed60fbcfca39e8da47',
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
                when: 'Body is missing topicIds[]',
                sample: '{}',
            },
            {
                code: 400,
                when: 'One or more topicIds are not valid ObjectId values',
                sample: '{ "topicIds": ["abc"] }',
            },
        ],
    });
};
