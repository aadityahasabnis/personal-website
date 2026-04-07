import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import { NextRequest, NextResponse } from 'next/server';

import {
    bulkArchiveProjects,
    bulkDraftProjects,
    bulkPublishProjects,
} from '@/server/new/admin/content/project/actions';
import {
    changeProjectPublishStatus,
    setProjectArchived,
    setProjectDraft,
    setProjectPublished,
} from '@/server/new/admin/content/project/publishProject';

import { parseJsonBody, requireAdmin, toHttp } from '../../../_shared';

type ProjectParityAction =
    | 'bulk-publish'
    | 'bulk-archive'
    | 'bulk-draft'
    | 'change-status'
    | 'set-published'
    | 'set-draft'
    | 'set-archived';

interface IProjectParityBody {
    action: ProjectParityAction;
    projectId?: string;
    projectIds?: string[];
    status?: PublishStatusType;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const body = await parseJsonBody<IProjectParityBody>(request);
        if (!body?.action) {
            return NextResponse.json({ success: false, status: 400, error: 'Missing action' }, { status: 400 });
        }

        switch (body.action) {
            case 'bulk-publish':
                if (!Array.isArray(body.projectIds)) return NextResponse.json({ success: false, status: 400, error: 'Missing projectIds' }, { status: 400 });
                return toHttp(await bulkPublishProjects(body.projectIds));
            case 'bulk-archive':
                if (!Array.isArray(body.projectIds)) return NextResponse.json({ success: false, status: 400, error: 'Missing projectIds' }, { status: 400 });
                return toHttp(await bulkArchiveProjects(body.projectIds));
            case 'bulk-draft':
                if (!Array.isArray(body.projectIds)) return NextResponse.json({ success: false, status: 400, error: 'Missing projectIds' }, { status: 400 });
                return toHttp(await bulkDraftProjects(body.projectIds));
            case 'change-status':
                if (!body.projectId || !body.status || !Object.values(PUBLISH_STATUS).includes(body.status)) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing or invalid projectId/status' }, { status: 400 });
                }
                return toHttp(await changeProjectPublishStatus(body.projectId, body.status));
            case 'set-published':
                if (!body.projectId) return NextResponse.json({ success: false, status: 400, error: 'Missing projectId' }, { status: 400 });
                return toHttp(await setProjectPublished(body.projectId));
            case 'set-draft':
                if (!body.projectId) return NextResponse.json({ success: false, status: 400, error: 'Missing projectId' }, { status: 400 });
                return toHttp(await setProjectDraft(body.projectId));
            case 'set-archived':
                if (!body.projectId) return NextResponse.json({ success: false, status: 400, error: 'Missing projectId' }, { status: 400 });
                return toHttp(await setProjectArchived(body.projectId));
            default:
                return NextResponse.json({ success: false, status: 400, error: 'Unsupported action' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ success: false, status: 500, error: 'Internal Server Error' }, { status: 500 });
    }
};
