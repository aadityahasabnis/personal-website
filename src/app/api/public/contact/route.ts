import { NextRequest, NextResponse } from 'next/server';

import { submitPublicContact, type ISubmitPublicContactInput } from '@/server/new/public/contact';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const body = (await request.json()) as ISubmitPublicContactInput;
        const forwarded = request.headers.get('x-forwarded-for');
        const real = request.headers.get('x-real-ip');
        const ipAddress = forwarded?.split(',')[0]?.trim() || real || null;

        const result = await submitPublicContact({
            ...body,
            ...(ipAddress ? { ipAddress } : {}),
        });

        return NextResponse.json(result, {
            status: result.status,
        });
    } catch {
        return NextResponse.json(
            { success: false, status: 500, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};
