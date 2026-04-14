import { ABOUT_PREVIEW_SECTION } from '@/constants/homeConstants';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const AboutPreview = () => {
    const profileImageSrc = 'https://cdn.aadityahasabnis.workers.dev/cdn/images/gallery/aaditya-hasabnis-about-img.jpg-Km';

    return (
        <section aria-labelledby='about-heading' className='mx-auto max-w-5xl min-h-screen px-6 lg:px-8 flex items-center'>
            <div className='flex flex-col lg:flex-row items-start gap-12'>
                {/* Image Column */}
                <div className='relative w-full lg:w-[42%]'>
                    <Link href={ABOUT_PREVIEW_SECTION.cta.href} aria-label='Open full about page' className='group relative block w-full max-w-sm'>
                        {/* Glow (controlled, not leaking) */}
                        <div className='absolute inset-0 rounded-full blur-2xl opacity-60 transition group-hover:opacity-80 bg-[radial-gradient(circle,var(--glow-accent),transparent_70%)]' />

                        {/* Image */}
                        <div className='relative aspect-3/4 w-full overflow-hidden rounded-full border border-border bg-muted shadow-lg'>
                            <Image
                                src={profileImageSrc}
                                alt={`${SITE_CONFIG.author.name} portrait`}
                                fill
                                priority
                                sizes='(min-width: 1024px) 400px, 100vw'
                                className='object-cover transition duration-500 group-hover:scale-105'
                            />

                            {/* Subtle overlay (fixed for both modes) */}
                            <div className='pointer-events-none absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-30 transition duration-550' />

                            {/* Ring */}
                            <div className='pointer-events-none absolute inset-0 rounded-full ring-1 ring-border' />
                        </div>

                        {/* Info Card */}
                        <div className='absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 rounded-xl border border-border bg-card/80 p-4 backdrop-blur-md transition-colors duration-300 group-hover:border-primary/40'>
                            <div>
                                <p className='text-body font-semibold text-foreground'>{SITE_CONFIG.author.name}</p>
                                <p className='sr-only'>Full stack developer specializing in backend systems, APIs, and scalable infrastructure.</p>
                                <p className='text-small text-muted-foreground'>{SITE_CONFIG.author.jobTitle}</p>
                            </div>

                            <ArrowRight className='size-4 text-primary' />
                        </div>
                    </Link>
                </div>

                {/* Text Column */}
                <article className='flex-1 font-nunito'>
                    <span className='mb-4 block text-label font-medium uppercase tracking-widest text-primary'>{ABOUT_PREVIEW_SECTION.label}</span>

                    <h2 id='about-heading' className='mb-6 text-h1 font-semibold text-foreground'>
                        {ABOUT_PREVIEW_SECTION.title}
                    </h2>

                    <div className='mb-8 space-y-4 text-body leading-relaxed text-muted-foreground'>
                        {ABOUT_PREVIEW_SECTION.paragraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                    </div>

                    <div className='mb-8 flex flex-wrap gap-2'>
                        {ABOUT_PREVIEW_SECTION.skills.map((skill) => (
                            <span
                                key={skill}
                                className='inline-flex rounded-lg border border-border bg-muted px-3 py-1.5 text-small font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary'
                            >
                                {skill}
                            </span>
                        ))}
                    </div>

                    <Link href={ABOUT_PREVIEW_SECTION.cta.href} className='group inline-flex items-center gap-2 btn-primary'>
                        {ABOUT_PREVIEW_SECTION.cta.label}
                        <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
                    </Link>
                </article>
            </div>
        </section>
    );
};

export default AboutPreview;
