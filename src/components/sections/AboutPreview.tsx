'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { FadeIn } from '@/components/motion';
import { SITE_CONFIG } from '@/constants';

/**
 * About Preview Section for homepage
 */
export const AboutPreview = () => {
  return (
    <section className="py-24 relative">
      <div className="container-wide">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Image */}
          <FadeIn direction="left" className="relative">
            <div className="relative aspect-square max-w-md mx-auto lg:mx-0">
              {/* Decorative Elements */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] opacity-20 blur-2xl" />
              <div className="absolute inset-0 rounded-3xl gradient-border" />
              
              {/* Placeholder for profile image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--surface)] flex items-center justify-center">
                <span className="heading-display gradient-text">
                  {SITE_CONFIG.shortName || 'AH'}
                </span>
              </div>
            </div>
          </FadeIn>

          {/* Content */}
          <FadeIn direction="right" delay={0.1}>
            <span className="label text-[var(--accent)] mb-4 block">About Me</span>
            <h2 className="heading-2 text-[var(--fg)] mb-6">
              Crafting Digital Experiences with Passion
            </h2>
            <div className="space-y-4 text-[var(--fg-muted)] body-base mb-8">
              <p>
                I&apos;m a full-stack developer with a passion for creating beautiful, 
                functional, and user-centric digital experiences. With over 5 years of 
                experience in the industry, I&apos;ve had the privilege of working on 
                diverse projects ranging from startups to enterprise applications.
              </p>
              <p>
                Beyond coding, I enjoy writing about technology, sharing knowledge 
                through articles, and contributing to open-source projects. I believe 
                in continuous learning and staying updated with the latest trends in 
                web development.
              </p>
            </div>

            {/* Skills Preview */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind'].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--surface)] text-[var(--fg-muted)] border border-[var(--border-color)]"
                >
                  {skill}
                </span>
              ))}
            </div>

            <Link
              href="/about"
              className="group inline-flex items-center gap-2 btn-primary"
            >
              More About Me
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
