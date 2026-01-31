# Server & Data Patterns

> Complete server-side data management for AadityaHasabnis.site

---

## Table of Contents

1. [Data Flow Architecture](#1-data-flow-architecture)
2. [Server Queries](#2-server-queries)
3. [Server Actions](#3-server-actions)
4. [Partial Prerendering (PPR)](#4-partial-prerendering-ppr)
5. [Caching Strategies](#5-caching-strategies)
6. [Error Handling](#6-error-handling)
7. [Database Patterns](#7-database-patterns)

---

## 1. Data Flow Architecture

### The Golden Rule

```
NEVER fetch content data on the client.
ALWAYS fetch via Server Components or Server Actions.
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     BUILD TIME / ISR                             │
│  MongoDB → Server Query → Static HTML → CDN Edge                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        REQUEST TIME                              │
│  1. Static HTML shell served instantly from CDN                  │
│  2. Dynamic islands stream via Suspense                          │
│  3. Client hydration enables interactions                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MUTATIONS                                │
│  Client Event → Server Action → MongoDB → Revalidate             │
└─────────────────────────────────────────────────────────────────┘
```

### When to Use What

| Need | Pattern | Example |
|------|---------|---------|
| Display content | Server Component + Query | Article page |
| Count views | Streaming Server Component | Views counter |
| Like button | Server Action + Optimistic UI | Like button |
| Newsletter | Server Action + Form | Subscribe form |
| Search | Client Component + debounce | Search bar |

---

## 2. Server Queries

### Location

All queries live in `server/queries/` directory:

```
server/queries/
├── content.ts    # Content CRUD queries
├── stats.ts      # View/like counters
├── user.ts       # Admin user queries
└── subscriber.ts # Newsletter queries
```

### Pattern: Basic Query

```typescript
// server/queries/content.ts
import { type IArticle, type IContent } from '@/interfaces/content';
import { connectDB } from '@/lib/db/connect';

/**
 * Get a single published article by slug
 */
export const getArticle = async (slug: string): Promise<IArticle | null> => {
    const db = await connectDB();
    
    const article = await db.collection<IContent>('content').findOne({
        type: 'article',
        slug,
        published: true
    });
    
    return article as IArticle | null;
};
```

### Pattern: List Query with Sorting

```typescript
/**
 * Get recent published articles
 */
export const getRecentArticles = async (
    limit: number = 10,
    skip: number = 0
): Promise<IArticle[]> => {
    const db = await connectDB();
    
    const articles = await db.collection<IContent>('content')
        .find({ 
            type: 'article', 
            published: true 
        })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .project({
            body: 0,  // Exclude heavy fields for lists
            html: 0
        })
        .toArray();
    
    return articles as IArticle[];
};
```

### Pattern: Aggregation Pipeline

```typescript
/**
 * Get articles with stats (views, likes)
 */
export const getArticlesWithStats = async (): Promise<(IArticle & IPageStats)[]> => {
    const db = await connectDB();
    
    const articles = await db.collection<IContent>('content').aggregate([
        // Match published articles
        { $match: { type: 'article', published: true } },
        
        // Sort by date
        { $sort: { publishedAt: -1 } },
        
        // Join with stats
        {
            $lookup: {
                from: 'pageStats',
                localField: 'slug',
                foreignField: 'slug',
                as: 'stats'
            }
        },
        
        // Flatten stats array
        {
            $addFields: {
                views: { $ifNull: [{ $arrayElemAt: ['$stats.views', 0] }, 0] },
                likes: { $ifNull: [{ $arrayElemAt: ['$stats.likes', 0] }, 0] }
            }
        },
        
        // Remove stats array
        { $project: { stats: 0, body: 0, html: 0 } }
    ]).toArray();
    
    return articles as (IArticle & IPageStats)[];
};
```

### Pattern: Atomic Counter

```typescript
// server/queries/stats.ts
/**
 * Atomically increment view count and return new value
 */
export const getAndIncrementViews = async (slug: string): Promise<number> => {
    const db = await connectDB();
    
    const result = await db.collection<IPageStats>('pageStats').findOneAndUpdate(
        { slug },
        { 
            $inc: { views: 1 },
            $set: { lastViewedAt: new Date() }
        },
        { 
            upsert: true,           // Create if not exists
            returnDocument: 'after' // Return updated doc
        }
    );
    
    return result?.views ?? 1;
};
```

---

## 3. Server Actions

### Location

All actions live in `server/actions/` directory:

```
server/actions/
├── content.ts   # Content CRUD
├── like.ts      # Like action
├── subscribe.ts # Newsletter
├── auth.ts      # Authentication
└── media.ts     # Media upload
```

### Pattern: Basic Mutation

```typescript
// server/actions/like.ts
'use server';

import { connectDB } from '@/lib/db/connect';
import { type IPageStats } from '@/interfaces/stats';

/**
 * Increment like count for a post
 * Called from client via Server Action
 */
export const likePost = async (slug: string): Promise<number> => {
    const db = await connectDB();
    
    const result = await db.collection<IPageStats>('pageStats').findOneAndUpdate(
        { slug },
        { $inc: { likes: 1 } },
        { upsert: true, returnDocument: 'after' }
    );
    
    return result?.likes ?? 1;
};
```

### Pattern: With Validation

```typescript
// server/actions/subscribe.ts
'use server';

import { z } from 'zod';
import { connectDB } from '@/lib/db/connect';

const subscribeSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(1).max(100).optional()
});

interface ISubscribeResult {
    success: boolean;
    message: string;
}

export const subscribe = async (formData: FormData): Promise<ISubscribeResult> => {
    // Validate input
    const parsed = subscribeSchema.safeParse({
        email: formData.get('email'),
        name: formData.get('name')
    });
    
    if (!parsed.success) {
        return { 
            success: false, 
            message: parsed.error.issues[0]?.message ?? 'Invalid input'
        };
    }
    
    const { email, name } = parsed.data;
    
    const db = await connectDB();
    
    // Check existing
    const existing = await db.collection('subscribers').findOne({ email });
    if (existing) {
        return { success: false, message: 'Already subscribed' };
    }
    
    // Insert new subscriber
    await db.collection('subscribers').insertOne({
        email,
        name: name ?? '',
        subscribedAt: new Date(),
        confirmed: false
    });
    
    return { success: true, message: 'Thanks for subscribing!' };
};
```

### Pattern: With Revalidation

```typescript
// server/actions/content.ts
'use server';

import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';

export const publishContent = async (id: string): Promise<void> => {
    const db = await connectDB();
    
    const content = await db.collection('content').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
            $set: { 
                published: true, 
                publishedAt: new Date(),
                updatedAt: new Date()
            }
        },
        { returnDocument: 'after' }
    );
    
    if (content) {
        // Revalidate the specific page
        revalidatePath(`/articles/${content.slug}`);
        
        // Revalidate listing pages
        revalidatePath('/');
        revalidatePath('/articles');
    }
};
```

### Usage in Client Component

```tsx
'use client';

import { useState, useTransition } from 'react';
import { likePost } from '@/server/actions/like';

const LikeButton = ({ slug, initial }: { slug: string; initial: number }) => {
    const [count, setCount] = useState(initial);
    const [liked, setLiked] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleLike = () => {
        if (liked) return;
        
        // Optimistic update
        setLiked(true);
        setCount(c => c + 1);
        
        // Server action
        startTransition(() => {
            likePost(slug);
        });
    };

    return (
        <button onClick={handleLike} disabled={isPending || liked}>
            ❤️ {count}
        </button>
    );
};
```

---

## 4. Partial Prerendering (PPR)

### What is PPR?

Partial Prerendering combines static and dynamic rendering in a single page:

- **Static shell** serves instantly from CDN
- **Dynamic holes** stream in after initial paint
- **No loading spinners** for static content

### Enable PPR

```typescript
// next.config.ts
const nextConfig = {
    experimental: {
        ppr: true  // Enable Partial Prerendering
    }
};
```

### PPR Pattern

```tsx
// app/(public)/articles/[slug]/page.tsx
import { Suspense } from 'react';
import { getArticle } from '@/server/queries/content';
import { ArticleBody } from '@/components/content/ArticleBody';
import { Views } from '@/components/content/Views';
import { LikeButton } from '@/components/interactive/LikeButton';
import { RelatedPosts } from '@/components/content/RelatedPosts';
import { Skeleton } from '@/components/ui/skeleton';

export const revalidate = 3600; // ISR: 1 hour

const ArticlePage = async ({ params }: { params: { slug: string } }) => {
    const article = await getArticle(params.slug);
    if (!article) return notFound();
    
    return (
        <article>
            {/* ===== STATIC SHELL ===== */}
            {/* These render at build time / ISR */}
            <header>
                <h1 className="text-title">{article.title}</h1>
                <p className="text-muted-foreground">{article.description}</p>
            </header>
            
            <ArticleBody html={article.html ?? ''} />
            
            {/* ===== DYNAMIC HOLES ===== */}
            {/* These stream after initial paint */}
            
            {/* Views - increments on each view */}
            <Suspense fallback={<Skeleton className="h-4 w-16" />}>
                <Views slug={article.slug} />
            </Suspense>
            
            {/* Like button - needs fresh count */}
            <LikeButton 
                slug={article.slug} 
                initial={article.likes ?? 0} 
            />
            
            {/* Related posts - personalized/random */}
            <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                <RelatedPosts 
                    currentSlug={article.slug} 
                    tags={article.tags ?? []} 
                />
            </Suspense>
        </article>
    );
};
```

### Views Component (Streaming)

```tsx
// components/content/Views.tsx
import { getAndIncrementViews } from '@/server/queries/stats';

interface IViewsProps {
    slug: string;
}

/**
 * Server component that:
 * 1. Increments view count in DB
 * 2. Streams the count after page shell renders
 */
const Views = async ({ slug }: IViewsProps) => {
    // This runs at REQUEST time, not build time
    const count = await getAndIncrementViews(slug);
    
    return (
        <span className="text-sm text-muted-foreground">
            {count.toLocaleString()} views
        </span>
    );
};

export { Views };
```

### PPR Timeline

```
t=0ms     Static HTML shell arrives (from CDN)
          ├── Title, description visible
          ├── Article body visible
          └── Placeholders for dynamic content

t=50ms    JavaScript starts loading

t=100ms   Views component streams in
          └── "1,234 views" replaces skeleton

t=150ms   RelatedPosts streams in
          └── Related article cards appear

t=200ms   Hydration complete
          └── Like button becomes interactive
```

---

## 5. Caching Strategies

### ISR (Incremental Static Regeneration)

```typescript
// Per-page revalidation
export const revalidate = 3600; // Regenerate after 1 hour

// Or per-fetch revalidation
const data = await fetch(url, { 
    next: { revalidate: 3600 }
});
```

### Cache Tags

```typescript
// Tag a fetch for targeted revalidation
const articles = await fetch(url, {
    next: { tags: ['articles'] }
});

// Later, revalidate all tagged resources
import { revalidateTag } from 'next/cache';
revalidateTag('articles');
```

### On-Demand Revalidation

```typescript
// API route for webhooks
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';

export const POST = async (request: Request) => {
    const { slug, type, secret } = await request.json();
    
    if (secret !== process.env.REVALIDATE_SECRET) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Revalidate specific path
    revalidatePath(`/articles/${slug}`);
    
    // Revalidate by tag
    revalidateTag('articles');
    
    return Response.json({ revalidated: true });
};
```

### No-Cache for Admin

```typescript
// Force dynamic for admin routes
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

---

## 6. Error Handling

### Server Query Errors

```typescript
export const getArticle = async (slug: string): Promise<IArticle | null> => {
    try {
        const db = await connectDB();
        return await db.collection('content').findOne({ slug });
    } catch (error) {
        console.error(`Failed to fetch article: ${slug}`, error);
        return null; // Return null, let page handle 404
    }
};
```

### Server Action Errors

```typescript
interface IActionResult<T = void> {
    success: boolean;
    data?: T;
    error?: string;
}

export const likePost = async (slug: string): Promise<IActionResult<number>> => {
    try {
        const db = await connectDB();
        const result = await db.collection('pageStats').findOneAndUpdate(
            { slug },
            { $inc: { likes: 1 } },
            { upsert: true, returnDocument: 'after' }
        );
        
        return { 
            success: true, 
            data: result?.likes ?? 1 
        };
    } catch (error) {
        console.error('Failed to like post:', error);
        return { 
            success: false, 
            error: 'Failed to save your like. Please try again.' 
        };
    }
};
```

### Error Boundary

```tsx
// app/error.tsx
'use client';

const Error = ({ error, reset }: { error: Error; reset: () => void }) => (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-h2">Something went wrong</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="mt-4">
            Try again
        </button>
    </div>
);

export default Error;
```

---

## 7. Database Patterns

### Connection Singleton

```typescript
// lib/db/connect.ts
import { MongoClient, type Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = 'portfolio';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export const connectDB = async (): Promise<Db> => {
    if (cachedDb) {
        return cachedDb;
    }

    const client = await MongoClient.connect(MONGODB_URI, {
        maxPoolSize: 10,
        minPoolSize: 5
    });
    
    const db = client.db(DB_NAME);

    cachedClient = client;
    cachedDb = db;

    return db;
};
```

### Typed Collections

```typescript
// lib/db/collections.ts
import { type Collection } from 'mongodb';
import { type IContent } from '@/interfaces/content';
import { type IPageStats } from '@/interfaces/stats';
import { connectDB } from './connect';

export const getContentCollection = async (): Promise<Collection<IContent>> => {
    const db = await connectDB();
    return db.collection<IContent>('content');
};

export const getStatsCollection = async (): Promise<Collection<IPageStats>> => {
    const db = await connectDB();
    return db.collection<IPageStats>('pageStats');
};
```

---

## Summary

### Server-First Rules

1. **All content queries in Server Components** - Never fetch content client-side
2. **Mutations via Server Actions** - Type-safe, validated, secure
3. **PPR for dynamic islands** - Static shell + streaming dynamic parts
4. **ISR for freshness** - Regenerate content on schedule
5. **On-demand revalidation** - Instant updates when content changes

### File Structure

```
server/
├── queries/           # Read operations (SELECT)
│   ├── content.ts
│   ├── stats.ts
│   └── user.ts
└── actions/           # Write operations (INSERT/UPDATE/DELETE)
    ├── content.ts
    ├── like.ts
    ├── subscribe.ts
    └── auth.ts
```

---

*Version: 1.0*  
*Project: AadityaHasabnis.site*
