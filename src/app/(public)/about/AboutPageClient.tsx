'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Mail, Briefcase } from 'lucide-react';
import { SITE_CONFIG, SOCIAL_LINKS } from '@/constants';

// ===== DATA =====

const SKILLS = {
  'Languages & Frameworks': ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'Python'],
  'Databases & Tools': ['MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'Git'],
  'Design & UI': ['Tailwind CSS', 'Framer Motion', 'Figma', 'CSS-in-JS'],
};

interface IExperience {
  title: string;
  company: string;
  period: string;
  description: string;
  current?: boolean;
}

const EXPERIENCE: IExperience[] = [
  {
    title: 'Senior Software Engineer',
    company: 'Tech Company',
    period: '2022 - Present',
    description: 'Leading frontend architecture and development for high-traffic web applications.',
    current: true,
  },
  {
    title: 'Full Stack Developer',
    company: 'Startup Inc',
    period: '2020 - 2022',
    description: 'Built full-stack features for a B2B SaaS platform serving 10,000+ users.',
  },
  {
    title: 'Frontend Developer',
    company: 'Agency Co',
    period: '2018 - 2020',
    description: 'Created responsive, accessible websites for diverse clients.',
  },
];

const VALUES = [
  {
    title: 'Clarity Over Cleverness',
    description: 'I write code that humans can read. The best code is not the cleverest, but the clearest.',
  },
  {
    title: 'Learn in Public',
    description: 'I share what I learn through writing. Teaching is the best way to solidify understanding.',
  },
  {
    title: 'Ship Early, Iterate Often',
    description: 'Perfect is the enemy of good. I believe in getting feedback early and improving continuously.',
  },
];

// ===== ANIMATION VARIANTS =====

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * About Page Client Component
 * Contains all client-side animations and interactivity
 */
export default function AboutPageClient() {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24 md:py-32">
      {/* Hero Section */}
      <section className="mb-20">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="shrink-0"
          >
            <div className="relative size-40 md:size-48 rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--border-color)]">
              <Image
                src="/avatar.jpg"
                alt={SITE_CONFIG.author.name}
                fill
                className="object-cover"
                priority
                sizes="192px"
              />
              {/* Fallback initial */}
              <div className="absolute inset-0 flex items-center justify-center text-5xl font-light text-[var(--fg-subtle)] -z-10">
                {SITE_CONFIG.author.name.charAt(0)}
              </div>
            </div>
          </motion.div>

          {/* Bio */}
          <div className="flex-1">
            <motion.p
              {...fadeIn}
              transition={{ delay: 0.1 }}
              className="text-sm font-medium uppercase tracking-widest text-[var(--accent)] mb-4"
            >
              About
            </motion.p>
            
            <motion.h1
              {...fadeIn}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-light tracking-tight mb-6"
            >
              {SITE_CONFIG.author.name}
            </motion.h1>
            
            <motion.p
              {...fadeIn}
              transition={{ delay: 0.3 }}
              className="text-lg text-[var(--fg-muted)] leading-relaxed mb-6"
            >
              I&apos;m a software engineer passionate about building products that make a difference. 
              I write about web development, software architecture, and the craft of programming.
            </motion.p>

            {/* Quick info */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-6 text-sm text-[var(--fg-muted)]"
            >
              <span className="flex items-center gap-2">
                <MapPin className="size-4" />
                San Francisco, CA
              </span>
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 hover:text-[var(--fg)] transition-colors"
              >
                <Mail className="size-4" />
                {SITE_CONFIG.email}
              </a>
            </motion.div>

            {/* CTAs */}
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4 mt-8"
            >
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--fg)] text-[var(--bg)] font-medium hover:opacity-90 transition-opacity"
              >
                Get in Touch
              </Link>
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border-color)] text-[var(--fg)] font-medium hover:border-[var(--border-hover)] transition-colors"
              >
                Read Articles
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-20"
      >
        <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--fg-muted)] mb-8">
          Skills & Technologies
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {Object.entries(SKILLS).map(([category, skills]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-[var(--fg)] mb-4">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 text-sm rounded-full bg-[var(--surface)] text-[var(--fg-muted)] border border-[var(--border-color)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Experience Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mb-20"
      >
        <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--fg-muted)] mb-8 flex items-center gap-2">
          <Briefcase className="size-4" />
          Experience
        </h2>
        <motion.div 
          className="space-y-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {EXPERIENCE.map((exp, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="relative pl-6 border-l-2 border-[var(--border-color)]"
            >
              {/* Timeline dot */}
              <div className={`absolute -left-[5px] top-1.5 size-2 rounded-full ${exp.current ? 'bg-[var(--accent)]' : 'bg-[var(--fg-subtle)]'}`} />
              
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                <h3 className="font-medium text-[var(--fg)]">{exp.title}</h3>
                <span className="text-sm text-[var(--fg-subtle)]">{exp.period}</span>
              </div>
              <p className="text-sm text-[var(--accent)] mb-2">{exp.company}</p>
              <p className="text-[var(--fg-muted)]">{exp.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Values Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mb-20"
      >
        <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--fg-muted)] mb-8">
          What I Believe
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {VALUES.map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 + i * 0.1 }}
              className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)]"
            >
              <h3 className="font-medium text-[var(--fg)] mb-2">{value.title}</h3>
              <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Connect Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="pt-12 border-t border-[var(--border-color)]"
      >
        <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--fg-muted)] mb-8">
          Connect
        </h2>
        <div className="flex flex-wrap gap-6">
          {SOCIAL_LINKS.map((link) => (
            <Link
              key={link.platform}
              href={link.url}
              target={link.platform !== 'email' ? '_blank' : undefined}
              rel={link.platform !== 'email' ? 'noopener noreferrer' : undefined}
              className="group inline-flex items-center gap-2 text-[var(--fg)] hover:text-[var(--accent)] transition-colors"
            >
              <span className="capitalize">{link.platform}</span>
              <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
