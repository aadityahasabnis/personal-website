import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import { NextRequest, NextResponse } from 'next/server';

import {
    bulkArchiveArticles,
    bulkDraftArticles,
    bulkPublishArticles,
    toggleArticleFeatured,
} from '@/server/new/admin/content/article/actions';
import {
    changeArticlePublishStatus,
    setArticleArchived,
    setArticleDraft,
    setArticlePublished,
} from '@/server/new/admin/content/article/publishArticle';

import { parseJsonBody, requireAdmin, toHttp } from '../../../_shared';

type ArticleParityAction =
    | 'toggle-featured'
    | 'bulk-publish'
    | 'bulk-archive'
    | 'bulk-draft'
    | 'change-status'
    | 'set-published'
    | 'set-draft'
    | 'set-archived';

interface IArticleParityBody {
    action: ArticleParityAction;
    articleId?: string;
    articleIds?: string[];
    status?: PublishStatusType;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const body = await parseJsonBody<IArticleParityBody>(request);
        if (!body?.action) {
            return NextResponse.json({ success: false, status: 400, error: 'Missing action' }, { status: 400 });
        }

        switch (body.action) {
            case 'toggle-featured':
                if (!body.articleId) return NextResponse.json({ success: false, status: 400, error: 'Missing articleId' }, { status: 400 });
                return toHttp(await toggleArticleFeatured(body.articleId));
            case 'bulk-publish':
                if (!Array.isArray(body.articleIds)) return NextResponse.json({ success: false, status: 400, error: 'Missing articleIds' }, { status: 400 });
                return toHttp(await bulkPublishArticles(body.articleIds));
            case 'bulk-archive':
                if (!Array.isArray(body.articleIds)) return NextResponse.json({ success: false, status: 400, error: 'Missing articleIds' }, { status: 400 });
                return toHttp(await bulkArchiveArticles(body.articleIds));
            case 'bulk-draft':
                if (!Array.isArray(body.articleIds)) return NextResponse.json({ success: false, status: 400, error: 'Missing articleIds' }, { status: 400 });
                return toHttp(await bulkDraftArticles(body.articleIds));
            case 'change-status':
                if (!body.articleId || !body.status || !Object.values(PUBLISH_STATUS).includes(body.status)) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing or invalid articleId/status' }, { status: 400 });
                }
                return toHttp(await changeArticlePublishStatus(body.articleId, body.status));
            case 'set-published':
                if (!body.articleId) return NextResponse.json({ success: false, status: 400, error: 'Missing articleId' }, { status: 400 });
                return toHttp(await setArticlePublished(body.articleId));
            case 'set-draft':
                if (!body.articleId) return NextResponse.json({ success: false, status: 400, error: 'Missing articleId' }, { status: 400 });
                return toHttp(await setArticleDraft(body.articleId));
            case 'set-archived':
                if (!body.articleId) return NextResponse.json({ success: false, status: 400, error: 'Missing articleId' }, { status: 400 });
                return toHttp(await setArticleArchived(body.articleId));
            default:
                return NextResponse.json({ success: false, status: 400, error: 'Unsupported action' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ success: false, status: 500, error: 'Internal Server Error' }, { status: 500 });
    }
};
