import { NextRequest, NextResponse } from 'next/server';

import type { ProjectStatusType, PublishStatusType } from '@/constants/schemaConstants';
import type { IProjectTableQuery } from '@/server/new/admin/content/project';
import { createProject, getProjectForEdit, getProjects } from '@/server/new/admin/content/project';

import { parseBooleanQuery, parseJsonBody, requireAdmin, toHttp } from './_shared';

interface IProjectCreateBody {
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

    techStack?: string[];
    githubUrl?: string | null;
    liveUrl?: string | null;
    demoVideo?: string | null;
    gallery?: string[];
    status?: ProjectStatusType | null;
    startDate?: string | Date | null;
    completedDate?: string | Date | null;
    order?: number;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (projectId) {
        const result = await getProjectForEdit(projectId);
        return toHttp(result);
    }

    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '20');
    const query = searchParams.get('query') ?? undefined;
    const sortBy = searchParams.get('sortBy') ?? undefined;
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const publishStatus = (searchParams.get('publishStatus') as PublishStatusType | null) ?? undefined;
    const status = (searchParams.get('status') as ProjectStatusType | null) ?? undefined;
    const featured = parseBooleanQuery(searchParams.get('featured'));

    const params: IProjectTableQuery = {
        ...(query ? { query } : {}),
        ...(publishStatus ? { publishStatus } : {}),
        ...(typeof status === 'string' ? { status } : {}),
        ...(typeof featured === 'boolean' ? { featured } : {}),
        ...(sortBy ? { sort: { sortBy, sortOrder } } : {}),
        pagination: {
            offset: Number.isNaN(offset) ? 0 : offset,
            limit: Number.isNaN(limit) ? 20 : limit,
        },
    };

    return toHttp(await getProjects(params));
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IProjectCreateBody>(request);
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

    return toHttp(await createProject(body));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/projects',
        methods: ['GET', 'POST'],
        auth: 'Required: NextAuth admin session cookie',
        querySchema: {
            projectId: 'string (ObjectId) optional; when present returns edit payload',
            publishStatus: 'draft | published | archived optional',
            status: 'in-progress | live | archived optional',
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
                techStack: 'string[] optional',
                githubUrl: 'string | null optional',
                liveUrl: 'string | null optional',
                demoVideo: 'string | null optional',
                gallery: 'string[] optional',
                status: 'in-progress | live | archived | null optional',
                startDate: 'ISO date string | null optional',
                completedDate: 'ISO date string | null optional',
                order: 'number optional',
            },
        },
        responseExamples: {
            list200: {
                success: true,
                status: 200,
                data: [
                    {
                        id: '65f1502cdc9bc503f8d7d001',
                        slug: 'portfolio-rebuild',
                        title: 'Portfolio Rebuild',
                        publishStatus: 'published',
                        status: 'live',
                        featured: true,
                    },
                ],
                pagination: { offset: 0, limit: 20, total: 1 },
            },
            create201: {
                success: true,
                status: 201,
                message: 'Project created successfully',
                data: '65f1502cdc9bc503f8d7d001',
            },
        },
    });
};

/*
JSON body example for POST /api/admin/content/projects
{
  "slug": "portfolio-rebuild",
  "title": "Portfolio Rebuild",
  "description": "Rebuilding personal website with Next.js",
  "body": "# Case Study\n...",
  "publishStatus": "draft",
  "featured": false,
  "techStack": ["Next.js", "TypeScript", "MongoDB"],
  "githubUrl": "https://github.com/owner/repo",
  "liveUrl": "https://example.com",
  "status": "in-progress",
  "startDate": "2026-03-01T00:00:00.000Z",
  "completedDate": null,
  "order": 1
}
*/
