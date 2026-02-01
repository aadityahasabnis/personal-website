'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ISubtopic, IArticle } from '@/interfaces';

interface IArticleItem {
    slug: string;
    title: string;
    subtopicSlug?: string;
    order: number;
}

interface IArticleSidebarProps {
    topicSlug: string;
    topicTitle: string;
    subtopics: ISubtopic[];
    articles: IArticleItem[];
    /** Currently active article slug */
    currentSlug: string;
    /** Additional className */
    className?: string;
}

/**
 * ArticleSidebar - Client Component for article page navigation
 * 
 * Shows a collapsible sidebar with subtopics and articles.
 * Highlights the current article.
 */
const ArticleSidebar = ({
    topicSlug,
    topicTitle,
    subtopics,
    articles,
    currentSlug,
    className,
}: IArticleSidebarProps) => {
    // Group articles by subtopic
    const articlesBySubtopic = articles.reduce<Record<string, IArticleItem[]>>(
        (acc, article) => {
            const key = article.subtopicSlug || '__uncategorized__';
            if (!acc[key]) acc[key] = [];
            acc[key].push(article);
            return acc;
        },
        {}
    );

    // Find which subtopic the current article is in
    const currentArticle = articles.find((a) => a.slug === currentSlug);
    const currentSubtopicSlug = currentArticle?.subtopicSlug || '__uncategorized__';

    // Track expanded sections
    const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        // Expand the section containing the current article
        subtopics.forEach((s) => {
            initial[s.slug] = s.slug === currentSubtopicSlug;
        });
        initial['__uncategorized__'] = currentSubtopicSlug === '__uncategorized__';
        return initial;
    });

    const toggleSection = (slug: string) => {
        setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
    };

    const uncategorizedArticles = articlesBySubtopic['__uncategorized__'] || [];

    return (
        <nav
            className={cn('', className)}
            aria-label="Article navigation"
        >
            {/* Topic Link */}
            <Link
                href={`/articles/${topicSlug}`}
                className="block text-sm font-medium text-[var(--fg)] hover:text-[var(--accent)] transition-colors mb-4"
            >
                {topicTitle}
            </Link>

            <div className="space-y-1">
                {/* Uncategorized articles */}
                {uncategorizedArticles.length > 0 && (
                    <SidebarSection
                        title="General"
                        isExpanded={expanded['__uncategorized__']}
                        onToggle={() => toggleSection('__uncategorized__')}
                    >
                        {uncategorizedArticles.map((article) => (
                            <SidebarLink
                                key={article.slug}
                                href={`/articles/${topicSlug}/${article.slug}`}
                                isActive={article.slug === currentSlug}
                            >
                                {article.title}
                            </SidebarLink>
                        ))}
                    </SidebarSection>
                )}

                {/* Subtopic sections */}
                {subtopics.map((subtopic) => {
                    const subtopicArticles = articlesBySubtopic[subtopic.slug] || [];
                    if (subtopicArticles.length === 0) return null;

                    return (
                        <SidebarSection
                            key={subtopic.slug}
                            title={subtopic.title}
                            isExpanded={expanded[subtopic.slug]}
                            onToggle={() => toggleSection(subtopic.slug)}
                        >
                            {subtopicArticles.map((article) => (
                                <SidebarLink
                                    key={article.slug}
                                    href={`/articles/${topicSlug}/${article.slug}`}
                                    isActive={article.slug === currentSlug}
                                >
                                    {article.title}
                                </SidebarLink>
                            ))}
                        </SidebarSection>
                    );
                })}
            </div>
        </nav>
    );
};

/**
 * SidebarSection - Collapsible section for a subtopic
 */
function SidebarSection({
    title,
    isExpanded,
    onToggle,
    children,
}: {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div>
            <button
                onClick={onToggle}
                className={cn(
                    'flex items-center justify-between w-full px-2 py-1.5 text-sm font-medium rounded-md transition-colors',
                    'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]'
                )}
                aria-expanded={isExpanded}
            >
                <span className="truncate">{title}</span>
                <ChevronDown
                    className={cn(
                        'size-4 shrink-0 transition-transform',
                        isExpanded && 'rotate-180'
                    )}
                />
            </button>
            {isExpanded && (
                <div className="mt-1 ml-2 pl-2 border-l border-[var(--border-color)] space-y-0.5">
                    {children}
                </div>
            )}
        </div>
    );
}

/**
 * SidebarLink - Individual article link
 */
function SidebarLink({
    href,
    isActive,
    children,
}: {
    href: string;
    isActive: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors',
                isActive
                    ? 'text-[var(--accent)] bg-[var(--accent-subtle)] font-medium'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)]'
            )}
        >
            <FileText className="size-3.5 shrink-0" />
            <span className="truncate">{children}</span>
        </Link>
    );
}

export { ArticleSidebar };
export type { IArticleSidebarProps };
