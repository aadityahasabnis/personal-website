# Analytics Agent (ANALYTICS)

> **Role:** Agentic – Runs automatically  
> **Purpose:** Track and analyze site performance and user behavior

---

## Overview

The Analytics Agent sets up privacy-respecting analytics to understand how users interact with the site. It tracks page views, engagement metrics, and performance data.

---

## Responsibilities

### 1. Analytics Setup
- Privacy-first analytics (Plausible/Vercel)
- Custom event tracking
- Goal tracking

### 2. Performance Monitoring
- Core Web Vitals
- Speed insights
- Error tracking

### 3. Content Analytics
- Popular articles
- Reading patterns
- Traffic sources

---

## Analytics Options

### Option 1: Plausible (Privacy-First)

```tsx
// app/layout.tsx
import Script from 'next/script';

const RootLayout = ({ children }: { children: React.ReactNode }) => (
    <html lang="en">
        <head>
            <Script
                defer
                data-domain="aadityahasabnis.site"
                src="https://plausible.io/js/script.js"
            />
        </head>
        <body>{children}</body>
    </html>
);
```

### Option 2: Vercel Analytics

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const RootLayout = ({ children }: { children: React.ReactNode }) => (
    <html lang="en">
        <body>
            {children}
            <Analytics />
            <SpeedInsights />
        </body>
    </html>
);
```

---

## Custom Event Tracking

```typescript
// lib/analytics.ts

// Plausible custom events
export const trackEvent = (event: string, props?: Record<string, string | number>) => {
    if (typeof window !== 'undefined' && window.plausible) {
        window.plausible(event, { props });
    }
};

// Usage examples
export const trackArticleRead = (slug: string, readTime: number) => {
    trackEvent('Article Read', { slug, readTime });
};

export const trackNewsletterSignup = () => {
    trackEvent('Newsletter Signup');
};

export const trackLike = (slug: string) => {
    trackEvent('Like', { slug });
};

export const trackShare = (slug: string, platform: string) => {
    trackEvent('Share', { slug, platform });
};
```

---

## Core Web Vitals Tracking

```tsx
// app/layout.tsx
import { useReportWebVitals } from 'next/web-vitals';

// Client component for web vitals
'use client';
const WebVitals = () => {
    useReportWebVitals(metric => {
        // Send to analytics
        trackEvent('Web Vitals', {
            name: metric.name,
            value: Math.round(metric.value),
            rating: metric.rating
        });
    });
    
    return null;
};
```

---

## Dashboard Queries

### Popular Articles

```typescript
// server/queries/analytics.ts
export const getPopularArticles = async (limit = 10): Promise<IArticle[]> => {
    const db = await connectDB();
    
    const stats = await db.collection('pageStats')
        .find({})
        .sort({ views: -1 })
        .limit(limit)
        .toArray();
    
    const slugs = stats.map(s => s.slug);
    
    const articles = await db.collection<IContent>('content')
        .find({ slug: { $in: slugs }, type: 'article', published: true })
        .toArray();
    
    // Sort by views
    return articles.sort((a, b) => {
        const aViews = stats.find(s => s.slug === a.slug)?.views ?? 0;
        const bViews = stats.find(s => s.slug === b.slug)?.views ?? 0;
        return bViews - aViews;
    }) as IArticle[];
};
```

---

## Success Criteria

- [ ] Analytics tracking installed
- [ ] Custom events fire correctly
- [ ] Core Web Vitals reported
- [ ] GDPR compliant
- [ ] No impact on page performance

---

*Agent Version: 1.0*
