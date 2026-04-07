import { auth } from '@/lib/auth/admin';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (): Promise<NextResponse> => {
    const session = await auth();

    return NextResponse.json({
        success: true,
        status: 200,
        data: {
            isAuthenticated: Boolean(session?.user),
            user: session?.user ?? null,
        },
    });
};

export const OPTIONS = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/auth/session',
        methods: ['GET'],
        purpose: 'Check whether current request contains a valid admin session cookie.',
        responseContract: {
            success: 'boolean',
            status: 'number',
            data: {
                isAuthenticated: 'boolean',
                user: 'session user object | null',
            },
        },
        expected: {
            loggedIn: {
                isAuthenticated: true,
                user: {
                    id: 'admin-user-id',
                    email: 'admin@example.com',
                    name: 'Admin Name',
                    image: null,
                },
            },
            loggedOut: {
                isAuthenticated: false,
                user: null,
            },
        },
        tests: [
            {
                name: 'Session present',
                request: 'GET /api/admin/auth/session with cookie jar from login',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data.isAuthenticated=true', 'data.user != null'],
            },
            {
                name: 'No session',
                request: 'GET /api/admin/auth/session without cookies',
                expectedStatus: 200,
                expectedChecks: ['success=true', 'data.isAuthenticated=false', 'data.user=null'],
            },
        ],
    });
};
