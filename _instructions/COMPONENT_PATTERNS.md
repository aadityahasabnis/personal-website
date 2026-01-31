# Component Patterns

> Reusable component patterns for AadityaHasabnis.site

---

## UI Primitives (CVA Pattern)

All UI primitives use Class Variance Authority for type-safe variants.

### Button

```tsx
// components/ui/button.tsx
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
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
        defaultVariants: { variant: 'default', size: 'default' }
    }
);

interface IButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
}

const Button = ({ className, variant, size, asChild, isLoading, children, ...props }: IButtonProps) => {
    const Comp = asChild ? Slot : 'button';
    return (
        <Comp className={cn(buttonVariants({ variant, size }), className)} disabled={isLoading} {...props}>
            {isLoading && <Spinner className="h-4 w-4 animate-spin" />}
            {children}
        </Comp>
    );
};

export { Button, buttonVariants };
```

### Card

```tsx
// components/ui/card.tsx
import { cn } from '@/lib/utils';

const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('rounded-lg border bg-card p-6 shadow-sm', className)} {...props} />
);

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col space-y-1.5', className)} {...props} />
);

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn('text-xl font-semibold leading-none tracking-tight', className)} {...props} />
);

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('pt-4', className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardContent };
```

---

## Content Components

### ArticleCard

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
    <Card className="group transition-shadow hover:shadow-lg">
        <Link href={`/articles/${article.slug}`} className="block">
            <h2 className="text-xl font-semibold transition-colors group-hover:text-primary">
                {article.title}
            </h2>
            {article.description && (
                <p className="mt-2 line-clamp-2 text-muted-foreground">
                    {article.description}
                </p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime={article.publishedAt?.toISOString()}>
                    {formatDate(article.publishedAt)}
                </time>
                <span>·</span>
                <span>{article.readingTime} min read</span>
            </div>
            {article.tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
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

### ArticleBody

```tsx
// components/content/ArticleBody.tsx
import { cn } from '@/lib/utils';

interface IArticleBodyProps {
    html: string;
    className?: string;
}

const ArticleBody = ({ html, className }: IArticleBodyProps) => (
    <article
        className={cn(
            'prose prose-lg dark:prose-invert',
            'prose-headings:scroll-mt-20',
            'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
            'prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5',
            'prose-pre:bg-muted',
            className
        )}
        dangerouslySetInnerHTML={{ __html: html }}
    />
);

export { ArticleBody };
```

---

## Interactive Components

### LikeButton

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
        setCount(c => c + 1);
        startTransition(() => likePost(slug));
    };

    return (
        <Button variant="ghost" size="sm" onClick={handleLike} disabled={isPending || liked}>
            <Heart className={cn('h-4 w-4', liked && 'fill-red-500 text-red-500')} />
            <span>{count}</span>
        </Button>
    );
};

export { LikeButton };
```

### ThemeToggle

```tsx
// components/interactive/ThemeToggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
};

export { ThemeToggle };
```

---

## Layout Components

### Header

```tsx
// components/layout/Header.tsx
import Link from 'next/link';
import { ThemeToggle } from '@/components/interactive/ThemeToggle';
import { NAV_LINKS } from '@/constants/navigation';

const Header = () => (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <nav className="container flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold">
                Aaditya
            </Link>
            <div className="flex items-center gap-6">
                {NAV_LINKS.map(link => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {link.label}
                    </Link>
                ))}
                <ThemeToggle />
            </div>
        </nav>
    </header>
);

export { Header };
```

### Footer

```tsx
// components/layout/Footer.tsx
import Link from 'next/link';
import { SITE_CONFIG } from '@/constants/siteConfig';

const Footer = () => (
    <footer className="border-t">
        <div className="container py-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} {SITE_CONFIG.author.name}
                </p>
                <div className="flex gap-4">
                    {SITE_CONFIG.socials.map(social => (
                        <Link
                            key={social.name}
                            href={social.url}
                            className="text-muted-foreground hover:text-foreground"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {social.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    </footer>
);

export { Footer };
```

---

## Streaming Components

### Views (Server Component)

```tsx
// components/content/Views.tsx
import { getAndIncrementViews } from '@/server/queries/stats';

interface IViewsProps {
    slug: string;
}

const Views = async ({ slug }: IViewsProps) => {
    const count = await getAndIncrementViews(slug);
    return <span className="text-sm text-muted-foreground">{count} views</span>;
};

export { Views };
```

### Usage with Suspense

```tsx
// In page component
<Suspense fallback={<Skeleton className="h-4 w-16" />}>
    <Views slug={article.slug} />
</Suspense>
```

---

*Version: 1.0*
