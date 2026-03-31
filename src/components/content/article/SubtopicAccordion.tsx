'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Clock, FileText } from 'lucide-react';
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

            if (!hashSlug || !sectionSlugSet.has(hashSlug)) {
                return;
            }

            setOpenSections((previous) => (previous.includes(hashSlug) ? previous : [...previous, hashSlug]));
        };

        applyHashToAccordion();
        window.addEventListener('hashchange', applyHashToAccordion);

        return () => {
            window.removeEventListener('hashchange', applyHashToAccordion);
        };
    }, [sectionSlugSet]);

    if (sections.length === 0 && standaloneArticles.length === 0) {
        return (
            <section className='relative flex flex-col items-center justify-center rounded-2xl border border-border bg-linear-to-b from-card to-card/60 px-6 py-16 text-center'>
                <p className='text-body font-medium text-foreground'>No articles available in this topic yet.</p>
                <p className='mt-2 text-small text-muted-foreground'>New content will appear here as soon as it is published.</p>
            </section>
        );
    }

    return (
        <div className={cn('space-y-6', className)}>
            {/* Uncategorized articles (if any) */}
            {standaloneArticles.length > 0 && (
                <section className='overflow-hidden rounded-xl border border-border bg-card'>
                    <header className='flex items-center justify-between gap-3 px-4 py-3 border-b border-border/60 bg-muted/30'>
                        <div className='min-w-0'>
                            <h3 className='text-body font-medium text-foreground'>General Articles</h3>
                            <p className='line-clamp-1 text-small text-muted-foreground'>Articles without a dedicated subtopic.</p>
                        </div>
                        <span className='shrink-0 rounded-full bg-primary/8 px-2 py-0.5 text-label font-medium text-primary'>
                            {standaloneArticles.length} article{standaloneArticles.length !== 1 ? 's' : ''}
                        </span>
                    </header>
                    <div className='space-y-1 p-2'>
                        {standaloneArticles.map((article) => (
                            <ArticleListItem key={article.id} topicSlug={topicSlug} article={article} />
                        ))}
                    </div>
                </section>
            )}

            {/* Subtopics with accordion */}
            {sections.length > 0 && (
                <Accordion type='multiple' value={openSections} onValueChange={setOpenSections} className='space-y-2'>
                    {sections.map((section) => {
                        return (
                            <AccordionItem id={section.slug} key={section.id} value={section.slug} className='overflow-hidden rounded-xl border border-border bg-card'>
                                <AccordionTrigger className='px-4 py-3 hover:bg-muted hover:no-underline'>
                                    <div className='flex items-start justify-between gap-3 w-full text-left'>
                                        <div className='min-w-0'>
                                            <p className='font-medium text-foreground'>{section.title}</p>
                                            {section.description && <p className='mt-0.5 line-clamp-1 text-small text-muted-foreground'>{section.description}</p>}
                                        </div>
                                        <span className='shrink-0 rounded-full bg-muted px-2 py-0.5 text-label text-muted-foreground'>
                                            {section.contentCount} article{section.contentCount !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className='px-2 pb-2'>
                                    {section.articles.length === 0 ? (
                                        <p className='px-2 py-3 text-body text-muted-foreground'>No articles in this section yet.</p>
                                    ) : (
                                        <div className='space-y-1'>
                                            {section.articles.map((article) => (
                                                <ArticleListItem key={article.id} topicSlug={topicSlug} article={article} />
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
function ArticleListItem({ topicSlug, article }: { topicSlug: string; article: IArticleListItem }) {
    return (
        <Link
            href={`/articles/${topicSlug}/${article.slug}`}
            className={cn('group flex items-start gap-3 rounded-lg border border-transparent bg-background/50 px-3 py-2.5 transition-colors', 'hover:border-border hover:bg-muted/70')}
        >
            <FileText className='mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary' />
            <div className='min-w-0 flex-1'>
                <span className='line-clamp-1 text-body font-medium text-foreground transition-colors group-hover:text-primary'>{article.title}</span>
                {article.description && <p className='mt-0.5 line-clamp-2 text-small text-muted-foreground'>{article.description}</p>}
            </div>
            <div className='flex shrink-0 items-center gap-3 text-label text-muted-foreground'>
                {article.readingTime > 0 && (
                    <span className='flex items-center gap-1'>
                        <Clock className='size-3' />
                        {article.readingTime}m
                    </span>
                )}
            </div>
        </Link>
    );
}

export { SubtopicAccordion };
export type { ISubtopicAccordionProps };
