// =================================================
// Middleware proxy — security headers + path tag
// Auth guard lives in admin layout (not here) because
// MongoDB cannot run in Next.js edge runtime.
// =================================================

import { NextResponse, type NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const res = NextResponse.next();

    // Security headers (all routes)
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // No-cache for admin; long-cache for static assets
    if (pathname.startsWith('/admin')) {
        res.headers.set('Cache-Control', 'no-store');
    } else if (pathname.startsWith('/images/') || pathname.startsWith('/fonts/')) {
        res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    // Expose path to server components / layouts
    res.headers.set('x-pathname', pathname);

    return res;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)',],
};
