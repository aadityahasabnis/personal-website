import { NextRequest, NextResponse } from 'next/server';

import type { PublishStatusType } from '@/constants/schemaConstants';
import type { IArticleTableQuery } from '@/server/new/admin/content/article';
import { createArticle, getArticleForEdit, getArticles, reconcileArticleCounters } from '@/server/new/admin/content/article';

import { parseBooleanQuery, parseJsonBody, requireAdmin, toHttp } from './_shared';

interface IArticleCreateBody {
    slug: string;
    title: string;
    description: string;
    body: string;
    topicId: string;
    subtopicId?: string | null;
    tags?: string[];
    coverImage?: string | null;
    readingTime?: number;
    publishStatus?: PublishStatusType;
    featured?: boolean;
    order?: number;
    seo?: {
        title?: string | null;
        description?: string | null;
        keywords?: string[];
        ogImage?: string | null;
        canonicalUrl?: string | null;
        noIndex?: boolean;
    } | null;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (articleId) {
        const result = await getArticleForEdit(articleId);
        return toHttp(result);
    }

    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '20');
    const query = searchParams.get('query') ?? undefined;
    const sortBy = searchParams.get('sortBy') ?? undefined;
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const topicId = searchParams.get('topicId') ?? undefined;
    const subtopicId = searchParams.get('subtopicId') ?? undefined;
    const publishStatus = (searchParams.get('publishStatus') as PublishStatusType | null) ?? undefined;

    const featured = parseBooleanQuery(searchParams.get('featured'));

    const params: IArticleTableQuery = {
        ...(query ? { query } : {}),
        ...(topicId ? { topicId } : {}),
        ...(subtopicId ? { subtopicId } : {}),
        ...(publishStatus ? { publishStatus } : {}),
        ...(typeof featured === 'boolean' ? { featured } : {}),
        ...(sortBy ? { sort: { sortBy, sortOrder } } : {}),
        pagination: {
            offset: Number.isNaN(offset) ? 0 : offset,
            limit: Number.isNaN(limit) ? 20 : limit,
        },
    };

    return toHttp(await getArticles(params));
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IArticleCreateBody>(request);
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

    return toHttp(await createArticle(body));
};

export const PATCH = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<{ action?: 'reconcile-counters' }>(request);
    if (body?.action !== 'reconcile-counters') {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Unsupported action. Use: reconcile-counters',
            },
            { status: 400 }
        );
    }

    return toHttp(await reconcileArticleCounters());
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/articles',
        methods: ['GET', 'POST', 'PATCH'],
        auth: 'Required: NextAuth admin session cookie',
        querySchema: {
            articleId: 'string (ObjectId) optional; when present returns edit payload',
            topicId: 'string (ObjectId) optional',
            subtopicId: 'string (ObjectId) optional',
            publishStatus: 'draft | published | archived optional',
            offset: 'number optional default 0',
            limit: 'number optional default 20',
            query: 'string optional',
            featured: 'boolean optional',
            sortBy: 'string optional',
            sortOrder: 'asc | desc optional default desc',
        },
        bodySchema: {
            post: {
                slug: 'string required',
                title: 'string required',
                description: 'string required',
                body: 'string required',
                topicId: 'string required (ObjectId)',
                subtopicId: 'string | null optional (ObjectId)',
                tags: 'string[] optional',
                coverImage: 'string | null optional',
                readingTime: 'number optional',
                publishStatus: 'draft | published | archived optional',
                featured: 'boolean optional',
                order: 'number optional',
                seo: 'object optional',
            },
            patch: {
                action: 'reconcile-counters',
            },
        },
        responseExamples: {
            list200: {
                success: true,
                status: 200,
                data: [
                    {
                        id: '65f1502cdc9bc503f8d7c001',
                        slug: 'cache-invalidation',
                        title: 'Cache Invalidation',
                        topicId: '65f13ea3dc9bc503f8d7bf21',
                        subtopicId: '65f13f4ddc9bc503f8d7bf59',
                        publishStatus: 'published',
                        featured: false,
                    },
                ],
                pagination: { offset: 0, limit: 20, total: 1 },
            },
            create201: {
                success: true,
                status: 201,
                message: 'Article created successfully',
                data: '65f1502cdc9bc503f8d7c001',
            },
            reconcile200: {
                success: true,
                status: 200,
                message: 'Article counters reconciled successfully',
                data: { topicsUpdated: 3, subtopicsUpdated: 4 },
            },
        },
        tests: [
            {
                name: 'List articles by topic',
                request: 'GET /api/admin/content/articles?topicId=65f13ea3dc9bc503f8d7bf21&offset=0&limit=20',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data is array'],
            },
            {
                name: 'Create article',
                request: 'POST /api/admin/content/articles',
                body: {
                    slug: 'cache-invalidation',
                    title: 'Cache Invalidation',
                    description: 'Hard problem in distributed systems',
                    body: '...',
                    topicId: '65f13ea3dc9bc503f8d7bf21',
                    subtopicId: '65f13f4ddc9bc503f8d7bf59',
                    publishStatus: 'published',
                },
                expectedStatus: 201,
                expectedChecks: ['success=true', 'data is articleId string'],
            },
            {
                name: 'Reconcile counters',
                request: 'PATCH /api/admin/content/articles',
                body: { action: 'reconcile-counters' },
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data.topicsUpdated is number', 'data.subtopicsUpdated is number'],
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
                when: 'Invalid topic/subtopic/article id format or invalid JSON body',
                sample: '{ "topicId": "abc" }',
            },
            {
                code: 404,
                when: 'Related topic/subtopic not found for create',
                sample: '{ "topicId": "65f...missing", "slug": "x" }',
            },
            {
                code: 409,
                when: 'Article slug already exists',
                sample: '{ "slug": "existing-slug", "topicId": "65f..." }',
            },
        ],
    });
};
