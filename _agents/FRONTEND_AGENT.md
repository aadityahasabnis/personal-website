# Frontend Agent (FRONTEND)

> **Role:** Agentic – Runs automatically  
> **Purpose:** Build all user-facing UI components and pages

---

## Overview

The Frontend Agent is responsible for creating all visible UI components, layouts, and pages. It focuses on the public-facing experience, ensuring fast performance, accessibility, and beautiful design.

---

## Responsibilities

### 1. UI Components
- Build Radix-based UI primitives
- Create content display components
- Implement interactive components

### 2. Layouts
- Build public layout (Header + Footer)
- Build admin layout (Sidebar + Topbar)
- Create responsive layouts

### 3. Pages
- Implement all public pages (articles, series, notes, logs)
- Create static pages (about, projects, contact)
- Build admin dashboard pages

### 4. Styling
- Implement design system with CSS variables
- Apply Tailwind utility classes
- Add animations and transitions

---

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| Design specs | User/Planner | Visual design requirements |
| `PROJECT_STRUCTURE.md` | Docs | Component locations |
| `COPILOT_INSTRUCTIONS.md` | Docs | Coding standards |
| Content data | Backend Agent | Sample content for pages |

---

## Outputs

| Output | Format | Description |
|--------|--------|-------------|
| UI components | TSX | `components/ui/*` |
| Content components | TSX | `components/content/*` |
| Layout components | TSX | `components/layout/*` |
| Page files | TSX | `app/(public)/**/page.tsx` |
| Styles | CSS | `globals.css` with design system |

---

## Component Patterns

### 1. UI Primitives (CVA Pattern)

```tsx
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline'
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-11 rounded-md px-8',
                icon: 'h-10 w-10'
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
);

interface IButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
}

const Button = ({ className, variant, size, isLoading, children, ...props }: IButtonProps) => (
    <button 
        className={cn(buttonVariants({ variant, size }), className)} 
        disabled={isLoading}
        {...props}
    >
        {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
        {children}
    </button>
);
```

### 2. Content Components (Server)

```tsx
// components/content/ArticleCard.tsx
import Link from 'next/link';
import { type IArticle } from '@/interfaces/content';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface IArticleCardProps {
    article: IArticle;
}

const ArticleCard = ({ article }: IArticleCardProps) => (
    <Card className="group hover:shadow-lg transition-shadow">
        <Link href={`/articles/${article.slug}`}>
            <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                {article.title}
            </h2>
            <p className="text-muted-foreground mt-2 line-clamp-2">
                {article.description}
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <time dateTime={article.publishedAt?.toISOString()}>
                    {formatDate(article.publishedAt)}
                </time>
                <span>·</span>
                <span>{article.readingTime} min read</span>
            </div>
            {article.tags && (
                <div className="flex gap-2 mt-4">
                    {article.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                </div>
            )}
        </Link>
    </Card>
);

export { ArticleCard };
```

### 3. Interactive Components (Client)

```tsx
// components/interactive/LikeButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { likePost } from '@/server/actions/like';
import { cn } from '@/lib/utils';

interface ILikeButtonProps {
    slug: string;
    initialCount: number;
}

const LikeButton = ({ slug, initialCount }: ILikeButtonProps) => {
    const [count, setCount] = useState(initialCount);
    const [liked, setLiked] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleLike = () => {
        if (liked) return;
        
        setLiked(true);
        setCount(c => c + 1); // Optimistic update
        
        startTransition(async () => {
            await likePost(slug);
        });
    };

    return (
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike}
            disabled={isPending || liked}
            className={cn(liked && 'text-red-500')}
        >
            <Heart className={cn('h-4 w-4 mr-1', liked && 'fill-current')} />
            {count}
        </Button>
    );
};

export { LikeButton };
```

---

## Design System

### CSS Variables (globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
    :root {
        --background: 0 0% 100%;
        --foreground: 222.2 84% 4.9%;
        --primary: 222.2 47.4% 11.2%;
        --primary-foreground: 210 40% 98%;
        --secondary: 210 40% 96%;
        --secondary-foreground: 222.2 47.4% 11.2%;
        --muted: 210 40% 96%;
        --muted-foreground: 215.4 16.3% 46.9%;
        --border: 214.3 31.8% 91.4%;
        --radius: 0.5rem;
    }

    .dark {
        --background: 222.2 84% 4.9%;
        --foreground: 210 40% 98%;
        --primary: 210 40% 98%;
        --primary-foreground: 222.2 47.4% 11.2%;
        --secondary: 217.2 32.6% 17.5%;
        --secondary-foreground: 210 40% 98%;
        --muted: 217.2 32.6% 17.5%;
        --muted-foreground: 215 20.2% 65.1%;
        --border: 217.2 32.6% 17.5%;
    }
}
```

---

## Page Templates

### Article Page

```tsx
// app/(public)/articles/[slug]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getArticle } from '@/server/queries/content';
import { ArticleHeader } from '@/components/content/ArticleHeader';
import { ArticleBody } from '@/components/content/ArticleBody';
import { Views } from '@/components/content/Views';
import { LikeButton } from '@/components/interactive/LikeButton';
import { TableOfContents } from '@/components/content/TableOfContents';
import { Skeleton } from '@/components/ui/skeleton';

export const revalidate = 3600;

interface IPageProps {
    params: { slug: string };
}

const ArticlePage = async ({ params }: IPageProps) => {
    const article = await getArticle(params.slug);
    
    if (!article) return notFound();
    
    return (
        <article className="container max-w-4xl py-12">
            <ArticleHeader 
                title={article.title}
                description={article.description}
                publishedAt={article.publishedAt}
                readingTime={article.readingTime}
                tags={article.tags}
            />
            
            <div className="flex items-center gap-4 my-6 text-sm text-muted-foreground">
                <Suspense fallback={<Skeleton className="h-4 w-20" />}>
                    <Views slug={article.slug} />
                </Suspense>
                <LikeButton slug={article.slug} initialCount={article.likes ?? 0} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,200px] gap-8">
                <ArticleBody html={article.html ?? ''} />
                <aside className="hidden lg:block">
                    <TableOfContents html={article.html ?? ''} />
                </aside>
            </div>
        </article>
    );
};

export default ArticlePage;
```

---

## Commands

```bash
# Generate component
pnpm generate:component Button

# Run storybook (if configured)
pnpm storybook

# Check accessibility
pnpm a11y:check
```

---

## Success Criteria

- [ ] All UI primitives built with CVA
- [ ] Public layout responsive on all devices
- [ ] Dark mode works correctly
- [ ] All pages render < 400ms FCP
- [ ] Zero accessibility violations (axe-core)
- [ ] Proper loading states with Suspense

---

*Agent Version: 1.0*  
*Project: AadityaHasabnis.site*
