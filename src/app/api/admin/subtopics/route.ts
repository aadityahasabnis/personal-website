import { NextRequest, NextResponse } from 'next/server';

import type { ISubtopicTableQuery } from '@/server/new/new/admin/subtopic';
import { createSubtopic, getSubtopicForEdit, getSubtopics } from '@/server/new/new/admin/subtopic';

import { parseBooleanQuery, parseJsonBody, requireAdmin, toHttp } from './_shared';

interface ISubtopicCreateBody {
    topicId: string;
    slug: string;
    title: string;
    description?: string | null;
    order?: number;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(request.url);
    const subtopicId = searchParams.get('subtopicId');

    if (subtopicId) {
        const result = await getSubtopicForEdit(subtopicId);
        return toHttp(result);
    }

    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '20');
    const query = searchParams.get('query') ?? undefined;
    const sortBy = searchParams.get('sortBy') ?? undefined;
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const published = parseBooleanQuery(searchParams.get('published'));
    const topicId = searchParams.get('topicId') ?? undefined;

    const params: ISubtopicTableQuery = {
        ...(query ? { query } : {}),
        ...(typeof published === 'boolean' ? { published } : {}),
        ...(topicId ? { topicId } : {}),
        ...(sortBy ? { sort: { sortBy, sortOrder } } : {}),
        pagination: {
            offset: Number.isNaN(offset) ? 0 : offset,
            limit: Number.isNaN(limit) ? 20 : limit,
        },
    };

    const result = await getSubtopics(params);
    return toHttp(result);
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<ISubtopicCreateBody>(request);
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

    const result = await createSubtopic(body);
    return toHttp(result);
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/subtopics',
        methods: ['GET', 'POST'],
        auth: 'Required: NextAuth admin session cookie',
        querySchema: {
            subtopicId: 'string (ObjectId) optional; when present returns single subtopic payload',
            topicId: 'string (ObjectId) optional filter',
            offset: 'number optional default 0',
            limit: 'number optional default 20',
            query: 'string optional search on title/slug/description',
            published: 'boolean optional',
            sortBy: 'string optional',
            sortOrder: 'asc | desc optional default desc',
        },
        bodySchema: {
            topicId: 'string required (ObjectId)',
            slug: 'string required',
            title: 'string required',
            description: 'string | null optional',
            order: 'number optional',
        },
        responseExamples: {
            list200: {
                success: true,
                status: 200,
                data: [
                    {
                        id: '65f13f4ddc9bc503f8d7bf59',
                        topicId: '65f13ea3dc9bc503f8d7bf21',
                        topicSlug: 'system-design',
                        topicTitle: 'System Design',
                        slug: 'caching',
                        title: 'Caching',
                        description: 'Cache strategies and invalidation',
                        order: 0,
                        published: true,
                        contentCount: 5,
                        createdAt: '2026-03-17T09:20:15.121Z',
                        updatedAt: '2026-03-17T09:20:15.121Z',
                    },
                ],
                pagination: { offset: 0, limit: 20, total: 1 },
            },
            create201: {
                success: true,
                status: 201,
                message: 'Subtopic created successfully',
                data: '65f13f4ddc9bc503f8d7bf59',
            },
        },
        tests: [
            {
                name: 'List subtopics by topic',
                request: 'GET /api/admin/subtopics?topicId=65f13ea3dc9bc503f8d7bf21&offset=0&limit=20',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data is array'],
            },
            {
                name: 'Create subtopic',
                request: 'POST /api/admin/subtopics',
                body: {
                    topicId: '65f13ea3dc9bc503f8d7bf21',
                    slug: 'trees',
                    title: 'Trees',
                    description: 'Binary trees, BST, AVL, and traversals.',
                    order: 2,
                },
                expectedStatus: 201,
                expectedChecks: ['success=true', 'data is subtopicId string'],
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
                when: 'Invalid JSON body or invalid topicId format',
                sample: '{ "topicId": "abc" }',
            },
            {
                code: 404,
                when: 'Topic not found',
                sample: 'Use valid ObjectId format that does not exist in topics collection',
            },
            {
                code: 409,
                when: 'Subtopic slug already exists in topic',
                sample: '{ "topicId": "...", "slug": "existing-slug", "title": "X" }',
            },
        ],
    });
};
