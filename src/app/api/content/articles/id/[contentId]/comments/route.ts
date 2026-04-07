import { NextRequest, NextResponse } from 'next/server';

import { createPublicComment, getPublicCommentsByContentId } from '@/server/new/public/comments';

import { parseJsonBody, toHttp } from '../../../_shared';

interface ICreateCommentBody {
    parentId?: string | null;
    authorName: string;
    authorEmail: string;
    authorWebsite?: string | null;
    authorAvatar?: string | null;
    body: string;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (
    request: NextRequest,
    context: { params: Promise<{ contentId: string }> }
): Promise<NextResponse> => {
    const { contentId } = await context.params;
    const { searchParams } = new URL(request.url);

    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '20');
    const approvedOnly = searchParams.get('approvedOnly');

    return toHttp(
        await getPublicCommentsByContentId({
            contentId,
            approvedOnly: approvedOnly === null ? true : approvedOnly === 'true',
            pagination: {
                offset: Number.isNaN(offset) ? 0 : offset,
                limit: Number.isNaN(limit) ? 20 : limit,
            },
        })
    );
};

export const POST = async (
    request: NextRequest,
    context: { params: Promise<{ contentId: string }> }
): Promise<NextResponse> => {
    const { contentId } = await context.params;

    const body = await parseJsonBody<ICreateCommentBody>(request);
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

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

    return toHttp(
        await createPublicComment({
            contentId,
            ...(body.parentId !== undefined ? { parentId: body.parentId } : {}),
            authorName: body.authorName,
            authorEmail: body.authorEmail,
            ...(body.authorWebsite !== undefined ? { authorWebsite: body.authorWebsite } : {}),
            ...(body.authorAvatar !== undefined ? { authorAvatar: body.authorAvatar } : {}),
            body: body.body,
            ...(ipAddress ? { ipAddress } : {}),
        })
    );
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/articles/id/:contentId/comments',
        methods: ['GET', 'POST'],
        querySchema: {
            contentId: 'string required in path (ObjectId)',
            offset: 'number optional default 0',
            limit: 'number optional default 20',
            approvedOnly: 'boolean optional default true',
        },
        bodySchema: {
            post: {
                parentId: 'string | null optional',
                authorName: 'string required',
                authorEmail: 'string required',
                authorWebsite: 'string | null optional',
                authorAvatar: 'string | null optional',
                body: 'string required',
            },
        },
        responseExamples: {
            get200: {
                success: true,
                status: 200,
                data: {
                    rows: [
                        {
                            id: '65f1a0cddc9bc503f8d7f101',
                            contentId: '65f1502cdc9bc503f8d7c001',
                            parentId: null,
                            content: 'Great article',
                            replies: [],
                        },
                    ],
                    total: 1,
                    offset: 0,
                    limit: 20,
                    hasMore: false,
                },
            },
            post200: {
                success: true,
                status: 200,
                message: 'Comment submitted for moderation',
                data: {
                    id: '65f1a0cddc9bc503f8d7f101',
                    contentId: '65f1502cdc9bc503f8d7c001',
                    parentId: null,
                },
            },
        },
        tests: [
            {
                name: 'List approved comments',
                request: 'GET /api/content/articles/id/65f1502cdc9bc503f8d7c001/comments?offset=0&limit=20&approvedOnly=true',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data.rows is array'],
            },
            {
                name: 'Create a pending comment',
                request: 'POST /api/content/articles/id/65f1502cdc9bc503f8d7c001/comments',
                body: {
                    authorName: 'Aaditya',
                    authorEmail: 'aaditya@example.com',
                    body: 'Great write-up!',
                },
                expectedStatus: 200,
                expectedChecks: ['success=true', 'message contains moderation'],
            },
        ],
        errorCases: [
            { code: 400, when: 'Invalid content id or invalid JSON/body fields' },
            { code: 404, when: 'Published content not found or parent not found' },
        ],
    });
};
