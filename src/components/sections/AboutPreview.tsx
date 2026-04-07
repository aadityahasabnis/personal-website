import { PreviewCard, PreviewCardPanel, PreviewCardTrigger } from '@/components/animate-ui/components/base/preview-card';
import { ABOUT_PREVIEW_SECTION } from '@/constants/homeConstants';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const AboutPreview = () => {
    const authorMonogram = SITE_CONFIG.shortName || 'AH';
    const topSkills = ABOUT_PREVIEW_SECTION.skills.slice(0, 3);

    return (
        <section className='relative py-24'>
            <div className='container-wide'>
                <div className='grid items-center gap-12 lg:grid-cols-2'>
                    <div className='relative'>
                        <div className='relative mx-auto aspect-square max-w-md lg:mx-0'>
                            <div className='absolute -inset-4 rounded-3xl bg-linear-to-br from-violet-400/20 via-violet-500/15 to-violet-600/20 blur-2xl' />
                            <div className='absolute inset-0 rounded-3xl gradient-border' />

                            <PreviewCard followCursor='x'>
                                <PreviewCardTrigger
                                    href={ABOUT_PREVIEW_SECTION.cta.href}
                                    aria-label='Open full about page'
                                    className='relative flex items-center justify-center overflow-hidden aspect-square rounded-2xl bg-muted transition-base hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                >
                                    <span className='text-display font-semibold gradient-text'>{authorMonogram}</span>

                                    <span className='absolute right-4 bottom-4 inline-flex items-center gap-1 px-2.5 py-1 text-label font-medium text-violet-700 bg-violet-100/90 rounded-full dark:text-violet-200 dark:bg-violet-900/50'>
                                        Profile
                                        <ArrowUpRight className='size-3.5' aria-hidden='true' />
                                    </span>
                                </PreviewCardTrigger>

                                <PreviewCardPanel side='right' sideOffset={14} align='center' className='p-0 w-80 text-foreground bg-card border-border shadow-glow-sm'>
                                    <div className='flex flex-col gap-4 p-5'>
                                        <div className='flex items-start justify-between gap-4'>
                                            <div className='flex items-center gap-3'>
                                                <div className='flex size-12 items-center justify-center rounded-full text-h4 font-semibold text-violet-700 bg-violet-100 dark:text-violet-200 dark:bg-violet-900/40'>
                                                    {authorMonogram}
                                                </div>

                                                <div>
                                                    <p className='text-body font-semibold text-foreground'>{SITE_CONFIG.author.name}</p>
                                                    <p className='text-small text-muted-foreground'>{SITE_CONFIG.author.jobTitle}</p>
                                                </div>
                                            </div>

                                            <span className='px-2 py-1 text-label font-medium text-violet-700 bg-violet-100 rounded-md dark:text-violet-200 dark:bg-violet-900/40'>Open to work</span>
                                        </div>

                                        <p className='text-small leading-relaxed text-muted-foreground'>{SITE_CONFIG.author.bio}</p>

                                        <div className='flex flex-wrap gap-2'>
                                            {topSkills.map((skill) => (
                                                <span key={skill} className='px-2.5 py-1 text-label font-medium text-muted-foreground bg-muted rounded-md'>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        <Link
                                            href={ABOUT_PREVIEW_SECTION.cta.href}
                                            className='inline-flex items-center justify-between gap-2 text-small font-medium text-foreground rounded-sm transition-base hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                        >
                                            View full profile
                                            <ArrowRight className='size-4' aria-hidden='true' />
                                        </Link>
                                    </div>
                                </PreviewCardPanel>
                            </PreviewCard>
                        </div>
                    </div>

                    <div>
                        <span className='mb-4 block text-label font-medium uppercase tracking-widest text-primary'>{ABOUT_PREVIEW_SECTION.label}</span>
                        <h2 className='mb-6 text-h1 font-semibold text-foreground'>{ABOUT_PREVIEW_SECTION.title}</h2>

                        <div className='mb-8 space-y-4 text-body leading-relaxed text-muted-foreground'>
                            {ABOUT_PREVIEW_SECTION.paragraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>

                        <div className='mb-8 flex flex-wrap gap-2'>
                            {ABOUT_PREVIEW_SECTION.skills.map((skill) => (
                                <span key={skill} className='inline-flex px-3 py-1.5 text-small font-medium text-muted-foreground bg-muted border border-border rounded-lg'>
                                    {skill}
                                </span>
                            ))}
                        </div>

                        <Link href={ABOUT_PREVIEW_SECTION.cta.href} className='group inline-flex items-center gap-2 btn-primary'>
                            {ABOUT_PREVIEW_SECTION.cta.label}
                            <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutPreview;
