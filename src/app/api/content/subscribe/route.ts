import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { subscribe } from '@/server/new/public/subscribe';

import { parseJsonBody, toHttp } from '../_shared';

interface ISubscribeBody {
    email: string;
    name: string;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const body = await parseJsonBody<ISubscribeBody>(request);
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

    return toHttp(
        await subscribe({
            email: body.email,
            name: body.name,
        })
    );
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/subscribe',
        methods: ['POST'],
        bodySchema: {
            email: 'string required',
            name: 'string required',
        },
        action: 'subscribe',
    });
};
