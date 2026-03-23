'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { IArticleListItem, IArticleSubtopicSection } from './types';

interface IArticleSidebarProps {
    topicSlug: string;
    topicTitle: string;
    sections: IArticleSubtopicSection[];
    uncategorizedArticles?: IArticleListItem[];
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
const ArticleSidebar = ({ topicSlug, topicTitle, sections, uncategorizedArticles, currentSlug, className }: IArticleSidebarProps) => {
    const standaloneArticles = uncategorizedArticles ?? [];

    const currentSectionSlug = (() => {
        for (const section of sections) {
            if (section.articles.some((article) => article.slug === currentSlug)) {
                return section.slug;
            }
        }

        if (standaloneArticles.some((article) => article.slug === currentSlug)) {
            return '__uncategorized__';
        }

        return null;
    })();

    // Track expanded sections
    const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        sections.forEach((section) => {
            initial[section.slug] = section.slug === currentSectionSlug;
        });
        initial['__uncategorized__'] = currentSectionSlug === '__uncategorized__';
        return initial;
    });

    const toggleSection = (slug: string) => {
        setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
    };

    return (
        <nav className={cn('', className)} aria-label='Article navigation'>
            {/* Topic Link */}
            <Link href={`/articles/${topicSlug}`} className='mb-4 block text-body font-medium text-foreground transition-base hover:text-primary'>
                {topicTitle}
            </Link>

            <div className='space-y-1'>
                {/* Uncategorized articles */}
                {standaloneArticles.length > 0 && (
                    <SidebarSection title='General' isExpanded={expanded['__uncategorized__']} onToggle={() => toggleSection('__uncategorized__')}>
                        {standaloneArticles.map((article) => (
                            <SidebarLink key={article.id} href={`/articles/${topicSlug}/${article.slug}`} isActive={article.slug === currentSlug}>
                                {article.title}
                            </SidebarLink>
                        ))}
                    </SidebarSection>
                )}

                {/* Subtopic sections */}
                {sections.map((section) => {
                    if (section.articles.length === 0) return null;

                    return (
                        <SidebarSection key={section.id} title={section.title} isExpanded={expanded[section.slug]} onToggle={() => toggleSection(section.slug)}>
                            {section.articles.map((article) => (
                                <SidebarLink key={article.id} href={`/articles/${topicSlug}/${article.slug}`} isActive={article.slug === currentSlug}>
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
function SidebarSection({ title, isExpanded, onToggle, children }: { title: string; isExpanded: boolean; onToggle: () => void; children: React.ReactNode }) {
    return (
        <div>
            <button
                onClick={onToggle}
                className={cn('flex w-full items-center justify-between rounded-md px-2 py-1.5 text-body font-medium transition-colors', 'text-muted-foreground hover:bg-muted hover:text-foreground')}
                aria-expanded={isExpanded}
            >
                <span className='truncate'>{title}</span>
                <ChevronDown className={cn('size-4 shrink-0 transition-transform', isExpanded && 'rotate-180')} />
            </button>
            {isExpanded && <div className='mt-1 ml-2 space-y-0.5 border-l border-border pl-2'>{children}</div>}
        </div>
    );
}

/**
 * SidebarLink - Individual article link
 */
function SidebarLink({ href, isActive, children }: { href: string; isActive: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-body transition-colors',
                isActive ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
        >
            <FileText className='size-3.5 shrink-0' />
            <span className='truncate'>{children}</span>
        </Link>
    );
}

export { ArticleSidebar };
export type { IArticleSidebarProps };
