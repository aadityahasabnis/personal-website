import { ABOUT_PAGE_CONTENT } from '@/constants/aboutConstants';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { JsonLd, combineSchemas, generateBreadcrumbSchema, generatePersonSchema, generateWebPageSchema, generateWebSiteSchema } from '@/lib/seo';
import type { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

const { collaboration, identity, skills } = ABOUT_PAGE_CONTENT;

const description = `${SITE_CONFIG.author.name} is a web developer and writer focused on reliable systems, practical problem solving, and clear communication based in ${identity.location}. ${identity.tagline}.`;

const keywordSet = new Set<string>([
    'about',
    SITE_CONFIG.author.name,
    'web development',
    'software engineering',
    'problem solving',
    'system thinking',
    'technical writing',
    'community building',
    'frontend architecture',
    'backend engineering',
    'cloud infrastructure',
    collaboration.title.toLowerCase(),
    ...skills.rows.flatMap((row) => row.items.map((item) => item.toLowerCase())),
]);

const aboutOgImage = buildDynamicOgImageUrl({
    title: 'Building Software with Clear, Practical Thinking',
    eyebrow: 'Engineering',
    subtitle: 'A closer look at work, decisions, and principles behind reliable web systems.',
    tags: ['engineering', 'thinking', 'writing', 'systems'],
});

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = createPageMetadata({
    title: 'About',
    description,
    canonicalPath: '/about',
    keywords: Array.from(keywordSet),
    includeAuthor: true,
    includeSocial: true,
    socialType: 'website',
    imageUrl: aboutOgImage,
    robots: {
        index: true,
        follow: true,
    },
});

const aboutSchema = combineSchemas(
    generatePersonSchema(),
    generateWebSiteSchema(),
    generateWebPageSchema({
        title: 'About',
        description,
        path: '/about',
    }),
    generateBreadcrumbSchema([
        { name: 'Home', url: SITE_CONFIG.url },
        { name: 'About', url: `${SITE_CONFIG.url}/about` },
    ]),
);

/**
 * About Page - Server Component wrapper
 *
 * This page exports metadata for SEO while delegating
 * the actual content to a client component for animations.
 */
export default function AboutPage() {
    return (
        <>
            <JsonLd data={aboutSchema} />
            <AboutPageClient />
        </>
    );
}
