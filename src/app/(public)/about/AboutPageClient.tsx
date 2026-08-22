import { FlipCard } from '@/components/animate-ui/components/community/flip-card';
import FadeIn from '@/components/motion/FadeIn';
import { ScrollVelocityContainer, ScrollVelocityRow } from '@/components/ui/scroll-based-velocity';
import { ABOUT_PAGE_CONTENT } from '@/constants/aboutConstants';
import { SITE_CONFIG, SOCIAL_LINKS } from '@/constants/siteConstants';
import { ArrowUpRight, Briefcase, FileText, Lightbulb, Mail, MapPin, PencilIcon, UsersRound } from 'lucide-react';
import Link from 'next/link';

/**
 * About Page Client Component
 * Contains all client-side animations and interactivity
 */
export default function AboutPageClient() {
    const { collaboration, experience, identity, principles, skills } = ABOUT_PAGE_CONTENT;
    const sectionHeadingClass = 'mb-6 flex items-center gap-2 text-h2 font-semibold text-foreground';
    const flipCardLinks = SOCIAL_LINKS.map(({ ariaLabel, id, url }) => ({ ariaLabel, id, url }));

    return (
        <div className='relative mx-auto flex flex-col gap-16 px-6 py-20 md:py-24 lg:px-8 max-w-5xl'>
            <section aria-labelledby='about-identity' className='relative'>
                <div className='flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-16'>
                    <FadeIn direction='up' duration={0.55} distance={22} className='w-full md:w-auto'>
                        <div className='flex w-full justify-center md:block'>
                            <FlipCard
                                name={SITE_CONFIG.author.name}
                                role={identity.cardRole}
                                username={identity.cardUsername}
                                image={identity.cardImage}
                                tagline={identity.cardTagline}
                                links={flipCardLinks}
                                centerContent={
                                    <div key='center-wrap' className='relative flex items-center justify-center px-3'>
                                        <div key='center-inner' className='relative flex items-center justify-center gap-2 px-4 py-2 text-7xl'>
                                            <span key='center-label' className='inline-flex items-center gap-1 whitespace-nowrap font-semibold leading-none tracking-[0.14em] text-violet-200'>
                                                <span key='center-open' aria-hidden='true'>
                                                    &lt;
                                                </span>
                                                <PencilIcon key='center-icon' className='size-14 text-violet-300' aria-hidden='true' />
                                                <span key='center-close' aria-hidden='true'>
                                                    &gt;
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                    </FadeIn>

                    <article className='flex w-full flex-1 flex-col gap-6'>
                        <FadeIn direction='up' delay={0.05} duration={0.55} distance={18}>
                            <p className='text-label font-medium uppercase tracking-widest text-primary'>{identity.label}</p>
                        </FadeIn>

                        <FadeIn direction='up' delay={0.1} duration={0.55} distance={20}>
                            <h1 id='about-identity' className='text-title font-semibold tracking-tight text-foreground'>
                                {identity.title}
                            </h1>
                        </FadeIn>

                        <FadeIn direction='up' delay={0.15} duration={0.55} distance={20}>
                            <p className='text-body font-medium text-primary'>{identity.tagline}</p>
                        </FadeIn>

                        <FadeIn direction='up' delay={0.2} duration={0.55} distance={22}>
                            <p className='text-body leading-relaxed text-muted-foreground'>{identity.summary}</p>
                        </FadeIn>

                        <FadeIn direction='up' delay={0.25} duration={0.55} distance={16}>
                            <div className='flex flex-wrap items-center gap-6 text-small text-muted-foreground'>
                                <span className='flex items-center gap-2'>
                                    <MapPin className='size-4' />
                                    {identity.location}
                                </span>
                                <a href={`mailto:${SITE_CONFIG.email}`} className='flex items-center gap-2 transition-fast hover:text-foreground'>
                                    <Mail className='size-4' />
                                    {SITE_CONFIG.email}
                                </a>
                            </div>
                        </FadeIn>

                        <FadeIn direction='up' delay={0.3} duration={0.55} distance={16}>
                            <div className='flex flex-wrap items-center gap-4'>
                                <Link
                                    href={identity.ctas.primary.href}
                                    className='inline-flex items-center gap-2 px-6 py-3 text-label font-semibold rounded-full bg-primary text-primary-foreground transition-fast hover:opacity-90'
                                >
                                    {identity.ctas.primary.label}
                                </Link>
                                <Link
                                    href={identity.ctas.secondary.href}
                                    className='inline-flex items-center gap-2 px-6 py-3 text-label font-semibold rounded-full border border-border bg-background text-foreground transition-fast hover:border-primary/50 hover:text-primary'
                                >
                                    {identity.ctas.secondary.label}
                                </Link>
                                <Link
                                    href='/resume'
                                    className='inline-flex items-center gap-2 px-6 py-3 text-label font-semibold rounded-full border border-border bg-background text-foreground transition-fast hover:border-primary/50 hover:text-primary'
                                >
                                    Resume / CV
                                    <FileText className='size-4' />
                                </Link>
                                <Link href={identity.ctas.tertiary.href} className='inline-flex items-center gap-2 text-small font-semibold text-primary transition-fast hover:text-violet-500'>
                                    {identity.ctas.tertiary.label}
                                    <ArrowUpRight className='size-4' />
                                </Link>
                            </div>
                        </FadeIn>
                    </article>
                </div>
            </section>

            <section aria-labelledby='about-skills' className='relative'>
                <h2 id='about-skills' className='sr-only'>
                    {skills.title}
                </h2>
                <FadeIn direction='up' duration={0.55} distance={18}>
                    <div className='relative overflow-hidden mask-[linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] mask-no-repeat mask-size-[100%_100%] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]'>
                        <ScrollVelocityContainer className='space-y-4 py-1'>
                            {skills.rows.map((row, index) => (
                                <div key={row.title} className='space-y-1'>
                                    <ScrollVelocityRow
                                        direction={row.direction ?? 1}
                                        baseVelocity={row.baseVelocity}
                                        className={index === 0 ? 'py-1 text-h5 font-semibold text-foreground' : 'py-1 text-small text-muted-foreground'}
                                    >
                                        {row.items.map((item) => (
                                            <span key={item} className='mx-3 inline-flex items-center'>
                                                {item}
                                            </span>
                                        ))}
                                    </ScrollVelocityRow>
                                </div>
                            ))}
                        </ScrollVelocityContainer>
                    </div>
                </FadeIn>
            </section>

            <section aria-labelledby='about-experience' className='relative'>
                <FadeIn direction='up' duration={0.55} distance={18}>
                    <h2 id='about-experience' className={sectionHeadingClass}>
                        <Briefcase className='size-5 text-primary' />
                        {experience.title}
                    </h2>
                </FadeIn>
                <div className='flex flex-col gap-6'>
                    {experience.items.map((item, index) => (
                        <FadeIn key={item.title} direction='up' delay={0.05 * index} duration={0.5} distance={14}>
                            <article className='relative flex flex-col gap-2.5 pl-8'>
                                <div className='absolute left-0 top-0 flex h-full w-4 flex-col items-center'>
                                    <div className={`mt-1 block size-2.5 shrink-0 rounded-full border border-primary/50 ${item.current ? 'bg-primary' : 'bg-background'}`} />
                                    <div className='mt-2 h-full w-px shrink-0 bg-linear-to-b from-primary/50 via-border to-transparent' />
                                </div>

                                <div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3'>
                                    <h3 className='text-h5 font-semibold text-foreground'>{item.title}</h3>
                                    <p className='text-small text-muted-foreground sm:text-right'>{item.period}</p>
                                </div>

                                {item.companyUrl ? (
                                    <a
                                        href={item.companyUrl}
                                        target='_blank'
                                        rel='noreferrer'
                                        className='inline-flex items-center gap-1 text-small font-medium text-primary transition-fast hover:text-violet-500'
                                    >
                                        {item.company}
                                        <ArrowUpRight className='size-3.5' aria-hidden='true' />
                                    </a>
                                ) : (
                                    <p className='text-small font-medium text-primary'>{item.company}</p>
                                )}
                                <div className='flex flex-col gap-2'>
                                    {item.description.map((paragraph) => (
                                        <p key={paragraph} className='text-body leading-relaxed text-muted-foreground'>
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                                {item.current ? <span className='text-label font-semibold text-primary'>Current</span> : null}
                            </article>
                        </FadeIn>
                    ))}
                </div>
            </section>

            <section aria-labelledby='about-principles' className='relative'>
                <FadeIn direction='up' duration={0.55} distance={18}>
                    <h2 id='about-principles' className={sectionHeadingClass}>
                        <Lightbulb className='size-5 text-primary' />
                        {principles.title}
                    </h2>
                </FadeIn>
                <div className='grid gap-5 md:grid-cols-3'>
                    {principles.items.map((principle, index) => (
                        <FadeIn key={principle.title} direction='up' delay={0.05 * index} duration={0.5} distance={16}>
                            <article className='relative flex h-full flex-col gap-3 p-6 rounded-xl border border-border bg-card shadow-none transition-slow hover:border-primary/25 hover:shadow-md'>
                                <h3 className='text-h5 font-semibold leading-snug text-foreground'>{principle.title}</h3>
                                <p className='text-body leading-relaxed text-muted-foreground'>{principle.description}</p>
                            </article>
                        </FadeIn>
                    ))}
                </div>
            </section>

            <section aria-labelledby='about-collaboration' className='relative'>
                <FadeIn direction='up' duration={0.55} distance={18}>
                    <div className='relative flex flex-col gap-6'>
                        <h2 id='about-collaboration' className={sectionHeadingClass}>
                            <UsersRound className='size-5 text-primary' />
                            {collaboration.title}
                        </h2>
                        <p className='sr-only'>{collaboration.subtitle}</p>
                        <div className='grid gap-5 md:grid-cols-2'>
                            {collaboration.available.map((item) => (
                                <article
                                    key={item.title}
                                    className='relative flex h-full flex-col gap-3 p-6 rounded-xl border border-border bg-card shadow-none transition-slow hover:border-primary/25 hover:shadow-md'
                                >
                                    <h3 className='text-h5 font-semibold leading-snug text-foreground'>{item.title}</h3>
                                    <p className='text-body leading-relaxed text-muted-foreground'>{item.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </FadeIn>
            </section>
        </div>
    );
}
