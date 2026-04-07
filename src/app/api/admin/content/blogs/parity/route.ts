import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import { NextRequest, NextResponse } from 'next/server';

import {
    bulkArchiveBlogs,
    bulkDraftBlogs,
    bulkPublishBlogs,
    toggleBlogFeatured,
} from '@/server/new/admin/content/blog/actions';
import {
    changeBlogPublishStatus,
    setBlogArchived,
    setBlogDraft,
    setBlogPublished,
} from '@/server/new/admin/content/blog/publishBlog';

import { parseJsonBody, requireAdmin, toHttp } from '../../../_shared';

type BlogParityAction =
    | 'toggle-featured'
    | 'bulk-publish'
    | 'bulk-archive'
    | 'bulk-draft'
    | 'change-status'
    | 'set-published'
    | 'set-draft'
    | 'set-archived';

interface IBlogParityBody {
    action: BlogParityAction;
    blogId?: string;
    blogIds?: string[];
    status?: PublishStatusType;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const body = await parseJsonBody<IBlogParityBody>(request);
        if (!body?.action) {
            return NextResponse.json({ success: false, status: 400, error: 'Missing action' }, { status: 400 });
        }

        switch (body.action) {
            case 'toggle-featured':
                if (!body.blogId) return NextResponse.json({ success: false, status: 400, error: 'Missing blogId' }, { status: 400 });
                return toHttp(await toggleBlogFeatured(body.blogId));
            case 'bulk-publish':
                if (!Array.isArray(body.blogIds)) return NextResponse.json({ success: false, status: 400, error: 'Missing blogIds' }, { status: 400 });
                return toHttp(await bulkPublishBlogs(body.blogIds));
            case 'bulk-archive':
                if (!Array.isArray(body.blogIds)) return NextResponse.json({ success: false, status: 400, error: 'Missing blogIds' }, { status: 400 });
                return toHttp(await bulkArchiveBlogs(body.blogIds));
            case 'bulk-draft':
                if (!Array.isArray(body.blogIds)) return NextResponse.json({ success: false, status: 400, error: 'Missing blogIds' }, { status: 400 });
                return toHttp(await bulkDraftBlogs(body.blogIds));
            case 'change-status':
                if (!body.blogId || !body.status || !Object.values(PUBLISH_STATUS).includes(body.status)) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing or invalid blogId/status' }, { status: 400 });
                }
                return toHttp(await changeBlogPublishStatus(body.blogId, body.status));
            case 'set-published':
                if (!body.blogId) return NextResponse.json({ success: false, status: 400, error: 'Missing blogId' }, { status: 400 });
                return toHttp(await setBlogPublished(body.blogId));
            case 'set-draft':
                if (!body.blogId) return NextResponse.json({ success: false, status: 400, error: 'Missing blogId' }, { status: 400 });
                return toHttp(await setBlogDraft(body.blogId));
            case 'set-archived':
                if (!body.blogId) return NextResponse.json({ success: false, status: 400, error: 'Missing blogId' }, { status: 400 });
                return toHttp(await setBlogArchived(body.blogId));
            default:
                return NextResponse.json({ success: false, status: 400, error: 'Unsupported action' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ success: false, status: 500, error: 'Internal Server Error' }, { status: 500 });
    }
};
