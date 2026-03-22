import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { unsubscribe } from '@/server/new/public/subscribe';

import { parseJsonBody, toHttp } from '../_shared';

interface IUnsubscribeBody {
    email: string;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const body = await parseJsonBody<IUnsubscribeBody>(request);
    if (!body) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Invalid JSON body',
            },
            { status: 400 }
        );
    }

    return toHttp(await unsubscribe({ email: body.email }));
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/unsubscribe',
        methods: ['POST'],
        bodySchema: {
            email: 'string required',
        },
        action: 'unsubscribe',
    });
};
