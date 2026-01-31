import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/constants';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = {
  title: 'About',
  description: `Learn more about ${SITE_CONFIG.author.name} - software engineer, writer, and creator. Discover my experience, skills, and what I believe in.`,
  openGraph: {
    title: `About | ${SITE_CONFIG.name}`,
    description: `Learn more about ${SITE_CONFIG.author.name} - software engineer, writer, and creator.`,
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: `About | ${SITE_CONFIG.name}`,
    description: `Learn more about ${SITE_CONFIG.author.name} - software engineer, writer, and creator.`,
  },
};

/**
 * About Page - Server Component wrapper
 * 
 * This page exports metadata for SEO while delegating
 * the actual content to a client component for animations.
 */
export default function AboutPage() {
  return <AboutPageClient />;
}
