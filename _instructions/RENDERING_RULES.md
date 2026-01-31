# Rendering Rules

> Static, ISR, and streaming patterns for AadityaHasabnis.site

---

## Rendering Strategy Overview

| Route | Strategy | Revalidate | Why |
|-------|----------|------------|-----|
| `/` (Home) | ISR | 30min | Fresh article list |
| `/articles/[slug]` | ISR | 1hr | Content rarely changes |
| `/series/[slug]` | ISR | 1hr | Series content stable |
| `/notes/[slug]` | ISR | 1hr | Notes are stable |
| `/logs/[date]` | ISR | 24hr | Logs don't change |
| `/about`, `/contact` | Static | N/A | Rarely updated |
| `/admin/*` | Dynamic | N/A | Always fresh |

---

## ISR Configuration

### Per-Page Revalidation

```typescript
// app/(public)/articles/[slug]/page.tsx
export const revalidate = 3600; // 1 hour

const ArticlePage = async ({ params }: { params: { slug: string } }) => {
    const article = await getArticle(params.slug);
    // ...
};
```

### Home Page (More Frequent)

```typescript
// app/(public)/page.tsx
export const revalidate = 1800; // 30 minutes

const HomePage = async () => {
    const articles = await getRecentArticles(5);
    // ...
};
```

### Static Pages

```typescript
// app/(public)/about/page.tsx
// No revalidate = fully static at build time

const AboutPage = () => {
    return <div>About me...</div>;
};
```

---

## On-Demand Revalidation

Trigger revalidation after content updates:

```typescript
// server/actions/content.ts
import { revalidatePath, revalidateTag } from 'next/cache';

export const publishContent = async (id: string): Promise<void> => {
    const db = await connectDB();
    
    const content = await db.collection('content').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { published: true, publishedAt: new Date() } },
        { returnDocument: 'after' }
    );
    
    if (content) {
        // Revalidate the specific page
        revalidatePath(`/articles/${content.slug}`);
        
        // Revalidate lists that include this content
        revalidatePath('/');
        revalidatePath('/articles');
    }
};
```

### Webhook for External Triggers

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
    const { secret, path } = await request.json();
    
    if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }
    
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path });
};
```

---

## Streaming with Suspense

### Pattern: Static Shell + Streaming Data

```tsx
// app/(public)/articles/[slug]/page.tsx
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ArticlePage = async ({ params }: { params: { slug: string } }) => {
    const article = await getArticle(params.slug);
    
    return (
        <article>
            {/* Static - rendered immediately */}
            <h1>{article.title}</h1>
            <ArticleBody html={article.html} />
            
            {/* Streaming - loads after shell */}
            <Suspense fallback={<Skeleton className="h-4 w-20" />}>
                <Views slug={article.slug} />
            </Suspense>
            
            <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                <RelatedPosts currentSlug={article.slug} tags={article.tags} />
            </Suspense>
        </article>
    );
};
```

### Views Component (Streaming)

```tsx
// components/content/Views.tsx
import { getAndIncrementViews } from '@/server/queries/stats';

const Views = async ({ slug }: { slug: string }) => {
    // This fetch happens during streaming, not blocking initial HTML
    const count = await getAndIncrementViews(slug);
    return <span>{count} views</span>;
};
```

---

## Dynamic Admin Routes

```typescript
// app/(admin)/layout.tsx
export const dynamic = 'force-dynamic'; // Never cache admin

// Or per-page
// app/(admin)/admin/content/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

---

## generateStaticParams

Pre-render known routes at build time:

```typescript
// app/(public)/articles/[slug]/page.tsx
import { getPublishedSlugs } from '@/server/queries/content';

export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
    const slugs = await getPublishedSlugs('article');
    return slugs.map(slug => ({ slug }));
};
```

---

## Loading States

### Route-Level Loading

```tsx
// app/(public)/articles/[slug]/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

const Loading = () => (
    <article className="container max-w-4xl py-12">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="mt-4 h-4 w-1/4" />
        <div className="mt-8 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    </article>
);

export default Loading;
```

---

## Performance Rules

### ✅ DO

1. **Use ISR for content pages** - Balance freshness with performance
2. **Stream dynamic data** - Don't block initial HTML for counters
3. **Pre-render known routes** - Use `generateStaticParams`
4. **Revalidate on publish** - Instant updates when content changes

### ❌ DON'T

1. **Never use `force-dynamic` on public pages**
2. **Never fetch content client-side** - Always server-side
3. **Never block render for stats** - Stream them
4. **Never skip loading states** - Always show progress

---

## Rendering Decision Tree

```
Is the route public?
├── YES: Does content change frequently?
│   ├── YES (home, lists): ISR 30min
│   └── NO (articles): ISR 1hr
└── NO (admin): force-dynamic

Does the component need real-time data?
├── YES: Wrap in Suspense, stream it
└── NO: Render as part of static shell
```

---

*Version: 1.0*
