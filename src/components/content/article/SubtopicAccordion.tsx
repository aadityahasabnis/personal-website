'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Clock, FileText } from 'lucide-react';
import Link from 'next/link';
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

    if (sections.length === 0 && standaloneArticles.length === 0) {
        return (
            <div className='py-12 text-center'>
                <p className='text-body text-muted-foreground'>No articles available in this topic yet.</p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-6', className)}>
            {/* Uncategorized articles (if any) */}
            {standaloneArticles.length > 0 && (
                <section className='space-y-2'>
                    <h3 className='mb-4 text-small font-medium text-muted-foreground'>General Articles</h3>
                    <div className='space-y-1'>
                        {standaloneArticles.map((article) => (
                            <ArticleListItem key={article.id} topicSlug={topicSlug} article={article} />
                        ))}
                    </div>
                </section>
            )}

            {/* Subtopics with accordion */}
            {sections.length > 0 && (
                <Accordion type='multiple' defaultValue={defaultOpen ?? [sections[0]?.slug]} className='space-y-2'>
                    {sections.map((section) => {
                        return (
                            <AccordionItem key={section.id} value={section.slug} className='overflow-hidden rounded-xl border border-border bg-card'>
                                <AccordionTrigger className='px-4 py-3 hover:bg-muted hover:no-underline'>
                                    <div className='flex items-center gap-3 text-left'>
                                        <span className='font-medium text-foreground'>{section.title}</span>
                                        <span className='rounded-full bg-muted px-2 py-0.5 text-label text-muted-foreground'>
                                            {section.articles.length} article{section.articles.length !== 1 ? 's' : ''}
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
        <Link href={`/articles/${topicSlug}/${article.slug}`} className={cn('group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors', 'hover:bg-muted')}>
            <FileText className='mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary' />
            <div className='min-w-0 flex-1'>
                <span className='line-clamp-1 text-body font-medium text-foreground transition-colors group-hover:text-primary'>{article.title}</span>
                {article.description && <p className='mt-0.5 line-clamp-1 text-small text-muted-foreground'>{article.description}</p>}
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
