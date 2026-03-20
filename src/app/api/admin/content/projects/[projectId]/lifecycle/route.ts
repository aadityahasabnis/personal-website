import { PROJECT_STATUS, type ProjectStatusType } from '@/constants/schemaConstants';
import { NextRequest, NextResponse } from 'next/server';

import { setProjectLifecycleStatus } from '@/server/new/admin/content/project';

import { parseJsonBody, requireAdmin, toHttp } from '../../_shared';

interface ILifecycleBody {
    status: ProjectStatusType | null;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = async (
    request: NextRequest,
    context: { params: Promise<{ projectId: string }> }
): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<ILifecycleBody>(request);
    const hasValidStatus =
        body &&
        (body.status === null || (typeof body.status === 'string' && Object.values(PROJECT_STATUS).includes(body.status)));

    if (!hasValidStatus) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Missing or invalid lifecycle status. Use: in-progress | live | archived | null',
            },
            { status: 400 }
        );
    }

    const { projectId } = await context.params;
    return toHttp(await setProjectLifecycleStatus(projectId, body.status));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/projects/:projectId/lifecycle',
        methods: ['PATCH'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            status: 'in-progress | live | archived | null (required)',
        },
        responseExamples: {
            patch200: { success: true, status: 200, message: 'Project status changed to live', data: true },
        },
    });
};

/*
JSON body example for PATCH /api/admin/content/projects/:projectId/lifecycle
{
  "status": "live"
}
*/
