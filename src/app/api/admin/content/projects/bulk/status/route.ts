import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import { NextRequest, NextResponse } from 'next/server';

import { bulkSetProjectStatus } from '@/server/new/admin/content/project';

import { parseJsonBody, requireAdmin, toHttp } from '../../_shared';

interface IBulkStatusBody {
    projectIds: string[];
    status: PublishStatusType;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IBulkStatusBody>(request);
    if (!Array.isArray(body?.projectIds) || !body.status || !Object.values(PUBLISH_STATUS).includes(body.status)) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Invalid body. Expected: { projectIds: string[], status: draft|published|archived }',
            },
            { status: 400 }
        );
    }

    return toHttp(await bulkSetProjectStatus(body.projectIds, body.status));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/projects/bulk/status',
        methods: ['PATCH'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            projectIds: 'string[] required (ObjectId list)',
            status: 'draft | published | archived (required)',
        },
    });
};

/*
JSON body example for PATCH /api/admin/content/projects/bulk/status
{
  "projectIds": ["65f1502cdc9bc503f8d7d001", "65f1502cdc9bc503f8d7d002"],
  "status": "archived"
}
*/
