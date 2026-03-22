import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { submitPublicContact } from '@/server/new/public/contact';

import { parseJsonBody, toHttp } from '../_shared';

interface ISubmitPublicContactBody {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    const body = await parseJsonBody<ISubmitPublicContactBody>(request);
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

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

    return toHttp(
        await submitPublicContact({
            name: body.name,
            email: body.email,
            subject: body.subject,
            message: body.message,
            ...(ipAddress ? { ipAddress } : {}),
        })
    );
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/content/contact',
        methods: ['POST'],
        bodySchema: {
            name: 'string required',
            email: 'string required',
            subject: 'string required',
            message: 'string required',
        },
        action: 'submitPublicContact',
    });
};
