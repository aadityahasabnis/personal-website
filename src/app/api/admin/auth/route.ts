import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = (): NextResponse => {
    return NextResponse.json({
        endpoint: '/api/admin/auth',
        authModel: {
            type: 'cookie-session',
            provider: 'NextAuth (credentials)',
            bearerToken: false,
            note: 'Admin APIs use NextAuth session cookies, not Bearer tokens.',
        },
        routes: {
            login: 'POST /api/admin/auth/login',
            session: 'GET /api/admin/auth/session',
            logout: 'POST /api/auth/signout (native NextAuth endpoint)',
        },
        requestSchemas: {
            login: {
                email: 'string required',
                password: 'string required',
            },
        },
        responseExamples: {
            loginSuccess200: {
                success: true,
                status: 200,
                message: 'Login successful. Session cookie has been set.',
                data: {
                    authType: 'cookie-session',
                    bearerToken: null,
                    nextStep: 'Call GET /api/admin/auth/session to verify login state.',
                },
            },
            session200LoggedIn: {
                success: true,
                status: 200,
                data: {
                    isAuthenticated: true,
                    user: {
                        id: 'admin-user-id',
                        email: 'admin@example.com',
                        name: 'Admin Name',
                        image: null,
                    },
                },
            },
        },
        tests: [
            {
                name: 'Login then verify session',
                steps: [
                    'POST /api/admin/auth/login with valid email/password',
                    'Expect status 200 and Set-Cookie header',
                    'GET /api/admin/auth/session with same cookie jar',
                    'Expect status 200 and data.isAuthenticated=true',
                ],
            },
            {
                name: 'Invalid credentials',
                steps: [
                    'POST /api/admin/auth/login with wrong password',
                    'Expect status 401 and success=false',
                ],
            },
        ],
        postmanFlow: [
            '1) Call POST /api/admin/auth/login with email + password JSON.',
            '2) Postman stores Set-Cookie automatically in its cookie jar.',
            '3) Call GET /api/admin/auth/session to confirm isAuthenticated=true.',
            '4) Call other /api/admin/* endpoints in same Postman workspace/domain.',
        ],
    });
};
