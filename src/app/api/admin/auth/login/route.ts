import { NextRequest, NextResponse } from 'next/server';

interface ILoginBody {
    email: string;
    password: string;
}

const getSetCookies = (headers: Headers): string[] => {
    const maybeHeaders = headers as Headers & { getSetCookie?: () => string[] };
    if (typeof maybeHeaders.getSetCookie === 'function') return maybeHeaders.getSetCookie();

    const raw = headers.get('set-cookie');
    return raw ? [raw] : [];
};

const cookiePairs = (setCookies: string[]): string[] =>
    setCookies.map((cookie) => cookie.split(';')[0]).filter(Boolean);

const hasSessionCookie = (setCookies: string[]): boolean =>
    setCookies.some((cookie) => /(?:^|;)\s*(?:__Secure-)?(?:next-auth|authjs)\.session-token=/.test(cookie));

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    let body: ILoginBody;
    try {
        body = (await request.json()) as ILoginBody;
    } catch {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Invalid JSON body',
            },
            { status: 400 }
        );
    }

    if (!body?.email || !body?.password) {
        return NextResponse.json(
            {
                success: false,
                status: 400,
                error: 'Email and password are required',
            },
            { status: 400 }
        );
    }

    const origin = new URL(request.url).origin;
    const initialCookie = request.headers.get('cookie') ?? '';

    const csrfFetchInit: RequestInit = {
        method: 'GET',
        cache: 'no-store',
        ...(initialCookie ? { headers: { cookie: initialCookie } } : {}),
    };

    const csrfResponse = await fetch(`${origin}/api/auth/csrf`, csrfFetchInit);

    if (!csrfResponse.ok) {
        return NextResponse.json(
            {
                success: false,
                status: 500,
                error: 'Failed to initialize auth flow (csrf)',
            },
            { status: 500 }
        );
    }

    const csrfJson = (await csrfResponse.json()) as { csrfToken?: string };
    if (!csrfJson?.csrfToken) {
        return NextResponse.json(
            {
                success: false,
                status: 500,
                error: 'Invalid csrf response from auth provider',
            },
            { status: 500 }
        );
    }

    const csrfSetCookies = getSetCookies(csrfResponse.headers);
    const csrfCookieHeader = cookiePairs(csrfSetCookies).join('; ');

    const callbackCookies = [initialCookie, csrfCookieHeader].filter(Boolean).join('; ');

    const formData = new URLSearchParams({
        csrfToken: csrfJson.csrfToken,
        email: body.email,
        password: body.password,
        json: 'true',
        callbackUrl: '/admin',
    });

    const callbackResponse = await fetch(`${origin}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...(callbackCookies ? { cookie: callbackCookies } : {}),
        },
        body: formData.toString(),
        redirect: 'manual',
        cache: 'no-store',
    });

    const callbackJson = (await callbackResponse.json().catch(() => ({}))) as { url?: string };
    const locationHeader = callbackResponse.headers.get('location');
    const callbackSetCookies = getSetCookies(callbackResponse.headers);

    const hasError =
        (typeof callbackJson.url === 'string' && callbackJson.url.includes('error=')) ||
        (typeof locationHeader === 'string' && locationHeader.includes('error='));

    const loginSucceeded = hasSessionCookie(callbackSetCookies) || callbackResponse.ok;

    if (hasError || !loginSucceeded) {
        return NextResponse.json(
            {
                success: false,
                status: 401,
                error: 'Invalid credentials',
                details: callbackJson.url ?? locationHeader ?? null,
            },
            { status: 401 }
        );
    }

    const response = NextResponse.json({
        success: true,
        status: 200,
        message: 'Login successful. Session cookie has been set.',
        data: {
            authType: 'cookie-session',
            bearerToken: null,
            nextStep: 'Call GET /api/admin/auth/session to verify login state.',
        },
    });

    for (const cookie of callbackSetCookies) {
        response.headers.append('set-cookie', cookie);
    }

    return response;
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/auth/login',
        methods: ['POST'],
        authType: 'Cookie session (NextAuth)',
        bodySchema: {
            email: 'string required',
            password: 'string required',
        },
        responseExamples: {
            success200: {
                success: true,
                status: 200,
                message: 'Login successful. Session cookie has been set.',
                data: {
                    authType: 'cookie-session',
                    bearerToken: null,
                    nextStep: 'Call GET /api/admin/auth/session to verify login state.',
                },
            },
            invalidCredentials401: {
                success: false,
                status: 401,
                error: 'Invalid credentials',
            },
        },
        testCases: [
            {
                name: 'Valid login',
                request: {
                    method: 'POST',
                    url: '/api/admin/auth/login',
                    body: {
                        email: 'admin@example.com',
                        password: 'your-admin-password',
                    },
                },
                expectedStatus: 200,
                expectedChecks: [
                    'success=true',
                    'set-cookie header includes next-auth/authjs session token',
                ],
            },
            {
                name: 'Invalid login',
                request: {
                    method: 'POST',
                    url: '/api/admin/auth/login',
                    body: {
                        email: 'admin@example.com',
                        password: 'wrong-password',
                    },
                },
                expectedStatus: 401,
                expectedChecks: ['success=false', 'error=Invalid credentials'],
            },
        ],
        bodyExample: {
            email: 'admin@example.com',
            password: 'your-admin-password',
        },
        postmanNotes: [
            'Postman must keep cookies enabled.',
            'No Bearer token is returned by this endpoint.',
            'Use the same domain and workspace for subsequent admin API calls.',
        ],
        errorCases: [
            {
                code: 400,
                when: 'Missing email/password or invalid JSON body',
                sample: '{ "email": "" }',
            },
            {
                code: 401,
                when: 'Invalid credentials',
                sample: '{ "email": "wrong@admin.com", "password": "bad" }',
            },
            {
                code: 500,
                when: 'CSRF/bootstrap auth callback failed',
                sample: 'Temporary auth provider error',
            },
        ],
    });
};
