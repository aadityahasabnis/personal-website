'use client';

import { ScrollToTop } from '@/components/common/ScrollToTop';
import PageHeader from '@/components/layout/PageHeader';
import FadeIn from '@/components/motion/FadeIn';
import type { ILegalPageContent } from '@/constants/legalConstants';
import { Calendar } from 'lucide-react';

interface ILegalPageClientProps {
    content: ILegalPageContent;
}

// =============================================================
// LegalPageClient — Reusable renderer for legal content pages
// =============================================================
export default function LegalPageClient({ content }: ILegalPageClientProps) {
    const { hero, meta, sections, summary } = content;

    return (
        <main className='relative mx-auto flex max-w-5xl flex-col gap-10 px-6 py-20 md:py-24 lg:px-8'>
            <section className='relative'>
                <PageHeader label={hero.label} title={hero.title} description={hero.description} />
                <FadeIn direction='up' delay={0.16} duration={0.55} distance={14} trigger='always'>
                    <p className='flex items-center gap-2 text-small text-muted-foreground'>
                        <Calendar className='size-3.5' aria-hidden='true' />
                        <span>Last updated: {meta.lastUpdated}</span>
                    </p>
                </FadeIn>

                {summary && summary.length > 0 && (
                    <FadeIn direction='up' delay={0.22} duration={0.55} distance={14} trigger='always'>
                        <section className='mt-5 rounded-xl border border-primary/25 bg-primary/5 p-4 md:p-5' aria-label='Legal summary'>
                            <p className='text-label font-semibold text-foreground'>Summary</p>
                            <ul className='mt-2 flex flex-col gap-2'>
                                {summary.map((item, index) => (
                                    <li key={`${item.point}-${index}`} className='relative pl-4 text-small text-muted-foreground'>
                                        <span className='absolute left-0 top-2 size-1.5 rounded-full bg-primary/70' aria-hidden='true' />
                                        {item.point}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </FadeIn>
                )}
            </section>

            <div className='flex flex-col gap-6'>
                {sections.map((section, index) => (
                    <FadeIn key={section.id} direction='up' duration={0.5} distance={16}>
                        <article
                            id={section.id}
                            className='relative flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-none transition-slow hover:border-primary/25 hover:shadow-md sm:p-5 md:rounded-xl md:p-8'
                        >
                            {/* Section heading */}
                            <div className='flex items-start gap-2 sm:gap-2.5 md:gap-3'>
                                <span className='mt-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary sm:h-6 sm:min-w-6 sm:px-2 sm:text-small md:h-7 md:min-w-7 md:px-2.5 md:text-label'>
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <h2 className='text-h4 font-semibold text-foreground md:text-h3'>{section.title}</h2>
                            </div>

                            {/* Section body */}
                            <div className='flex flex-col gap-3 pl-0 sm:pl-8 md:pl-10'>
                                {section.content.map((paragraph) => (
                                    <p key={paragraph.slice(0, 48)} className='text-body leading-relaxed text-muted-foreground'>
                                        {paragraph}
                                    </p>
                                ))}

                                {/* Bullet list */}
                                {section.list && section.list.items.length > 0 && (
                                    <ul className='mt-1 flex flex-col gap-3' role='list'>
                                        {section.list.items.map((item) => (
                                            <li key={item.label} className='relative flex gap-3 pl-4'>
                                                <span className='absolute left-0 top-2.5 size-1.5 rounded-full bg-primary/70' aria-hidden='true' />
                                                <div className='flex flex-col gap-0.5'>
                                                    <span className='text-body font-medium text-foreground'>{item.label}</span>
                                                    {item.description && <span className='text-body leading-relaxed text-muted-foreground'>{item.description}</span>}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </article>
                    </FadeIn>
                ))}
            </div>

            <ScrollToTop />
        </main>
    );
}
