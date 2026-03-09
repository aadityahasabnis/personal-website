import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/constants/siteConstants';
import AboutPageClient from './AboutPageClient';

const description = `Learn more about ${SITE_CONFIG.author.name} - software engineer, writer, and creator. Discover my experience, skills, and what I believe in.`;

export const metadata: Metadata = {
  title: 'About',
  description,
  keywords: ['about', SITE_CONFIG.author.name, 'software engineer', 'developer', 'writer'].join(', '),
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
  openGraph: {
    title: `About | ${SITE_CONFIG.name}`,
    description,
    url: `${SITE_CONFIG.url}/about`,
    siteName: SITE_CONFIG.name,
    locale: 'en_US',
    type: 'profile',
    images: [{ url: `${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}`, width: 1200, height: 630, alt: `About ${SITE_CONFIG.author.name}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `About | ${SITE_CONFIG.name}`,
    description,
    creator: SITE_CONFIG.seo.twitterHandle,
    site: SITE_CONFIG.seo.twitterHandle,
    images: [`${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}`],
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
