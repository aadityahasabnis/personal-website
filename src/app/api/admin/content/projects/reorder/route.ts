import { PROJECT_STATUS, type ProjectStatusType } from '@/constants/schemaConstants';
import { NextRequest, NextResponse } from 'next/server';

import { reorderProjects } from '@/server/new/admin/content/project';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

interface IReorderBody {
    projectIds: string[];
    status?: ProjectStatusType | null;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IReorderBody>(request);
    if (!body || !Array.isArray(body.projectIds)) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Invalid body. Expected: { projectIds: string[], status?: in-progress|live|archived|null }',
            },
            { status: 400 }
        );
    }

    const hasValidStatus =
        body.status === undefined ||
        body.status === null ||
        (typeof body.status === 'string' && Object.values(PROJECT_STATUS).includes(body.status));

    if (!hasValidStatus) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Invalid status. Use: in-progress | live | archived | null',
            },
            { status: 400 }
        );
    }

    return toHttp(await reorderProjects(body.projectIds, body.status));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/projects/reorder',
        methods: ['POST'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            projectIds: 'string[] required (ordered ObjectId list)',
            status: 'in-progress | live | archived | null optional scope',
        },
        responseExamples: {
            reorder200: { success: true, status: 200, message: 'Projects reordered successfully', data: true },
        },
    });
};

/*
JSON body example for POST /api/admin/content/projects/reorder
{
  "projectIds": ["65f1502cdc9bc503f8d7d001", "65f1502cdc9bc503f8d7d002"],
  "status": "live"
}
*/
