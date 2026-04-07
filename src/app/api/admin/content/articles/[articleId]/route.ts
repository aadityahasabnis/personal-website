import { NextRequest, NextResponse } from 'next/server';

import type { PublishStatusType } from '@/constants/schemaConstants';
import { deleteArticle, updateArticle } from '@/server/new/admin/content/article';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

interface IArticleUpdateBody {
    slug?: string;
    title?: string;
    description?: string;
    body?: string;
    topicId?: string;
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

export const PATCH = async (
    request: NextRequest,
    context: { params: Promise<{ articleId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IArticleUpdateBody>(request);
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

    const { articleId } = await context.params;
    return toHttp(await updateArticle(articleId, body));
};

export const DELETE = async (
    _request: NextRequest,
    context: { params: Promise<{ articleId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { articleId } = await context.params;
    return toHttp(await deleteArticle(articleId));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/articles/:articleId',
        methods: ['PATCH', 'DELETE'],
        auth: 'Required: NextAuth admin session cookie',
        pathParams: {
            articleId: 'string required (ObjectId)',
        },
        bodySchema: {
            patch: {
                slug: 'string optional',
                title: 'string optional',
                description: 'string optional',
                body: 'string optional',
                topicId: 'string optional (ObjectId)',
                subtopicId: 'string | null optional (ObjectId)',
                tags: 'string[] optional',
                coverImage: 'string | null optional',
                readingTime: 'number optional',
                publishStatus: 'draft | published | archived optional',
                featured: 'boolean optional',
                order: 'number optional',
                seo: 'object optional',
            },
        },
        responseExamples: {
            patch200: { success: true, status: 200, message: 'Article updated successfully', data: true },
            delete200: { success: true, status: 200, message: 'Article deleted successfully', data: true },
        },
        tests: [
            {
                name: 'Update article topic/subtopic',
                request: 'PATCH /api/admin/content/articles/:articleId',
                body: {
                    topicId: '65f13ea3dc9bc503f8d7bf21',
                    subtopicId: '65f13f4ddc9bc503f8d7bf59',
                },
                expectedStatus: '200 | 404',
                expectedChecks: ['200 when ids exist and relation is valid'],
            },
            {
                name: 'Delete article',
                request: 'DELETE /api/admin/content/articles/:articleId',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data=true'],
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
                when: 'Invalid article/topic/subtopic id or invalid JSON body',
                sample: 'PATCH /api/admin/content/articles/not-an-object-id',
            },
            {
                code: 404,
                when: 'Article/topic/subtopic not found',
                sample: '{ "topicId": "65f...missing" }',
            },
            {
                code: 409,
                when: 'Slug conflict with another article',
                sample: '{ "slug": "existing-article-slug" }',
            },
        ],
    });
};
