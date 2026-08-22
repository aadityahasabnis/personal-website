import { NextRequest, NextResponse } from 'next/server';

import { submitPublicContact, type ISubmitPublicContactInput } from '@/server/new/public/contact';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_ORIGINS = new Set(['https://aadityahasabnis.github.io']);
const CORS_METHODS = 'POST, OPTIONS';
const CORS_HEADERS = 'Content-Type';
const CORS_MAX_AGE_SECONDS = '86400';

const isLocalDevOrigin = (origin: string): boolean => {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/u.test(origin);
};

const resolveAllowedOrigin = (origin: string | null): string | null => {
    if (!origin) {
        return null;
    }

    if (ALLOWED_ORIGINS.has(origin)) {
        return origin;
    }

    if (process.env.NODE_ENV !== 'production' && (isLocalDevOrigin(origin) || origin === 'null')) {
        return origin;
    }

    return null;
};

const withCorsHeaders = (request: NextRequest, response: NextResponse): NextResponse => {
    const allowedOrigin = resolveAllowedOrigin(request.headers.get('origin'));

    if (allowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
        response.headers.append('Vary', 'Origin');
    }

    response.headers.set('Access-Control-Allow-Methods', CORS_METHODS);
    response.headers.set('Access-Control-Allow-Headers', CORS_HEADERS);
    response.headers.set('Access-Control-Max-Age', CORS_MAX_AGE_SECONDS);

    return response;
};

export const OPTIONS = async (request: NextRequest): Promise<NextResponse> => {
    return withCorsHeaders(request, new NextResponse(null, { status: 204 }));
};

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

        return withCorsHeaders(
            request,
            NextResponse.json(result, {
                status: result.status,
            })
        );
    } catch {
        return withCorsHeaders(
            request,
            NextResponse.json(
                { success: false, status: 500, error: 'Internal Server Error' },
                { status: 500 }
            )
        );
    }
};
