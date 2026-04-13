import { Scales } from '@/components/ui/scales';
import { ABOUT_PREVIEW_SECTION } from '@/constants/homeConstants';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const AboutPreview = () => {
    const profileImageSrc = '/avatars/avatar-1.png';

    return (
        <section className='mx-auto px-6 lg:px-8 py-20 md:py-24 max-w-5xl'>
            <div className='container-wide'>
                <div className='grid items-center gap-12 lg:grid-cols-2'>
                    <div className='relative'>
                        <div className='relative mx-auto max-w-5xl'>
                            <div className='absolute -inset-3 rounded-3xl bg-linear-to-br from-violet-400/15 via-violet-500/10 to-violet-600/15 blur-xl' />

                            <Link
                                href={ABOUT_PREVIEW_SECTION.cta.href}
                                aria-label='Open full about page'
                                className='relative block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                            >
                                <div className='relative aspect-4/5 w-full rounded-2xl bg-muted'>
                                    <div className='absolute -inset-y-[20%] -left-5 h-[140%] w-5 sm:-left-6 sm:w-6'>
                                        <Scales size={8} className='rounded-2xl mask-t-from-90% mask-b-from-90%' />
                                    </div>
                                    <div className='absolute -inset-y-[20%] -right-5 h-[140%] w-5 sm:-right-6 sm:w-6'>
                                        <Scales size={8} className='rounded-2xl mask-t-from-90% mask-b-from-90%' />
                                    </div>
                                    <div className='absolute -inset-x-[20%] -top-5 h-5 w-[140%] sm:-top-6 sm:h-6'>
                                        <Scales size={8} className='rounded-2xl mask-r-from-90% mask-l-from-90%' />
                                    </div>
                                    <div className='absolute -inset-x-[20%] -bottom-5 h-5 w-[140%] sm:-bottom-6 sm:h-6'>
                                        <Scales size={8} className='rounded-2xl mask-r-from-90% mask-l-from-90%' />
                                    </div>

                                    <div className='relative z-10 h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-glow-sm'>
                                        <Image src={profileImageSrc} alt={`${SITE_CONFIG.author.name} profile portrait`} fill className='object-cover' sizes='(min-width: 1024px) 32rem, 100vw' />
                                    </div>

                                    <div className='absolute inset-x-3 bottom-3 z-20 flex items-center justify-between gap-3 rounded-xl border border-border bg-card/95 p-3 backdrop-blur-xs sm:inset-x-4 sm:bottom-4'>
                                        <div>
                                            <p className='text-body font-semibold text-foreground'>{SITE_CONFIG.author.name}</p>
                                            <p className='text-small text-muted-foreground'>{SITE_CONFIG.author.jobTitle}</p>
                                        </div>
                                        <ArrowRight className='size-4 text-primary' aria-hidden='true' />
                                    </div>
                                </div>
                            </Link>
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
