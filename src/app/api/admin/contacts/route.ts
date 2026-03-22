import { NextRequest, NextResponse } from 'next/server';

import {
    archiveContact,
    bulkArchiveContacts,
    bulkDeleteContacts,
    deleteContact,
    getContactById,
    getContacts,
    getContactStats,
    markContactAsRead,
    markContactAsReplied,
    unarchiveContact,
    type ContactFilter,
    type IContactsTableQuery,
} from '@/server/new/admin/contacts';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

type ContactMutationAction =
    | 'archive'
    | 'unarchive'
    | 'mark-read'
    | 'mark-replied'
    | 'delete'
    | 'bulk-archive'
    | 'bulk-delete';

interface IContactMutationBody {
    action: ContactMutationAction;
    contactId?: string;
    contactIds?: string[];
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const { searchParams } = new URL(request.url);

        const action = searchParams.get('action');
        if (action === 'stats') return toHttp(await getContactStats());

        const contactId = searchParams.get('contactId');
        if (contactId) return toHttp(await getContactById(contactId));

        const params: IContactsTableQuery = {};

        const status = searchParams.get('status');
        if (status) params.status = status as ContactFilter;

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

        return toHttp(await getContacts(params));
    } catch {
        return NextResponse.json({ success: false, status: 500, error: 'Internal Server Error' }, { status: 500 });
    }
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const body = await parseJsonBody<IContactMutationBody>(request);
        if (!body?.action) {
            return NextResponse.json({ success: false, status: 400, error: 'Missing action' }, { status: 400 });
        }

        switch (body.action) {
            case 'archive':
                if (!body.contactId) return NextResponse.json({ success: false, status: 400, error: 'Missing contactId' }, { status: 400 });
                return toHttp(await archiveContact(body.contactId));
            case 'unarchive':
                if (!body.contactId) return NextResponse.json({ success: false, status: 400, error: 'Missing contactId' }, { status: 400 });
                return toHttp(await unarchiveContact(body.contactId));
            case 'mark-read':
                if (!body.contactId) return NextResponse.json({ success: false, status: 400, error: 'Missing contactId' }, { status: 400 });
                return toHttp(await markContactAsRead(body.contactId));
            case 'mark-replied':
                if (!body.contactId) return NextResponse.json({ success: false, status: 400, error: 'Missing contactId' }, { status: 400 });
                return toHttp(await markContactAsReplied(body.contactId));
            case 'delete':
                if (!body.contactId) return NextResponse.json({ success: false, status: 400, error: 'Missing contactId' }, { status: 400 });
                return toHttp(await deleteContact(body.contactId));
            case 'bulk-archive':
                if (!Array.isArray(body.contactIds)) return NextResponse.json({ success: false, status: 400, error: 'Missing contactIds' }, { status: 400 });
                return toHttp(await bulkArchiveContacts(body.contactIds));
            case 'bulk-delete':
                if (!Array.isArray(body.contactIds)) return NextResponse.json({ success: false, status: 400, error: 'Missing contactIds' }, { status: 400 });
                return toHttp(await bulkDeleteContacts(body.contactIds));
            default:
                return NextResponse.json({ success: false, status: 400, error: 'Unsupported action' }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ success: false, status: 500, error: 'Internal Server Error' }, { status: 500 });
    }
};
