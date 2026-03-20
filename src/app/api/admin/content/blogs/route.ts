import { NextRequest, NextResponse } from 'next/server';

import type { PublishStatusType } from '@/constants/schemaConstants';
import type { IBlogTableQuery } from '@/server/new/admin/content/blog';
import { createBlog, getBlogForEdit, getBlogs } from '@/server/new/admin/content/blog';

import { parseBooleanQuery, parseJsonBody, requireAdmin, toHttp } from './_shared';

interface IBlogCreateBody {
    slug: string;
    title: string;
    description: string;
    body: string;
    tags?: string[];
    coverImage?: string | null;
    readingTime?: number;
    publishStatus?: PublishStatusType;
    featured?: boolean;
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
    const blogId = searchParams.get('blogId');

    if (blogId) {
        const result = await getBlogForEdit(blogId);
        return toHttp(result);
    }

    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '20');
    const query = searchParams.get('query') ?? undefined;
    const sortBy = searchParams.get('sortBy') ?? undefined;
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const publishStatus = (searchParams.get('publishStatus') as PublishStatusType | null) ?? undefined;
    const featured = parseBooleanQuery(searchParams.get('featured'));

    const params: IBlogTableQuery = {
        ...(query ? { query } : {}),
        ...(publishStatus ? { publishStatus } : {}),
        ...(typeof featured === 'boolean' ? { featured } : {}),
        ...(sortBy ? { sort: { sortBy, sortOrder } } : {}),
        pagination: {
            offset: Number.isNaN(offset) ? 0 : offset,
            limit: Number.isNaN(limit) ? 20 : limit,
        },
    };

    return toHttp(await getBlogs(params));
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IBlogCreateBody>(request);
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

    return toHttp(await createBlog(body));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/blogs',
        methods: ['GET', 'POST'],
        auth: 'Required: NextAuth admin session cookie',
        querySchema: {
            blogId: 'string (ObjectId) optional; when present returns edit payload',
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
                tags: 'string[] optional',
                coverImage: 'string | null optional',
                readingTime: 'number optional',
                publishStatus: 'draft | published | archived optional',
                featured: 'boolean optional',
                seo: 'object optional',
            },
        },
        responseExamples: {
            list200: {
                success: true,
                status: 200,
                data: [
                    {
                        id: '65f1502cdc9bc503f8d7c101',
                        slug: 'build-systems-at-scale',
                        title: 'Build Systems at Scale',
                        publishStatus: 'published',
                        featured: false,
                    },
                ],
                pagination: { offset: 0, limit: 20, total: 1 },
            },
            create201: {
                success: true,
                status: 201,
                message: 'Blog created successfully',
                data: '65f1502cdc9bc503f8d7c101',
            },
        },
        tests: [
            {
                name: 'List blogs',
                request: 'GET /api/admin/content/blogs?offset=0&limit=20',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data is array'],
            },
            {
                name: 'Create blog',
                request: 'POST /api/admin/content/blogs',
                body: {
                    slug: 'build-systems-at-scale',
                    title: 'Build Systems at Scale',
                    description: 'Designing and shipping robust build pipelines',
                    body: '...',
                    publishStatus: 'published',
                },
                expectedStatus: 201,
                expectedChecks: ['success=true', 'data is blogId string'],
            },
        ],
        errorCases: [
            {
                code: 401,
                when: 'Missing or expired admin session',
                sample: 'Call endpoint without NextAuth cookies',
            },
            {
                code: 400,
                when: 'Invalid JSON body',
                sample: '{ slug: }',
            },
            {
                code: 409,
                when: 'Blog slug already exists',
                sample: '{ "slug": "existing-slug" }',
            },
        ],
    });
};
