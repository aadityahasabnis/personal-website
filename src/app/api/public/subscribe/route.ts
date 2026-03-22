import { NextRequest, NextResponse } from 'next/server';

import {
    subscribe,
    unsubscribe,
    type ISubscribeInput,
    type IUnsubscribeInput,
} from '@/server/new/public/subscribe';

type SubscriptionAction = 'subscribe' | 'unsubscribe';

interface ISubscriptionBody {
    action: SubscriptionAction;
    payload?: ISubscribeInput | IUnsubscribeInput;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const body = (await request.json()) as ISubscriptionBody;

        if (body.action === 'subscribe') {
            const result = await subscribe((body.payload ?? {}) as ISubscribeInput);
            return NextResponse.json(result, {
                status: result.status,
            });
        }

        if (body.action === 'unsubscribe') {
            const result = await unsubscribe((body.payload ?? {}) as IUnsubscribeInput);
            return NextResponse.json(result, {
                status: result.status,
            });
        }

        return NextResponse.json(
            { success: false, status: 400, error: 'Unsupported action' },
            { status: 400 }
        );
    } catch {
        return NextResponse.json(
            { success: false, status: 500, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};
