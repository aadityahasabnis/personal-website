import { PROJECT_STATUS, PUBLISH_STATUS, type ProjectStatusType, type PublishStatusType } from '@/constants/schemaConstants';
import { NextRequest, NextResponse } from 'next/server';

import {
    bulkDeleteProjects,
    bulkSetProjectLifecycleStatus,
    bulkSetProjectStatus,
} from '@/server/new/admin/content/project';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

type BulkActionType = 'set-status' | 'set-lifecycle-status' | 'delete';

interface IBulkBody {
    action: BulkActionType;
    status?: PublishStatusType;
    lifecycleStatus?: ProjectStatusType | null;
    projectIds: string[];
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const unauthorized = await requireAdmin();
    if (unauthorized) return unauthorized;

    const body = await parseJsonBody<IBulkBody>(request);
    if (!body?.action || !Array.isArray(body.projectIds)) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Missing action or projectIds[]',
            },
            { status: 400 }
        );
    }

    switch (body.action) {
        case 'set-status':
            if (!body.status || !Object.values(PUBLISH_STATUS).includes(body.status)) {
                return NextResponse.json(
                    {
                        success: false,
                        status: 400,
                        error: 'Missing or invalid status. Use: draft | published | archived',
                    },
                    { status: 400 }
                );
            }
            return toHttp(await bulkSetProjectStatus(body.projectIds, body.status));

        case 'set-lifecycle-status': {
            const lifecycle = body.lifecycleStatus;
            const lifecycleOk =
                lifecycle === null ||
                (typeof lifecycle === 'string' && Object.values(PROJECT_STATUS).includes(lifecycle));

            if (!lifecycleOk) {
                return NextResponse.json(
                    {
                        success: false,
                        status: 400,
                        error: 'Missing or invalid lifecycleStatus. Use: in-progress | live | archived | null',
                    },
                    { status: 400 }
                );
            }

            return toHttp(await bulkSetProjectLifecycleStatus(body.projectIds, lifecycle));
        }

        case 'delete':
            return toHttp(await bulkDeleteProjects(body.projectIds));

        default:
            return NextResponse.json(
                {
                    success: false,
                    status: 400,
                    error: 'Unsupported action',
                },
                { status: 400 }
            );
    }
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/content/projects/bulk',
        methods: ['POST'],
        auth: 'Required: NextAuth admin session cookie',
        bodySchema: {
            action: 'set-status | set-lifecycle-status | delete',
            status: 'draft | published | archived (required when action=set-status)',
            lifecycleStatus: 'in-progress | live | archived | null (required when action=set-lifecycle-status)',
            projectIds: 'string[] required (ObjectId list)',
        },
        responseExamples: {
            bulk200: { success: true, status: 200, message: 'Bulk action completed', data: true },
        },
    });
};

/*
JSON body examples for POST /api/admin/content/projects/bulk
{
  "action": "set-status",
  "status": "published",
  "projectIds": ["65f1502cdc9bc503f8d7d001", "65f1502cdc9bc503f8d7d002"]
}

{
  "action": "set-lifecycle-status",
  "lifecycleStatus": "live",
  "projectIds": ["65f1502cdc9bc503f8d7d001", "65f1502cdc9bc503f8d7d002"]
}

{
  "action": "delete",
  "projectIds": ["65f1502cdc9bc503f8d7d001", "65f1502cdc9bc503f8d7d002"]
}
*/
