'use client';

import { HoverTextSwap } from '@/components/interactive/HoverTextSwap';
import { FadeIn } from '@/components/motion/FadeIn';
import { HERO_SECTION } from '@/constants/homeConstants';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useRef } from 'react';

import dynamic from 'next/dynamic';

const ParticleField = dynamic(() => import('@/components/three/ParticleField').then((mod) => mod.ParticleField), { ssr: false });

export const HeroSection = () => {
    const containerRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start'],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

    return (
        <section ref={containerRef} className='relative flex items-center justify-center min-h-screen overflow-hidden bg-background'>
            <div className='absolute inset-0 hidden bg-linear-to-b from-background via-background/95 to-background/90 dark:block' />
            <div className='absolute top-0 right-0 hidden h-136 w-136 translate-x-1/3 -translate-y-1/3 rounded-full bg-(--sphere-1) blur-3xl dark:block' />
            <div className='absolute bottom-0 left-0 hidden h-md w-md -translate-x-1/3 translate-y-1/3 rounded-full bg-(--sphere-2) blur-3xl dark:block' />

            <Suspense fallback={null}>
                <ParticleField count={HERO_SECTION.particleCount} className='hidden dark:block dark:opacity-60' />
            </Suspense>

            <motion.div style={{ opacity, y, scale }} className='relative z-10 container-wide text-center'>
                <FadeIn trigger='always' direction='down' distance={18} delay={0.2} duration={0.6}>
                    <div className='inline-flex items-center gap-2 mb-8 px-4 py-2 text-label font-medium text-muted-foreground bg-background/30 border border-border rounded-full backdrop-blur-sm'>
                        <Sparkles className='size-4 text-primary' />
                        <span>{HERO_SECTION.badge}</span>
                    </div>
                </FadeIn>

                <FadeIn trigger='always' direction='up' distance={24} delay={0.3} duration={0.7}>
                    <h1 className='mb-6 text-display font-light leading-tight text-foreground'>
                        <span className='block'>{HERO_SECTION.greeting}</span>
                        <HoverTextSwap
                            primaryText={SITE_CONFIG.author.givenName}
                            secondaryText={SITE_CONFIG.author.marathiGivenName}
                            className='block mt-2 font-semibold gradient-text cursor-pointer'
                        />
                    </h1>
                </FadeIn>

                <FadeIn trigger='always' direction='up' distance={20} delay={0.4} duration={0.7}>
                    <p className='mx-auto mb-12 max-w-2xl text-body font-light leading-relaxed text-muted-foreground md:text-h4'>{HERO_SECTION.subtitle}</p>
                </FadeIn>

                <FadeIn trigger='always' direction='up' distance={16} delay={0.5} duration={0.7}>
                    <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
                        <Link href={HERO_SECTION.primaryCta.href} className='group inline-flex items-center gap-2 btn-primary'>
                            {HERO_SECTION.primaryCta.label}
                            <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
                        </Link>
                        <div className='flex items-center gap-4'>
                            <Link
                                href={HERO_SECTION.secondaryCta.href}
                                className='group inline-flex items-center gap-2 px-6 py-3 text-label font-medium text-foreground bg-card border border-border rounded-full transition-base hover:border-primary/40 hover:text-primary'
                            >
                                {HERO_SECTION.secondaryCta.label}
                            </Link>
                            <Link
                                href='/resume'
                                className='group inline-flex items-center gap-2 px-6 py-3 text-label font-medium text-foreground bg-card border border-border rounded-full transition-base hover:border-primary/40 hover:text-primary'
                            >
                                Resume
                                <FileText className='size-4' />
                            </Link>
                        </div>
                    </div>
                </FadeIn>

                <FadeIn trigger='always' direction='up' distance={16} delay={0.8} duration={0.7}>
                    <div className='flex items-center justify-center gap-8 mt-20 md:gap-12'>
                        {HERO_SECTION.stats.map((stat) => (
                            <div key={stat.label} className='text-center'>
                                <div className='text-h2 font-light text-foreground'>{stat.value}</div>
                                <div className='mt-1 text-label uppercase tracking-widest text-muted-foreground'>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </FadeIn>
            </motion.div>

            <div className='absolute inset-x-0 bottom-0 hidden h-40 pointer-events-none bg-linear-to-t from-background to-transparent dark:block' />
        </section>
    );
};

export default HeroSection;
