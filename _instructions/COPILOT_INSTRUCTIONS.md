# Copilot Instructions: AadityaHasabnis.site

> **CRITICAL**: Follow ESLint rules and `tsconfig.json` (strict mode) — NO EXCEPTIONS.
> **Reference**: See `ARCHITECTURE_PHILOSOPHY.md` for detailed patterns and code examples.

---

## 1. PROJECT OVERVIEW

### Technology Stack
- **Framework**: Next.js 16 (App Router) with Turbopack
- **Language**: TypeScript 5.9+ (strict mode)
- **React**: React 19 with React Compiler
- **Styling**: Tailwind CSS 4 with `tailwindcss-animate`
- **Database**: MongoDB (Atlas or self-managed)
- **Markdown**: MDX or remark/rehype pipeline
- **Components**: Radix UI primitives + CVA (Class Variance Authority)

### Project Purpose
A minimal, professional personal site where Aaditya publishes:
- **Articles**: Long-form blog posts
- **Series**: Collections of related articles
- **Pages**: Static pages (About, Contact, Projects)
- **Notes**: Short atomic knowledge snippets
- **Logs**: Daily learning logs

### Key Principles
1. **Content-first**: Static HTML for instant load, SEO-friendly
2. **Server-first**: All content fetched server-side
3. **Streaming enhancements**: Views/likes stream after paint
4. **Minimal complexity**: No global state management

---

## 2. FOLDER STRUCTURE

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public content routes
│   ├── (admin)/           # Protected admin routes
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # All components
│   ├── ui/               # Base UI primitives
│   ├── content/          # Content display
│   ├── interactive/      # Client components
│   ├── layout/           # Layout components
│   └── admin/            # Admin-specific
├── lib/                   # Core utilities
│   ├── db/               # MongoDB utilities
│   ├── markdown/         # MD processing
│   └── utils.ts          # General utils
├── server/               # Server-side code
│   ├── actions/          # Server actions
│   └── queries/          # DB queries
├── hooks/                # Custom React hooks
├── interfaces/           # TypeScript interfaces
└── constants/            # Static constants
```

**RULES**:
- Components should be Server Components by default
- Add `'use client'` only when needed for interactivity
- Use `@/` path alias for all imports

---

## 3. NAMING CONVENTIONS (STRICT)

### Files & Folders

| Type | Convention | Example |
|------|------------|---------|
| Components | `PascalCase.tsx` | `ArticleCard.tsx`, `Button.tsx` |
| Hooks | `use` prefix + `PascalCase.tsx` | `useScrollPosition.tsx` |
| Utilities | `camelCase.ts` | `formatDate.ts`, `slugify.ts` |
| Interfaces | `camelCase.ts` | `content.ts`, `stats.ts` |
| Constants | `camelCase.ts` | `siteConfig.ts` |
| Server Actions | `camelCase.ts` with `'use server'` | `like.ts` |
| Route Files | Next.js convention | `page.tsx`, `layout.tsx`, `loading.tsx` |

### TypeScript Naming

| Type | Convention | Example |
|------|------------|---------|
| Interfaces | `I` prefix | `IArticle`, `IPageStats`, `IUser` |
| Props | `I___Props` | `IButtonProps`, `IArticleCardProps` |
| Response types | `I___Response` | `IApiResponse` |
| Form data | `I___FormData` | `IContactFormData` |

### Variable & Function Naming

```typescript
// ✅ CORRECT
const handleSubmit = () => { ... };          // Event handlers: handle + Action
const isLoading = true;                       // Booleans: is/has/should prefix
const fetchArticles = async () => { ... };   // Async functions: verb + Noun
const articleList = [];                       // Arrays: singular + List

// ❌ WRONG
const submit = () => { ... };                 // Missing 'handle' prefix
const loading = true;                          // Missing 'is' prefix
const data = [];                               // Too generic
```

---

## 4. TYPESCRIPT RULES (NON-NEGOTIABLE)

### Strict Type Safety

```typescript
// ✅ ALWAYS use explicit return types for exported functions
export const getArticle = async (slug: string): Promise<IArticle | null> => { ... };

// ✅ ALWAYS use type imports for types-only
import { type IArticle } from '@/interfaces/content';

// ❌ NEVER use `any`
const data: any = response;  // FORBIDDEN

// ❌ AVOID `as` casts - use type guards instead
const user = response as IUser;  // AVOID
if (isUser(response)) { ... }    // PREFER
```

### Path Aliases (Required)

```typescript
// ✅ ALWAYS use path aliases
import { Button } from '@/components/ui/button';
import { getArticle } from '@/lib/queries/content';
import { cn } from '@/lib/utils';

// ❌ NEVER use relative imports for cross-directory
import { Button } from '../../../components/ui/button';  // FORBIDDEN
```

---

## 5. COMPONENT PATTERNS

### Component Hierarchy

```
Level 1: UI Primitives (components/ui/)
    ↓ Button, Input, Card - Radix-based, zero business logic
    
Level 2: Content Components (components/content/)
    ↓ ArticleCard, ArticleBody - Server components, display content
    
Level 3: Interactive Components (components/interactive/)
    ↓ LikeButton, ShareMenu - Client components, handle interactions
    
Level 4: Layout Components (components/layout/)
    ↓ Header, Footer, Sidebar - Structure and navigation
```

### Server vs Client Components

```typescript
// ✅ Server Component (default) - no directive needed
const ArticleCard = ({ article }: IArticleCardProps) => (
    <Card>
        <h2>{article.title}</h2>
        <p>{article.description}</p>
    </Card>
);

