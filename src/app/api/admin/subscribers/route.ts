import { NextRequest, NextResponse } from 'next/server';

import {
    bulkDeleteSubscribers,
    confirmSubscriber,
    deleteSubscriber,
    exportSubscribers,
    getSubscribers,
    getSubscriberStats,
    markSubscriberPending,
    type ISubscribersTableQuery,
    type SubscriberFilter,
} from '@/server/new/admin/subscribers';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

type SubscriberMutationAction = 'confirm' | 'mark-pending' | 'delete' | 'bulk-delete' | 'export';

interface ISubscriberMutationBody {
    action: SubscriberMutationAction;
    subscriberId?: string;
    subscriberIds?: string[];
    filter?: SubscriberFilter;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const { searchParams } = new URL(request.url);

        if (searchParams.get('action') === 'stats') {
            return toHttp(await getSubscriberStats());
        }

        const params: ISubscribersTableQuery = {};

        const filter = searchParams.get('filter');
        if (filter) params.filter = filter as SubscriberFilter;

        const query = searchParams.get('query');
        if (query) params.query = query;

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

        return toHttp(await getSubscribers(params));
    } catch {
        return NextResponse.json({ success: false, status: 500, error: 'Internal Server Error' }, { status: 500 });
    }
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const body = await parseJsonBody<ISubscriberMutationBody>(request);
        if (!body?.action) {
            return NextResponse.json({ success: false, status: 400, error: 'Missing action' }, { status: 400 });
        }

        switch (body.action) {
            case 'confirm':
                if (!body.subscriberId) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing subscriberId' }, { status: 400 });
                }
                return toHttp(await confirmSubscriber(body.subscriberId));
            case 'mark-pending':
                if (!body.subscriberId) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing subscriberId' }, { status: 400 });
                }
                return toHttp(await markSubscriberPending(body.subscriberId));
            case 'delete':
                if (!body.subscriberId) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing subscriberId' }, { status: 400 });
                }
                return toHttp(await deleteSubscriber(body.subscriberId));
            case 'bulk-delete':
                if (!Array.isArray(body.subscriberIds)) {
                    return NextResponse.json({ success: false, status: 400, error: 'Missing subscriberIds' }, { status: 400 });
                }
                return toHttp(await bulkDeleteSubscribers(body.subscriberIds));
            case 'export':
                return toHttp(await exportSubscribers(body.filter ?? 'all'));
            default:
                return NextResponse.json({ success: false, status: 400, error: 'Unsupported action' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ success: false, status: 500, error: 'Internal Server Error' }, { status: 500 });
    }
};
