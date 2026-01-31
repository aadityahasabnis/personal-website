# Architecture Philosophy & Codebase Documentation

> **AadityaHasabnis.site** — A minimal, professional personal knowledge & presence system built with Next.js 16, React 19, and TypeScript

---

## Table of Contents

1. [Core Architecture](#1-core-architecture)
2. [Component Patterns](#2-component-patterns)
3. [State Management Philosophy](#3-state-management-philosophy)
4. [Data Fetching Patterns](#4-data-fetching-patterns)
5. [Type System](#5-type-system)
6. [Code Style Rules](#6-code-style-rules)
7. [Rendering Rules & Performance](#7-rendering-rules--performance)
8. [Content Model](#8-content-model)
9. [Admin Panel Architecture](#9-admin-panel-architecture)
10. [Key Abstractions](#10-key-abstractions)

---

## 1. Core Architecture

### 1.1 Overall Project Structure

```
src/
├── app/                    # Next.js App Router pages & layouts
│   ├── (public)/          # Public routes (articles, series, pages)
│   │   ├── articles/      # Blog articles
│   │   ├── series/        # Article series
│   │   ├── notes/         # Atomic knowledge notes
│   │   └── logs/          # Learning logs
│   ├── (admin)/           # Protected admin routes
│   │   ├── dashboard/     # Admin dashboard
│   │   ├── content/       # Content management
│   │   ├── media/         # Asset management
│   │   └── settings/      # Site settings
│   ├── api/               # API routes
│   │   ├── revalidate/    # On-demand revalidation
│   │   ├── like/          # Like server action
│   │   └── subscribe/     # Newsletter subscription
│   ├── globals.css        # Global styles & CSS variables
│   └── layout.tsx         # Root layout with providers
├── components/             # Reusable UI components
│   ├── ui/                # Base UI primitives (Button, Input, etc.)
│   ├── content/           # Content display components
│   ├── admin/             # Admin-specific components
│   ├── layout/            # Layout components (Header, Footer)
│   └── interactive/       # Dynamic/interactive components
├── lib/                    # Core utilities and logic
│   ├── db/                # MongoDB connection & models
│   ├── auth/              # Authentication utilities
│   ├── markdown/          # Markdown processing
│   └── utils.ts           # General utilities (cn, etc.)
├── hooks/                  # Custom React hooks
├── interfaces/             # TypeScript interfaces
├── constants/              # Static constants
├── server/                 # Server-side utilities
│   ├── actions/           # Server actions
│   └── queries/           # Database queries
└── types/                  # Global TypeScript declarations
```

### 1.2 Why This Structure?

#### **Content-First Philosophy**

**WHAT**: The architecture prioritizes content delivery above all else.

**WHY**: 
- Personal sites live or die by content quality and speed
- SEO depends on fast, static HTML
- Visitors should see content instantly, not loading spinners

**HOW**:
- Static generation for all content pages
- Dynamic features (views, likes) stream after initial paint
- Admin is isolated from public performance surface

#### **Route Groups for Access Control**

**WHAT**: App Router route groups `(public)` and `(admin)` organize pages by access requirements.

**WHY**:
- Clear separation of public and protected routes
- Each group can have its own layout
- Middleware can apply auth checks based on groups

**HOW**:
```
app/
├── (public)/         # No auth required
│   ├── layout.tsx    # Public layout (Header + Footer)
│   └── articles/     # Article pages
├── (admin)/          # Requires authentication
│   ├── layout.tsx    # Admin layout (Sidebar + Topbar)
│   └── content/      # Content management
└── layout.tsx        # Root layout with providers
```

### 1.3 Entry Points & Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Root Layout                               │
│  (ThemeProvider → QueryProvider → ClientProviders)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Route Group Layout                            │
│  (public): Header + Main + Footer                                │
│  (admin): Sidebar + Topbar + Content Area                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Page Component                              │
│  - Server Component (static generation)                          │
│  - Fetches content from MongoDB at build/revalidate              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Streaming Components                           │
│  - Views counter (server component, streamed)                    │
│  - Like button (client component, server action)                 │
│  - Related posts (server component, streamed)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Patterns

### 2.1 Component Organization Philosophy

#### **Static vs Interactive Components**

```
┌─────────────────────────────────────────────────────────────────┐
│  Level 1: UI Primitives (components/ui/)                         │
│  - Button, Input, Card, Badge, Separator                         │
│  - Built on Radix UI primitives                                  │
│  - Styled with CVA (Class Variance Authority)                    │
│  - Zero business logic                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Level 2: Content Components (components/content/)               │
│  - ArticleCard, ArticleBody, SeriesNav, TableOfContents          │
│  - Server Components by default                                  │
│  - Receive pre-rendered HTML or markdown                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Level 3: Interactive Components (components/interactive/)       │
│  - LikeButton, ShareButton, NewsletterForm                       │
│  - Client Components with 'use client'                           │
│  - Use server actions for mutations                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Level 4: Layout Components (components/layout/)                 │
│  - Header, Footer, Sidebar, PageHeader                           │
│  - Handle navigation and site structure                          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Naming Conventions

| Pattern | Convention | Example |
|---------|------------|---------|
| UI Primitives | `PascalCase.tsx` | `button.tsx`, `input.tsx` |
| Content Components | `PascalCase.tsx` | `ArticleCard.tsx`, `SeriesNav.tsx` |
| Interactive Components | Descriptive name | `LikeButton.tsx`, `ShareMenu.tsx` |
| Server Components | No suffix needed | `Views.tsx` (Server by default) |
| Client Components | `'use client'` directive | Top of file |
| Hooks | `use` prefix | `useScrollPosition.tsx` |

### 2.3 Server vs Client Component Rules

```typescript
// ✅ Server Component (default) - for static content
const ArticleBody = ({ html }: { html: string }) => (
    <article 
        className="prose prose-lg dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: html }}
    />
);

// ✅ Server Component with streaming - for dynamic data
const Views = async ({ slug }: { slug: string }) => {
    const count = await getAndIncrementViews(slug);
    return <span className="text-muted">{count} views</span>;
};

// ✅ Client Component - for interactivity
'use client';
const LikeButton = ({ slug, initial }: { slug: string; initial: number }) => {
    const [count, setCount] = useState(initial);
    const [pending, setPending] = useState(false);
    
    const handleLike = async () => {
        setPending(true);
        setCount(c => c + 1); // Optimistic update
        await likePost(slug);
        setPending(false);
    };
    
    return (
        <Button onClick={handleLike} disabled={pending}>
            ❤️ {count}
        </Button>
    );
};
```

---

## 3. State Management Philosophy

### 3.1 State Location Decision Tree

```
                    ┌──────────────────────────┐
                    │   Where does this        │
                    │   state belong?          │
                    └──────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Shareable?   │  │ Persistent?  │  │ Server-side? │
    │ (URL state)  │  │ (DB/Cookie)  │  │ (Content)    │
    └──────────────┘  └──────────────┘  └──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
    URL Params          MongoDB or        Static/ISR
    (filters, tabs)     Cookies          (content data)
```

### 3.2 State Categories

| State Type | Where | Tool | Example |
|------------|-------|------|---------|
| Content data | Server | MongoDB + ISR | Articles, series, pages |
| Page stats | Server | MongoDB | Views, likes |
| User preferences | Client | localStorage | Theme, reading progress |
| Form state | Component | useState | Newsletter form inputs |
| Admin auth | Server | Secure cookies | Session token |

### 3.3 Why No Global Client State?

**WHAT**: This project intentionally avoids global client state management (Redux, Zustand, Jotai).

**WHY**:
- Content is static-first, no need for client-side caching
- Server components handle data fetching
- Only tiny interactive islands need client state
- Simplicity reduces bugs and maintenance burden

**EXCEPTION**: Admin panel may use minimal local state for form handling.

---

## 4. Data Fetching Patterns

### 4.1 The Content Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Build Time / ISR                             │
│  - MongoDB query for content                                     │
│  - Markdown → HTML conversion                                    │
│  - Static HTML generation                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CDN Cache                                 │
│  - HTML served instantly to visitors                             │
│  - Long TTL until revalidation                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Dynamic Streaming                              │
│  - Views component streams after initial paint                   │
│  - Related posts load after main content                         │
│  - Client JS hydrates for like button                            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Content Fetching Pattern

```typescript
// lib/queries/content.ts
export const getArticle = async (slug: string): Promise<IArticle | null> => {
    const db = await connectDB();
    const article = await db.collection('content').findOne({
        slug,
        type: 'article',
        published: true
    });
    return article as IArticle | null;
};

// app/(public)/articles/[slug]/page.tsx
export const revalidate = 3600; // 1 hour

const ArticlePage = async ({ params }: { params: { slug: string } }) => {
    const article = await getArticle(params.slug);
    
    if (!article) return notFound();
    
    return (
        <article>
            <h1>{article.title}</h1>
            <ArticleBody html={article.html} />
            <Suspense fallback={<Skeleton />}>
                <Views slug={article.slug} />
            </Suspense>
            <LikeButton slug={article.slug} initial={article.likes || 0} />
        </article>
    );
};
```

### 4.3 Server Actions for Mutations

```typescript
// server/actions/like.ts
'use server';

export const likePost = async (slug: string): Promise<number> => {
    const db = await connectDB();
    
    // Atomic increment
    const result = await db.collection('pageStats').findOneAndUpdate(
        { slug },
        { $inc: { likes: 1 } },
        { upsert: true, returnDocument: 'after' }
    );
    
    return result?.likes ?? 1;
};
```

### 4.4 On-Demand Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';

export const POST = async (request: Request) => {
    const { slug, secret } = await request.json();
    
    if (secret !== process.env.REVALIDATE_SECRET) {
        return Response.json({ error: 'Invalid secret' }, { status: 401 });
    }
    
    revalidatePath(`/articles/${slug}`);
    return Response.json({ revalidated: true, slug });
};
```

---

## 5. Type System

### 5.1 Interface Naming Conventions

| Pattern | Convention | Example |
|---------|------------|---------|
| Interfaces | `I` prefix | `IArticle`, `IPageStats`, `IUser` |
| Props interfaces | `I___Props` | `IArticleCardProps`, `IButtonProps` |
| API Response | `I___Response` | `IApiResponse`, `IContentResponse` |
| Form Data | `I___FormData` | `IContactFormData`, `IContentFormData` |

### 5.2 Core Interfaces

```typescript
// interfaces/content.ts
export interface IContent {
    _id: string;
    type: 'article' | 'series' | 'page' | 'note' | 'log';
    slug: string;
    title: string;
    description?: string;
    body: string;           // Markdown source
    html?: string;          // Pre-rendered HTML
    author?: string;
    tags?: string[];
    seriesId?: string;
    published: boolean;
    publishedAt?: Date;
    updatedAt?: Date;
    createdAt: Date;
    readingTime?: number;
    seo: {
        title?: string;
        description?: string;
        image?: string;
        structuredData?: object;
    };
}

export interface IArticle extends IContent {
    type: 'article';
}

export interface ISeries extends IContent {
    type: 'series';
    articles: string[];     // Ordered array of article slugs
}

// interfaces/stats.ts
export interface IPageStats {
    _id: string;
    slug: string;
    views: number;
    likes: number;
    lastViewedAt?: Date;
}
```

### 5.3 Utility Types

```typescript
// interfaces/utils.ts
export type StrongOmit<T, K extends keyof T> = Omit<T, K>;

export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ContentType = IContent['type'];
```

---

## 6. Code Style Rules

### 6.1 Function Style

**Pattern**: Arrow functions for all component and hook definitions.

```typescript
// ✅ Preferred - Arrow function with const
const ArticleCard = ({ article }: IArticleCardProps) => (
    <Card>
        <h2>{article.title}</h2>
        <p>{article.description}</p>
    </Card>
);

// ✅ Hooks use arrow functions
const useScrollPosition = () => {
    const [position, setPosition] = useState(0);
    // ...
    return position;
};

// ❌ Avoid - function declaration for components
function ArticleCard(props: IArticleCardProps) {
    return <Card>...</Card>;
}
```

### 6.2 Import Ordering

```typescript
// 1. React imports
import React, { useState, useCallback, Suspense } from 'react';

// 2. Next.js imports
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// 3. Third-party libraries
import { cva, type VariantProps } from 'class-variance-authority';

// 4. Internal imports (using @/ alias)
import { Button } from '@/components/ui/button';
import { getArticle } from '@/lib/queries/content';
import { type IArticle } from '@/interfaces/content';

// 5. Lib imports
import { cn } from '@/lib/utils';

// 6. Relative imports (local files)
import { ArticleBody } from './ArticleBody';
```

### 6.3 TypeScript Practices

```typescript
// ✅ ALWAYS use type imports for types-only
import { type IArticle } from '@/interfaces/content';

// ✅ Explicit return types for server functions
export const getArticle = async (slug: string): Promise<IArticle | null> => {
    // ...
};

// ✅ Use path aliases
import { Button } from '@/components/ui/button';

// ❌ NEVER use `any`
const data: any = response;  // FORBIDDEN

// ❌ AVOID relative imports for cross-directory
import { Button } from '../../../components/ui/button';  // FORBIDDEN
```

---

## 7. Rendering Rules & Performance

### 7.1 Immutable Rendering Rules

1. **Public content pages are Static + ISR**
   - Articles, series, pages, notes, logs are pre-rendered
   - `revalidate` set per content type (default: 1 hour)

2. **Views/Likes stream via Suspense**
   - Never block main HTML for dynamic counters
   - Use `<Suspense>` with minimal fallback

3. **No client `fetch()` for content**
   - All content fetched server-side
   - Only server actions for mutations (likes)

4. **Admin is isolated**
   - Admin routes are excluded from CDN caching
   - Can access DB synchronously

### 7.2 Performance Targets

| Metric | Target |
|--------|--------|
| TTFB | < 150ms (on CDN) |
| First Contentful Paint | < 400ms |
| Largest Contentful Paint | < 1.2s |
| Cumulative Layout Shift | < 0.1 |

### 7.3 Partial Prerendering Pattern

```tsx
// Use Suspense for streaming dynamic parts
const ArticlePage = async ({ params }) => {
    const article = await getArticle(params.slug);
    
    return (
        <article>
            {/* Static - rendered immediately */}
            <h1>{article.title}</h1>
            <ArticleBody html={article.html} />
            
            {/* Dynamic - streams after paint */}
            <Suspense fallback={<span className="text-muted">Loading...</span>}>
                <Views slug={article.slug} />
            </Suspense>
            
            <Suspense fallback={<div className="h-32" />}>
                <RelatedPosts tags={article.tags} currentSlug={article.slug} />
            </Suspense>
        </article>
    );
};
```

---

## 8. Content Model

### 8.1 Content Types

| Type | Description | URL Pattern |
|------|-------------|-------------|
| `article` | Long-form blog posts | `/articles/[slug]` |
| `series` | Collection of related articles | `/series/[slug]` |
| `page` | Static pages (About, Contact) | `/[slug]` |
| `note` | Short atomic knowledge notes | `/notes/[slug]` |
| `log` | Daily learning logs | `/logs/[date-slug]` |

### 8.2 Content Workflow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Draft     │ ──► │   Preview    │ ──► │  Published   │
│   (Editor)   │     │  (Staging)   │     │   (Live)     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │ Revalidate   │
                                          │   (CDN)      │
                                          └──────────────┘
```

### 8.3 SEO Structure

Every content document includes SEO metadata:

```typescript
interface ISEO {
    title?: string;        // Override page title
    description?: string;  // Meta description
    image?: string;        // OG image URL
    structuredData?: {     // JSON-LD
        "@type": string;
        [key: string]: unknown;
    };
}
```

---

## 9. Admin Panel Architecture

### 9.1 Features (MVP)

- **Auth**: Owner-only login with secure session
- **Content List**: Filter by type, draft/published
- **Editor**: Markdown editor with live preview
- **Media**: Upload and manage images
- **Settings**: Site configuration
- **Preview**: Open staging preview URL

### 9.2 Editor Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     Markdown Editor                          │
│  ┌──────────────────────┐  ┌───────────────────────────────┐ │
│  │     Source (MD)      │  │       Preview (HTML)           │ │
│  │                      │  │                                │ │
│  │  # Hello World       │  │  <h1>Hello World</h1>          │ │
│  │                      │  │                                │ │
│  │  This is content...  │  │  <p>This is content...</p>     │ │
│  │                      │  │                                │ │
│  └──────────────────────┘  └───────────────────────────────┘ │
│                                                               │
│  [ Save Draft ]  [ Preview ]  [ Publish ]                    │
└──────────────────────────────────────────────────────────────┘
```

### 9.3 Publishing Flow

1. Author saves draft (`published: false`)
2. Preview opens staging URL
3. Author clicks "Publish"
4. System sets `published: true`, `publishedAt: now`
5. Server calls `revalidatePath()` for affected slug
6. CDN serves new content

---

## 10. Key Abstractions

### 10.1 Database Utilities

| Function | Purpose | File |
|----------|---------|------|
| `connectDB()` | MongoDB connection singleton | `lib/db/connect.ts` |
| `getContent()` | Fetch content by slug | `lib/queries/content.ts` |
| `getArticles()` | Fetch article list | `lib/queries/content.ts` |
| `incrementViews()` | Atomic view counter | `lib/queries/stats.ts` |
| `incrementLikes()` | Atomic like counter | `lib/queries/stats.ts` |

### 10.2 Markdown Processing

| Function | Purpose | File |
|----------|---------|------|
| `parseMarkdown()` | MD → HTML with syntax highlighting | `lib/markdown/parse.ts` |
| `extractHeadings()` | Generate TOC | `lib/markdown/toc.ts` |
| `calculateReadingTime()` | Estimate reading time | `lib/markdown/utils.ts` |

### 10.3 Utility Functions

| Function | Purpose | File |
|----------|---------|------|
| `cn()` | Merge Tailwind classes | `lib/utils.ts` |
| `formatDate()` | Date formatting | `lib/utils.ts` |
| `slugify()` | String to URL slug | `lib/utils.ts` |

---

## Summary of Architecture Principles

### 1. **Content First**
- Static HTML for instant load
- SEO-friendly by default
- Dynamic features never block content

### 2. **Server-First Data Flow**
- All content fetched server-side
- Server actions for mutations
- No client-side data fetching for content

### 3. **Type Safety**
- Strict TypeScript throughout
- Interfaces for all data structures
- No `any` types

### 4. **Minimal Complexity**
- No global state management
- Simple component hierarchy
- Configuration over code where sensible

### 5. **Performance as Feature**
- ISR for fast updates
- Streaming for dynamic parts
- CDN-first delivery

---

*Version: 1.0*  
*Project: AadityaHasabnis.site*
