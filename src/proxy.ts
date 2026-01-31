import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy
 *
 * Note: Auth checks for /admin routes are handled in the admin layout
 * since MongoDB cannot run in edge runtime.
 */
export function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const response = NextResponse.next();

    // Add current path header for server actions
    response.headers.set('x-current-path', pathname);

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Cache static assets aggressively
    if (pathname.startsWith('/images/') || pathname.startsWith('/fonts/')) {
        response.headers.set(
            'Cache-Control',
            'public, max-age=31536000, immutable'
        );
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - sitemap.xml (sitemap generation)
         * - robots.txt (robots file)
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
