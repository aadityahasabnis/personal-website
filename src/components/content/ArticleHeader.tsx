'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Clock, Calendar } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface IBreadcrumb {
    label: string;
    href: string;
}

interface IArticleHeaderProps {
    /** Breadcrumb trail */
    breadcrumbs: IBreadcrumb[];
    /** Article title */
    title: string;
    /** Article description */
    description?: string;
    /** Reading time in minutes */
    readingTime?: number;
    /** Published date */
    publishedAt?: Date | string;
    /** Updated date */
    updatedAt?: Date | string;
    /** Tags */
    tags?: string[];
    /** Additional className */
    className?: string;
}

/**
 * ArticleHeader - Server Component for article page header
 * 
 * Shows breadcrumbs, title, description, and meta info.
 * All breadcrumbs are clickable for navigation.
 */
const ArticleHeader = ({
    breadcrumbs,
    title,
    description,
    readingTime,
    publishedAt,
    updatedAt,
    tags,
    className,
}: IArticleHeaderProps) => {
    return (
        <header className={cn('mb-10 pt-4', className)}>
            {/* Breadcrumbs - All clickable with Microdata */}
            <nav
                className="mb-8 flex items-center gap-1.5 text-sm text-[var(--fg-muted)] flex-wrap"
                aria-label="Breadcrumb"
                itemScope
                itemType="https://schema.org/BreadcrumbList"
            >
                {breadcrumbs.map((crumb, index) => (
                    <span 
                        key={crumb.href} 
                        className="flex items-center gap-1.5"
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                    >
                        {index > 0 && (
                            <ChevronRight className="size-3.5 text-[var(--fg-subtle)] shrink-0" />
                        )}
                        <Link
                            href={crumb.href}
                            itemProp="item"
                            className={cn(
                                'hover:text-[var(--accent)] transition-colors',
                                index === breadcrumbs.length - 1 
                                    ? 'text-[var(--fg)] font-medium max-w-[300px] truncate' 
                                    : 'hover:underline underline-offset-2'
                            )}
                        >
                            <span itemProp="name">{crumb.label}</span>
                        </Link>
                        <meta itemProp="position" content={(index + 1).toString()} />
                    </span>
                ))}
            </nav>

            {/* Tags Pills - Above Title */}
            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {tags.slice(0, 5).map((tag) => (
                        <span
                            key={tag}
                            className={cn(
                                'inline-flex items-center px-3 py-1.5 rounded-full',
                                'text-xs font-medium uppercase tracking-wider',
                                'bg-[var(--accent-subtle)] text-[var(--accent)]',
                                'border border-[var(--accent)]/20'
                            )}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--fg)] leading-tight">
                {title}
            </h1>

            {/* Description */}
            {description && (
                <p className="mt-6 text-lg md:text-xl text-[var(--fg-muted)] leading-relaxed max-w-3xl">
                    {description}
                </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 mt-6 text-sm text-[var(--fg-subtle)] flex-wrap">
                {publishedAt && (
                    <span className="flex items-center gap-1.5">
                        <Calendar className="size-4" />
                        <time dateTime={new Date(publishedAt).toISOString()}>
                            {formatDate(publishedAt)}
                        </time>
                    </span>
                )}
                {readingTime && (
                    <span className="flex items-center gap-1.5">
                        <Clock className="size-4" />
                        {readingTime} min read
                    </span>
                )}
                {updatedAt && publishedAt && new Date(updatedAt) > new Date(publishedAt) && (
                    <span className="text-[var(--fg-subtle)]">
                        (Updated {formatDate(updatedAt)})
                    </span>
                )}
            </div>

            {/* Decorative Animated Beam Line */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-8 h-px bg-gradient-to-r from-[var(--accent)] via-[var(--accent)]/50 to-transparent"
                style={{ transformOrigin: 'left' }}
            />
        </header>
    );
};

export { ArticleHeader };
export type { IArticleHeaderProps, IBreadcrumb };
