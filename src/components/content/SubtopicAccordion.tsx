'use client';

import Link from 'next/link';
import { FileText, Clock, Eye } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import type { ISubtopic, IArticle } from '@/interfaces';

interface IArticleItem {
    slug: string;
    title: string;
    description?: string;
    subtopicSlug?: string;
    order: number;
    readingTime?: number;
    publishedAt?: Date;
}

interface ISubtopicAccordionProps {
    topicSlug: string;
    subtopics: ISubtopic[];
    articles: IArticleItem[];
    /** Default open subtopic slugs */
    defaultOpen?: string[];
    /** Additional className */
    className?: string;
}

/**
 * SubtopicAccordion - Client Component for displaying subtopics with articles
 * 
 * Used on the topic detail page to show a collapsible list of subtopics
 * with their articles inside.
 */
const SubtopicAccordion = ({
    topicSlug,
    subtopics,
    articles,
    defaultOpen,
    className,
}: ISubtopicAccordionProps) => {
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

    // Articles without subtopic (directly under topic)
    const uncategorizedArticles = articlesBySubtopic['__uncategorized__'] || [];

    if (subtopics.length === 0 && uncategorizedArticles.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-[var(--fg-muted)]">
                    No articles available in this topic yet.
                </p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-6', className)}>
            {/* Uncategorized articles (if any) */}
            {uncategorizedArticles.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-[var(--fg-muted)] mb-4">
                        General Articles
                    </h3>
                    <div className="space-y-1">
                        {uncategorizedArticles.map((article) => (
                            <ArticleListItem
                                key={article.slug}
                                topicSlug={topicSlug}
                                article={article}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Subtopics with accordion */}
            {subtopics.length > 0 && (
                <Accordion
                    type="multiple"
                    defaultValue={defaultOpen || [subtopics[0]?.slug]}
                    className="space-y-2"
                >
                    {subtopics.map((subtopic) => {
                        const subtopicArticles = articlesBySubtopic[subtopic.slug] || [];
                        
                        return (
                            <AccordionItem
                                key={subtopic.slug}
                                value={subtopic.slug}
                                className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--card-bg)]"
                            >
                                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-[var(--surface-hover)]">
                                    <div className="flex items-center gap-3 text-left">
                                        <span className="font-medium text-[var(--fg)]">
                                            {subtopic.title}
                                        </span>
                                        <span className="text-xs text-[var(--fg-subtle)] bg-[var(--surface)] px-2 py-0.5 rounded-full">
                                            {subtopicArticles.length} article{subtopicArticles.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-2 pb-2">
                                    {subtopicArticles.length === 0 ? (
                                        <p className="text-sm text-[var(--fg-muted)] px-2 py-3">
                                            No articles in this section yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-1">
                                            {subtopicArticles.map((article) => (
                                                <ArticleListItem
                                                    key={article.slug}
                                                    topicSlug={topicSlug}
                                                    article={article}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            )}
        </div>
    );
};

/**
 * ArticleListItem - Individual article link in the accordion
 */
function ArticleListItem({
    topicSlug,
    article,
}: {
    topicSlug: string;
    article: IArticleItem;
}) {
    return (
        <Link
            href={`/articles/${topicSlug}/${article.slug}`}
            className={cn(
                'group flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors',
                'hover:bg-[var(--surface-hover)]'
            )}
        >
            <FileText className="size-4 mt-0.5 text-[var(--fg-subtle)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
            <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                    {article.title}
                </span>
                {article.description && (
                    <p className="text-xs text-[var(--fg-muted)] line-clamp-1 mt-0.5">
                        {article.description}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--fg-subtle)] shrink-0">
                {article.readingTime && (
                    <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {article.readingTime}m
                    </span>
                )}
            </div>
        </Link>
    );
}

export { SubtopicAccordion };
export type { ISubtopicAccordionProps };
