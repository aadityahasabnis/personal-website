import { NextRequest, NextResponse } from 'next/server';

import type { PublishStatusType } from '@/constants/schemaConstants';
import { deleteBlog, updateBlog } from '@/server/new/admin/content/blog';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

interface IBlogUpdateBody {
    slug?: string;
    title?: string;
    description?: string;
    body?: string;
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

export const PATCH = async (
    request: NextRequest,
    context: { params: Promise<{ blogId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IBlogUpdateBody>(request);
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

    const { blogId } = await context.params;
    return toHttp(await updateBlog(blogId, body));
};

export const DELETE = async (
    _request: NextRequest,
    context: { params: Promise<{ blogId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { blogId } = await context.params;
    return toHttp(await deleteBlog(blogId));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/blogs/:blogId',
        methods: ['PATCH', 'DELETE'],
        auth: 'Required: NextAuth admin session cookie',
        pathParams: {
            blogId: 'string required (ObjectId)',
        },
        bodySchema: {
            patch: {
                slug: 'string optional',
                title: 'string optional',
                description: 'string optional',
                body: 'string optional',
                tags: 'string[] optional',
                coverImage: 'string | null optional',
                readingTime: 'number optional',
                publishStatus: 'draft | published | archived optional',
                featured: 'boolean optional',
                seo: 'object optional',
            },
        },
        responseExamples: {
            patch200: { success: true, status: 200, message: 'Blog updated successfully', data: true },
            delete200: { success: true, status: 200, message: 'Blog deleted successfully', data: true },
        },
        tests: [
            {
                name: 'Update blog',
                request: 'PATCH /api/admin/content/blogs/:blogId',
                body: {
                    title: 'Updated title',
                    featured: true,
                },
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data=true'],
            },
            {
                name: 'Delete blog',
                request: 'DELETE /api/admin/content/blogs/:blogId',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data=true'],
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
                when: 'Invalid blog id or invalid JSON body',
                sample: 'PATCH /api/admin/content/blogs/not-an-object-id',
            },
            {
                code: 404,
                when: 'Blog not found',
                sample: 'PATCH /api/admin/content/blogs/65f...missing',
            },
            {
                code: 409,
                when: 'Slug conflict with another blog',
                sample: '{ "slug": "existing-blog-slug" }',
            },
        ],
    });
};
