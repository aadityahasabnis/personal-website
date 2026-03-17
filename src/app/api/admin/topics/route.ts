import { NextRequest, NextResponse } from 'next/server';

import type { ITopicTableQuery } from '@/server/new/new/admin/topic';
import { createTopic, getTopicForEdit, getTopics } from '@/server/new/new/admin/topic';

import { parseBooleanQuery, parseJsonBody, requireAdmin, toHttp } from './_shared';

interface ITopicCreateBody {
    slug: string;
    title: string;
    description: string;
    coverImage?: string | null;
    order?: number;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');

    if (topicId) {
        const result = await getTopicForEdit(topicId);
        return toHttp(result);
    }

    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '20');
    const query = searchParams.get('query') ?? undefined;
    const sortBy = searchParams.get('sortBy') ?? undefined;
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const published = parseBooleanQuery(searchParams.get('published'));
    const featured = parseBooleanQuery(searchParams.get('featured'));

    const params: ITopicTableQuery = {
        ...(query ? { query } : {}),
        ...(typeof published === 'boolean' ? { published } : {}),
        ...(typeof featured === 'boolean' ? { featured } : {}),
        ...(sortBy ? { sort: { sortBy, sortOrder } } : {}),
        pagination: {
            offset: Number.isNaN(offset) ? 0 : offset,
            limit: Number.isNaN(limit) ? 20 : limit,
        },
    };

    const result = await getTopics(params);

    return toHttp(result);
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<ITopicCreateBody>(request);
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

    const result = await createTopic(body);
    return toHttp(result);
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/topics',
        methods: ['GET', 'POST'],
        auth: 'Required: NextAuth admin session cookie',
        querySchema: {
            topicId: 'string (ObjectId) optional; when present returns single topic payload',
            offset: 'number optional default 0',
            limit: 'number optional default 20',
            query: 'string optional search on title/slug/description',
            published: 'boolean optional',
            featured: 'boolean optional',
            sortBy: 'string optional',
            sortOrder: 'asc | desc optional default desc',
        },
        bodySchema: {
            slug: 'string required',
            title: 'string required',
            description: 'string required',
            coverImage: 'string | null optional',
            order: 'number optional',
        },
        responseExamples: {
            list200: {
                success: true,
                status: 200,
                data: [
                    {
                        id: '65f13ea3dc9bc503f8d7bf21',
                        slug: 'system-design',
                        title: 'System Design',
                        description: 'Architecture, scalability, and distributed systems.',
                        coverImage: null,
                        order: 0,
                        published: true,
                        featured: false,
                        subTopicCount: 4,
                        contentCount: 12,
                        createdAt: '2026-03-17T09:20:15.121Z',
                        updatedAt: '2026-03-17T09:20:15.121Z',
                    },
                ],
                pagination: { offset: 0, limit: 20, total: 1 },
            },
            getById200: {
                success: true,
                status: 200,
                data: {
                    _id: '65f13ea3dc9bc503f8d7bf21',
                    slug: 'system-design',
                    title: 'System Design',
                    description: 'Architecture, scalability, and distributed systems.',
                    coverImage: null,
                    order: 0,
                    published: true,
                    featured: false,
                    subTopicCount: 4,
                    contentCount: 12,
                    createdAt: '2026-03-17T09:20:15.121Z',
                    updatedAt: '2026-03-17T09:20:15.121Z',
                },
            },
            create201: {
                success: true,
                status: 201,
                message: 'Topic created successfully',
                data: '65f13ea3dc9bc503f8d7bf21',
            },
        },
        tests: [
            {
                name: 'List topics',
                request: 'GET /api/admin/topics?offset=0&limit=20&published=true',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data is array', 'pagination.total is number'],
            },
            {
                name: 'Create topic',
                request: 'POST /api/admin/topics',
                body: {
                    slug: 'system-design',
                    title: 'System Design',
                    description: 'Architecture, scalability, and distributed systems.',
                    coverImage: null,
                    order: 3,
                },
                expectedStatus: 201,
                expectedChecks: ['success=true', 'data is topicId string'],
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
                when: 'Invalid JSON body',
                sample: '{ "slug": "broken"',
            },
            {
                code: 409,
                when: 'Topic slug already exists',
                sample: '{ "slug": "existing-slug", "title": "X", "description": "Y" }',
            },
        ],
    });
};
