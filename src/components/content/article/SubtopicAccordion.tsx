'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { BookOpen, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { IArticleListItem, IArticleSubtopicSection } from './types';

interface ISubtopicAccordionProps {
    topicSlug: string;
    sections: IArticleSubtopicSection[];
    uncategorizedArticles?: IArticleListItem[];
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
const SubtopicAccordion = ({ topicSlug, sections, uncategorizedArticles, defaultOpen, className }: ISubtopicAccordionProps) => {
    const standaloneArticles = uncategorizedArticles ?? [];
    const hasSections = sections.length > 0;
    const hasStandaloneArticles = standaloneArticles.length > 0;
    const sectionSlugSet = useMemo(() => new Set(sections.map((section) => section.slug)), [sections]);
    const [openSections, setOpenSections] = useState<string[]>(() => {
        if (defaultOpen && defaultOpen.length > 0) {
            return defaultOpen;
        }
        return sections[0]?.slug ? [sections[0].slug] : [];
    });

    useEffect(() => {
        const applyHashToAccordion = () => {
            const hashSlug = decodeURIComponent(window.location.hash.replace('#', '').trim());
            if (!hashSlug || !sectionSlugSet.has(hashSlug)) return;
            setOpenSections((previous) => (previous.includes(hashSlug) ? previous : [...previous, hashSlug]));
        };

        applyHashToAccordion();
        window.addEventListener('hashchange', applyHashToAccordion);
        return () => window.removeEventListener('hashchange', applyHashToAccordion);
    }, [sectionSlugSet]);

    if (!hasSections && !hasStandaloneArticles) {
        return (
            <section className='relative flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-16 text-center'>
                <div className='mb-3 flex size-12 items-center justify-center rounded-full bg-muted'>
                    <BookOpen className='size-5 text-muted-foreground' />
                </div>
                <p className='text-body font-medium text-foreground'>No articles yet</p>
                <p className='mt-1.5 text-small text-muted-foreground'>New content will appear here as soon as it is published.</p>
            </section>
        );
    }

    return (
        <div className={cn('space-y-3', className)}>
            {/* Uncategorized articles (if any) */}
            {hasStandaloneArticles && (
                <section className='overflow-hidden rounded-xl border border-border bg-background'>
                    <header className='flex items-center gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 sm:px-5 sm:py-3.5'>
                        <div className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
                            <FileText className='size-3.5 text-primary' />
                        </div>
                        <div className='min-w-0 flex-1'>
                            <h3 className='text-small font-semibold text-foreground'>General Articles</h3>
                            <p className='hidden text-label text-muted-foreground sm:block'>Articles without a dedicated subtopic</p>
                        </div>
                        <ArticleCountBadge count={standaloneArticles.length} />
                    </header>
                    <ArticleList topicSlug={topicSlug} articles={standaloneArticles} className='space-y-px p-2' />
                </section>
            )}

            {/* Subtopics with accordion */}
            {hasSections && (
                <Accordion type='multiple' value={openSections} onValueChange={setOpenSections} className='space-y-2'>
                    {sections.map((section) => (
                        <AccordionItem id={section.slug} key={section.id} value={section.slug} className='overflow-hidden rounded-xl border border-border bg-background last:border-b'>
                            <AccordionTrigger className='bg-muted/10 px-4 py-3 hover:bg-muted/25 hover:no-underline data-[state=open]:bg-muted/20 data-[state=open]:border-b data-[state=open]:border-border/50 sm:px-5 sm:py-3.5'>
                                <div className='flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3'>
                                    <div className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30'>
                                        <BookOpen className='size-3.5 text-violet-600 dark:text-violet-400' />
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                        <p className='truncate text-small font-semibold leading-snug text-foreground'>{section.title}</p>
                                        {section.description && <p className='mt-0.5 hidden truncate text-label text-muted-foreground sm:block'>{section.description}</p>}
                                    </div>
                                    <ArticleCountBadge count={section.contentCount} />
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className='px-2 pb-2 pt-1'>
                                {section.articles.length === 0 ? (
                                    <p className='px-3 py-3 text-small text-muted-foreground'>No articles in this section yet.</p>
                                ) : (
                                    <ArticleList topicSlug={topicSlug} articles={section.articles} className='space-y-px' />
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    );
};

// =============================================================
// ArticleCountBadge
// =============================================================
function ArticleCountBadge({ count }: { count: number }) {
    return (
        <span className='shrink-0 rounded-full border border-border bg-background px-2 py-0.5 text-label font-medium text-muted-foreground sm:px-2.5'>
            {count}
            <span className='hidden sm:inline'>&nbsp;{count !== 1 ? 'articles' : 'article'}</span>
        </span>
    );
}

function ArticleList({ topicSlug, articles, className }: { topicSlug: string; articles: IArticleListItem[]; className?: string }) {
    return (
        <div className={className}>
            {articles.map((article) => (
                <ArticleListItem key={article.id} topicSlug={topicSlug} article={article} />
            ))}
        </div>
    );
}

// =============================================================
// ArticleListItem — individual article link in the accordion
// =============================================================
function ArticleListItem({ topicSlug, article }: { topicSlug: string; article: IArticleListItem }) {
    return (
        <Link
            href={`/articles/${topicSlug}/${article.slug}`}
            className='group flex items-start gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-base hover:border-border/60 hover:bg-muted/50'
        >
            <FileText className='mt-0.5 size-3.5 shrink-0 text-muted-foreground/60 transition-base group-hover:text-primary' />
            <div className='min-w-0 flex-1'>
                <span className='line-clamp-2 text-small font-medium text-foreground transition-base group-hover:text-primary'>{article.title}</span>
                {article.description && <p className='mt-0.5 line-clamp-2 text-label leading-relaxed text-muted-foreground'>{article.description}</p>}
            </div>
            {article.readingTime > 0 && (
                <span className='flex shrink-0 items-center gap-1 text-label text-muted-foreground/70'>
                    <Clock className='size-3' aria-hidden />
                    {article.readingTime}m
                </span>
            )}
        </Link>
    );
}

export { SubtopicAccordion };
export type { ISubtopicAccordionProps };
