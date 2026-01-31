'use client';

import { useRef, Suspense } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SITE_CONFIG } from '@/constants';

// Lazy load Three.js components
import dynamic from 'next/dynamic';
const ParticleField = dynamic(
  () => import('@/components/three/ParticleField').then((mod) => mod.ParticleField),
  { ssr: false }
);

/**
 * Premium Hero Section with Three.js particles and animated text
 * Minimal, abstract design with focus on typography
 */
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
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Three.js Particle Background */}
      <Suspense fallback={null}>
        <ParticleField count={1500} className="opacity-60" />
      </Suspense>

      {/* Content */}
      <motion.div
        style={{ opacity, y, scale }}
        className="relative z-10 container-wide text-center px-6"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-color)] bg-[var(--bg)]/30 backdrop-blur-sm mb-8"
        >
          <Sparkles className="size-4 text-[var(--accent)]" />
          <span className="text-sm font-medium text-[var(--fg-muted)]">
            Developer & Writer
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="heading-display mb-6"
        >
          <span className="block text-[var(--fg)] font-light">Hi, I&apos;m</span>
          <span className="block gradient-text mt-2 font-semibold">
            {SITE_CONFIG.author.name.split(' ')[0]}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-lg md:text-xl text-[var(--fg-muted)] max-w-2xl mx-auto mb-12 font-light leading-relaxed"
        >
          I build exceptional digital experiences and write about software development,
          technology, and everything in between.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/articles"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--fg)] text-[var(--bg)] font-medium transition-transform hover:scale-105"
          >
            Read Articles
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/about"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--fg)]/20 text-[var(--fg)] font-medium hover:border-[var(--fg)]/40 transition-all"
          >
            About Me
          </Link>
        </motion.div>

        {/* Minimal Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="flex items-center justify-center gap-12 mt-20"
        >
          {[
            { value: '5+', label: 'Years' },
            { value: '20+', label: 'Projects' },
            { value: '10k+', label: 'Lines' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-light text-[var(--fg)]">{stat.value}</div>
              <div className="text-xs uppercase tracking-widest text-[var(--fg-muted)] mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Gradient Overlay at Bottom - smoother transition */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)',
        }}
      />
    </section>
  );
};

export default HeroSection;
