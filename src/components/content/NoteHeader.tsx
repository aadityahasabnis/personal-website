'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, Calendar, Clock, Tag, Lightbulb } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface INoteHeaderProps {
    /** Note title */
    title: string;
    /** Note description */
    description?: string;
    /** Tags */
    tags?: string[];
    /** Published date */
    publishedAt?: Date | string;
    /** Updated date */
    updatedAt?: Date | string;
    /** Reading time in minutes */
    readingTime?: number;
}

/**
 * NoteHeader - Professional header component for note pages
 * 
 * Features:
 * - Breadcrumb navigation with microdata
 * - Badge with gradient styling
 * - Tag pills with hover effects
 * - Title with optimal typography
 * - Description with proper spacing
 * - Meta information (date, reading time, last updated)
 * - Decorative gradient line
 * - Responsive design
 * 
 * Matches the professional style of ArticleHeader
 */
export const NoteHeader = ({
    title,
    description,
    tags,
    publishedAt,
    updatedAt,
    readingTime,
}: INoteHeaderProps) => {
    const showUpdatedBadge = updatedAt && publishedAt && 
        new Date(updatedAt).getTime() > new Date(publishedAt).getTime() + 86400000; // 1 day difference

    return (
        <header className="max-w-4xl mx-auto px-6 lg:px-8 pt-24 md:pt-32 pb-12">
            {/* Breadcrumb Navigation with Schema.org Microdata */}
            <nav 
                className="mb-8"
                itemScope
                itemType="https://schema.org/BreadcrumbList"
            >
                <ol className="flex items-center gap-2 text-sm">
                    <li
                        itemProp="itemListElement"
                        itemScope
                        itemType="https://schema.org/ListItem"
                    >
                        <Link
                            href="/notes"
                            itemProp="item"
                            className="inline-flex items-center gap-1 text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors"
                        >
                            <ChevronLeft className="size-4" />
                            <span itemProp="name">Notes</span>
                        </Link>
                        <meta itemProp="position" content="1" />
                    </li>
                </ol>
            </nav>

            {/* Badge + Tags Row */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                {/* Note Type Badge with Icon */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent)]/10 border-2 border-[var(--accent)]/30">
                    <Lightbulb className="size-4 text-[var(--accent)]" />
                    <span className="text-sm font-semibold text-[var(--accent)]">
                        Quick Note
                    </span>
                </div>

                {/* Tag Pills */}
                {tags && tags.length > 0 && (
                    <>
                        {tags.map((tag) => (
                            <Link
                                key={tag}
                                href={`/notes?tag=${encodeURIComponent(tag)}`}
                                className={cn(
                                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
                                    'bg-[var(--surface)] text-[var(--fg-muted)] border border-[var(--border-color)]',
                                    'hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5',
                                    'transition-all duration-200'
                                )}
                            >
                                <Tag className="size-3" />
                                {tag}
                            </Link>
                        ))}
                    </>
                )}

                {/* Last Updated Badge (if applicable) */}
                {showUpdatedBadge && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="size-3" />
                        Updated {formatDate(updatedAt)}
                    </span>
                )}
            </div>

            {/* Title */}
            <h1 
                className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--fg)] mb-6 leading-tight"
                itemProp="headline"
            >
                {title}
            </h1>

            {/* Description */}
            {description && (
                <p 
                    className="text-lg md:text-xl text-[var(--fg-muted)] leading-relaxed max-w-3xl"
                    itemProp="description"
                >
                    {description}
                </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 mt-6 text-sm text-[var(--fg-subtle)]">
                {/* Published Date */}
                {publishedAt && (
                    <span className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        <time 
                            dateTime={new Date(publishedAt).toISOString()}
                            itemProp="datePublished"
                        >
                            {formatDate(publishedAt)}
                        </time>
                    </span>
                )}

                {/* Reading Time */}
                {readingTime && (
                    <span className="flex items-center gap-2">
                        <Clock className="size-4" />
                        {readingTime} min read
                    </span>
                )}
            </div>

            {/* Decorative Gradient Line with Animation */}
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

export type { INoteHeaderProps };
