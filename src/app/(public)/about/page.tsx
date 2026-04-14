import { ABOUT_PAGE_CONTENT } from '@/constants/aboutConstants';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { JsonLd, combineSchemas, generatePersonSchema, generateWebSiteSchema } from '@/lib/seo';
import type { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

const { collaboration, identity, skills } = ABOUT_PAGE_CONTENT;

const description = `${SITE_CONFIG.author.name} is a ${identity.title} based in ${identity.location}. ${identity.tagline}. Explore engineering experience, principles, and collaboration focus across frontend, backend, and cloud systems.`;

const keywordSet = new Set<string>([
    'about',
    SITE_CONFIG.author.name,
    identity.title.toLowerCase(),
    'software engineer',
    'product systems builder',
    'frontend architecture',
    'backend engineering',
    'cloud infrastructure',
    collaboration.title.toLowerCase(),
    ...skills.rows.flatMap((row) => row.items.map((item) => item.toLowerCase())),
]);

const aboutOgImage = buildDynamicOgImageUrl({
    title: 'About',
    eyebrow: identity.title,
    subtitle: identity.tagline,
    tags: ['frontend', 'backend', 'cloud', 'systems'],
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

const aboutSchema = combineSchemas(generatePersonSchema(), generateWebSiteSchema());

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