// ✅ Client Component - add 'use client' directive
'use client';
const LikeButton = ({ slug, initial }: { slug: string; initial: number }) => {
    const [count, setCount] = useState(initial);
    // ...
};
```

### Props Patterns

```typescript
// Use CVA for variant-based styling
const buttonVariants = cva('base-styles', {
    variants: {
        variant: { default: '...', secondary: '...', ghost: '...' },
        size: { sm: '...', default: '...', lg: '...' }
    },
    defaultVariants: { variant: 'default', size: 'default' }
});

// Accept icon props as React elements
interface IButtonProps {
    icon?: React.ReactElement<{ className?: string }>;
    children?: React.ReactNode;
}
```

---

## 6. DATA FETCHING PATTERNS

### Content Fetching (Server-Side)

```typescript
// lib/queries/content.ts
export const getArticle = async (slug: string): Promise<IArticle | null> => {
    const db = await connectDB();
    return await db.collection('content').findOne({ slug, published: true });
};

// app/(public)/articles/[slug]/page.tsx
export const revalidate = 3600; // ISR: 1 hour

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
        </article>
    );
};
```

### Server Actions for Mutations

```typescript
// server/actions/like.ts
'use server';

export const likePost = async (slug: string): Promise<number> => {
    const db = await connectDB();
    const result = await db.collection('pageStats').findOneAndUpdate(
        { slug },
        { $inc: { likes: 1 } },
        { upsert: true, returnDocument: 'after' }
    );
    return result?.likes ?? 1;
};

// Usage in client component
'use client';
const handleLike = async () => {
    setCount(c => c + 1); // Optimistic update
    await likePost(slug);
};
```

---

## 7. RENDERING RULES

### Static + ISR for Content

```typescript
// Article pages: revalidate every hour
export const revalidate = 3600;

// Home page: revalidate more frequently
export const revalidate = 1800; // 30 minutes

// Admin pages: no caching
export const dynamic = 'force-dynamic';
```

### Streaming with Suspense

```tsx
// Wrap dynamic content in Suspense
<article>
    {/* Static - immediate */}
    <h1>{article.title}</h1>
    <ArticleBody html={article.html} />
    
    {/* Dynamic - streams after paint */}
    <Suspense fallback={<span className="text-muted">...</span>}>
        <Views slug={article.slug} />
    </Suspense>
    
    <Suspense fallback={<div className="h-20" />}>
        <RelatedPosts currentSlug={article.slug} />
    </Suspense>
</article>
```

---

## 8. IMPORT ORDERING (STRICT)

```typescript
// 1. React
import React, { useState, useCallback, Suspense } from 'react';

// 2. Next.js
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// 3. Third-party libraries
import { cva, type VariantProps } from 'class-variance-authority';

// 4. Internal imports (@/)
import { Button } from '@/components/ui/button';
import { getArticle } from '@/lib/queries/content';
import { type IArticle } from '@/interfaces/content';

// 5. Lib imports
import { cn } from '@/lib/utils';

// 6. Relative imports (same directory)
import { ArticleBody } from './ArticleBody';
```

---

## 9. CODE STYLE RULES

### Arrow Functions (Always)

```typescript
// ✅ CORRECT - Arrow functions
const ArticleCard = ({ article }: IArticleCardProps) => { ... };
const useScrollPosition = () => { ... };
const handleClick = () => { ... };

// ❌ WRONG - Function declarations
function ArticleCard(props: IArticleCardProps) { ... }
```

### Conditional Rendering

```tsx
// ✅ Ternary for simple either/or
{isLoading ? <Skeleton /> : <Content />}

// ✅ Logical AND for optional rendering
{description && <p>{description}</p>}

// ✅ Early return for complex conditions
if (!article) return null;
return <ArticleCard article={article} />;
```

---

## 10. CONTENT MODEL

### Content Types

| Type | Description | URL |
|------|-------------|-----|
| `article` | Long-form posts | `/articles/[slug]` |
| `series` | Article collections | `/series/[slug]` |
| `page` | Static pages | `/[slug]` |
| `note` | Knowledge snippets | `/notes/[slug]` |
| `log` | Learning logs | `/logs/[date-slug]` |

### MongoDB Collections

```typescript
// content - all content types
{ type, slug, title, body, html, published, publishedAt, seo, ... }

// pageStats - view/like counters
{ slug, views, likes, lastViewedAt }

// subscribers - newsletter
{ email, name, subscribedAt, confirmed }

// users - admin
{ email, name, passwordHash, role }
```

---

## 11. ADMIN PANEL

### Features (MVP)
- Auth: Owner-only login
- Content list with filters
- Markdown editor with preview
- Publish/unpublish/schedule
- Image upload
- Settings page

### Editor Pattern

```tsx
// Split view: Source | Preview
<div className="grid grid-cols-2 gap-4">
    <MarkdownEditor value={body} onChange={setBody} />
    <ArticlePreview html={parseMarkdown(body)} />
</div>
```

---

## 12. DEV COMMANDS

```bash
# Development
pnpm dev              # Start dev server

# Type Checking
pnpm type-check       # TypeScript check

# Linting
pnpm lint             # ESLint check
pnpm lint:fix         # Auto-fix

# Build
pnpm build            # Production build
```

---

## 13. QUICK REFERENCE CHECKLIST

Before submitting code, verify:

- [ ] No `any` types
- [ ] Explicit return types on exported functions
- [ ] `type` keyword for type-only imports
- [ ] Path aliases (`@/`) instead of relative imports
- [ ] Arrow functions (not function declarations)
- [ ] `'use client'` only where needed
- [ ] Suspense around streaming components
- [ ] Following import order convention
- [ ] Server actions marked with `'use server'`

---

*Last Updated: 2026-01-31*  
*Project: AadityaHasabnis.site*
