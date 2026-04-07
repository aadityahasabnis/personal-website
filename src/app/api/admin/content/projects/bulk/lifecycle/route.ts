import { PROJECT_STATUS, type ProjectStatusType } from '@/constants/schemaConstants';
import { NextRequest, NextResponse } from 'next/server';

import { bulkSetProjectLifecycleStatus } from '@/server/new/admin/content/project';

import { parseJsonBody, requireAdmin, toHttp } from '../../_shared';

interface IBulkLifecycleBody {
    projectIds: string[];
    status: ProjectStatusType | null;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IBulkLifecycleBody>(request);
    const hasValidStatus =
        body &&
        Array.isArray(body.projectIds) &&
        (body.status === null || (typeof body.status === 'string' && Object.values(PROJECT_STATUS).includes(body.status)));

    if (!hasValidStatus) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Invalid body. Expected: { projectIds: string[], status: in-progress|live|archived|null }',
            },
            { status: 400 }
        );
    }

    return toHttp(await bulkSetProjectLifecycleStatus(body.projectIds, body.status));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/projects/bulk/lifecycle',
        methods: ['PATCH'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            projectIds: 'string[] required (ObjectId list)',
            status: 'in-progress | live | archived | null (required)',
        },
    });
};

/*
JSON body example for PATCH /api/admin/content/projects/bulk/lifecycle
{
  "projectIds": ["65f1502cdc9bc503f8d7d001", "65f1502cdc9bc503f8d7d002"],
  "status": null
}
*/
