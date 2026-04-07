import type { ContentType } from '@/constants/schemaConstants';
import { NextRequest, NextResponse } from 'next/server';

import {
    adminReplyToComment,
    approveComment,
    bulkApproveComments,
    bulkDeleteComments,
    deleteComment,
    getComments,
    getCommentStats,
    rejectComment,
    type AdminCommentFilter,
    type AdminCommentGroupBy,
    type IAdminCommentsTableQuery,
    type IAdminReplyInput,
} from '@/server/new/admin/comments';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

type CommentMutationAction =
    | 'approve'
    | 'reject'
    | 'delete'
    | 'bulk-approve'
    | 'bulk-delete'
    | 'reply';

interface ICommentMutationBody {
    action: CommentMutationAction;
    commentId?: string;
    commentIds?: string[];
    reply?: IAdminReplyInput;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const { searchParams } = new URL(request.url);
        if (searchParams.get('action') === 'stats') {
            return toHttp(await getCommentStats());
        }

        const params: IAdminCommentsTableQuery = {};

        const filter = searchParams.get('filter');
        if (filter) params.filter = filter as AdminCommentFilter;

        const contentId = searchParams.get('contentId');
        if (contentId) params.contentId = contentId;

        const contentType = searchParams.get('contentType');
        if (contentType) params.contentType = contentType as ContentType;

        const parentId = searchParams.get('parentId');
        if (parentId) params.parentId = parentId;

        const query = searchParams.get('query');
        if (query) params.query = query;

        const groupBy = searchParams.get('groupBy');
        if (groupBy) params.groupBy = groupBy as AdminCommentGroupBy;

        const offsetRaw = searchParams.get('offset');
        const limitRaw = searchParams.get('limit');
        if (offsetRaw !== null || limitRaw !== null) {
            params.pagination = {
                ...(offsetRaw !== null ? { offset: Number.parseInt(offsetRaw, 10) || 0 } : {}),
                ...(limitRaw !== null ? { limit: Number.parseInt(limitRaw, 10) || 20 } : {}),
            };
        }

        const sortBy = searchParams.get('sortBy');
        const sortOrder = searchParams.get('sortOrder');
        if (sortBy || sortOrder) {
            params.sort = {
                ...(sortBy ? { sortBy } : {}),
                ...(sortOrder === 'asc' || sortOrder === 'desc' ? { sortOrder } : {}),
            };
        }

        return toHttp(await getComments(params));
    } catch {
        return NextResponse.json({ success: false, status: 500, error: 'Internal Server Error' }, { status: 500 });
    }
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const body = await parseJsonBody<ICommentMutationBody>(request);
        if (!body?.action) {
            return NextResponse.json({ success: false, status: 400, error: 'Missing action' }, { status: 400 });
        }

        switch (body.action) {
            case 'approve':
                if (!body.commentId) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing commentId' }, { status: 400 });
                }
                return toHttp(await approveComment(body.commentId));
            case 'reject':
                if (!body.commentId) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing commentId' }, { status: 400 });
                }
                return toHttp(await rejectComment(body.commentId));
            case 'delete':
                if (!body.commentId) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing commentId' }, { status: 400 });
                }
                return toHttp(await deleteComment(body.commentId));
            case 'bulk-approve':
                if (!Array.isArray(body.commentIds)) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing commentIds' }, { status: 400 });
                }
                return toHttp(await bulkApproveComments(body.commentIds));
            case 'bulk-delete':
                if (!Array.isArray(body.commentIds)) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing commentIds' }, { status: 400 });
                }
                return toHttp(await bulkDeleteComments(body.commentIds));
            case 'reply':
                if (!body.reply) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing reply payload' }, { status: 400 });
                }
                return toHttp(await adminReplyToComment(body.reply));
            default:
                return NextResponse.json({ success: false, status: 400, error: 'Unsupported action' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ success: false, status: 500, error: 'Internal Server Error' }, { status: 500 });
    }
};
