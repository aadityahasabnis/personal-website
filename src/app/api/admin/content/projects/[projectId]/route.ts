import { NextRequest, NextResponse } from 'next/server';

import type { ProjectStatusType, PublishStatusType } from '@/constants/schemaConstants';
import { deleteProject, updateProject } from '@/server/new/admin/content/project';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

interface IProjectUpdateBody {
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

export const PATCH = async (
    request: NextRequest,
    context: { params: Promise<{ projectId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IProjectUpdateBody>(request);
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

    const { projectId } = await context.params;
    return toHttp(await updateProject(projectId, body));
};

export const DELETE = async (
    _request: NextRequest,
    context: { params: Promise<{ projectId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const { projectId } = await context.params;
    return toHttp(await deleteProject(projectId));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/projects/:projectId',
        methods: ['PATCH', 'DELETE'],
        auth: 'Required: NextAuth admin session cookie',
        pathParams: {
            projectId: 'string required (ObjectId)',
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
            patch200: { success: true, status: 200, message: 'Project updated successfully', data: true },
            delete200: { success: true, status: 200, message: 'Project deleted successfully', data: true },
        },
    });
};

/*
JSON body example for PATCH /api/admin/content/projects/:projectId
{
  "title": "Portfolio Rebuild v2",
  "featured": true,
  "status": "live",
  "publishStatus": "published",
  "completedDate": "2026-03-20T00:00:00.000Z",
  "order": 0
}
*/
