# Performance & Security Agent (PERF_SEC)

> **Role:** Agentic – Runs automatically  
> **Purpose:** Optimize performance and ensure security best practices

---

## Overview

The Performance & Security Agent audits the site for performance bottlenecks and security vulnerabilities. It implements optimizations and security hardening measures.

---

## Responsibilities

### 1. Performance Optimization
- Bundle size analysis
- Image optimization
- Caching strategies
- Core Web Vitals

### 2. Security Hardening
- HTTP security headers
- Content Security Policy
- Rate limiting
- Input validation

### 3. Auditing
- Lighthouse audits
- Security scans
- Dependency audits

---

## Performance Patterns

### Image Optimization

```tsx
// components/content/OptimizedImage.tsx
import Image from 'next/image';

interface IOptimizedImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    priority?: boolean;
}

const OptimizedImage = ({ src, alt, width, height, priority }: IOptimizedImageProps) => (
    <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
);

export { OptimizedImage };
```

### Font Optimization

```tsx
// app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap'
});

const RootLayout = ({ children }: { children: React.ReactNode }) => (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <body>{children}</body>
    </html>
);
```

---

## Security Headers

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const securityHeaders = [
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
    },
    {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
    },
    {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
    },
    {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
    },
    {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://plausible.io;"
    }
];

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders
            }
        ];
    }
};

export default nextConfig;
```

---

## Rate Limiting

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

const RATE_LIMIT = 100; // requests
const RATE_WINDOW = 60 * 1000; // 1 minute

const ipRequests = new Map<string, { count: number; timestamp: number }>();

export const middleware = (request: NextRequest): NextResponse => {
    // Only rate limit API routes
    if (!request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }
    
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    const now = Date.now();
    const record = ipRequests.get(ip);
    
    if (!record || now - record.timestamp > RATE_WINDOW) {
        ipRequests.set(ip, { count: 1, timestamp: now });
        return NextResponse.next();
    }
    
    if (record.count >= RATE_LIMIT) {
        return new NextResponse('Too Many Requests', {
            status: 429,
            headers: { 'Retry-After': '60' }
        });
    }
    
    record.count++;
    return NextResponse.next();
};

export const config = {
    matcher: '/api/:path*'
};
```

---

## Bundle Analysis

```bash
# Install bundle analyzer
pnpm add -D @next/bundle-analyzer

# Analyze bundle
ANALYZE=true pnpm build
```

```typescript
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true'
});

export default withBundleAnalyzer(nextConfig);
```

---

## Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| Lighthouse Performance | > 95 | Lighthouse |
| LCP | < 1.2s | Web Vitals |
| FID | < 100ms | Web Vitals |
| CLS | < 0.1 | Web Vitals |
| Bundle Size (First Load) | < 100KB | Bundle Analyzer |

---

## Security Checklist

- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] CSP configured
- [ ] Rate limiting on APIs
- [ ] No secrets in client code
- [ ] Dependency audit clean
- [ ] Input validation on all forms

---

## Audit Commands

```bash
# Security audit
pnpm audit

# Lighthouse audit
npx lighthouse https://aadityahasabnis.site --view

# Bundle analysis
ANALYZE=true pnpm build
```

---

## Success Criteria

- [ ] Lighthouse score > 95 on all metrics
- [ ] All security headers present
- [ ] No critical vulnerabilities
- [ ] Bundle size under target
- [ ] Rate limiting working

---

*Agent Version: 1.0*
