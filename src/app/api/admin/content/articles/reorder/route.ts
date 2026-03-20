import { NextRequest, NextResponse } from 'next/server';

import { reorderArticles } from '@/server/new/admin/content/article';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

interface IReorderBody {
    topicId: string;
    articleIds: string[];
    subtopicId?: string | null;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IReorderBody>(request);
    if (!body || typeof body.topicId !== 'string' || !Array.isArray(body.articleIds)) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Invalid body. Expected: { topicId: string, articleIds: string[], subtopicId?: string | null }',
            },
            { status: 400 }
        );
    }

    return toHttp(await reorderArticles(body.topicId, body.articleIds, body.subtopicId));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/articles/reorder',
        methods: ['POST'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            topicId: 'string required (ObjectId)',
            articleIds: 'string[] required (ordered ObjectId list)',
            subtopicId: 'string | null optional',
        },
        responseExamples: {
            reorder200: { success: true, status: 200, message: 'Articles reordered successfully', data: true },
        },
        tests: {
            reorderWithinSubtopic: {
                request: 'POST /api/admin/content/articles/reorder',
                body: {
                    topicId: '65f13ea3dc9bc503f8d7bf21',
                    subtopicId: '65f13f4ddc9bc503f8d7bf59',
                    articleIds: ['65f1502cdc9bc503f8d7c001', '65f1502cdc9bc503f8d7c002'],
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
                when: 'Invalid request body or invalid id format',
                sample: '{ "topicId": "abc", "articleIds": ["abc"] }',
            },
            {
                code: 404,
                when: 'Topic not found or article ids outside requested scope',
                sample: '{ "topicId": "65f...", "articleIds": ["65f...missing"] }',
            },
        ],
    });
};
