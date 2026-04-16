import { PRIVACY_PAGE_CONTENT } from '@/constants/legalConstants';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { JsonLd, combineSchemas, generatePersonSchema, generateWebPageSchema, generateWebSiteSchema } from '@/lib/seo';
import type { Metadata } from 'next';
import PrivacyPageClient from './PrivacyPageClient';

const { meta } = PRIVACY_PAGE_CONTENT;

const privacyOgImage = buildDynamicOgImageUrl({
    title: meta.title,
    eyebrow: 'Policy',
    subtitle: 'How data is handled with practical safeguards, transparency, and clear communication.',
    tags: ['privacy', 'trust', 'transparency', 'policy'],
});

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = createPageMetadata({
    title: meta.title,
    description: meta.description,
    canonicalPath: '/privacy',
    keywords: ['privacy policy', 'data protection', 'cookies', 'transparency', 'trust', SITE_CONFIG.author.name],
    includeAuthor: true,
    includeSocial: true,
    socialType: 'website',
    imageUrl: privacyOgImage,
    robots: {
        index: true,
        follow: true,
    },
});

const privacySchema = combineSchemas(
    generateWebPageSchema({
        title: meta.title,
        description: meta.description,
        path: '/privacy',
    }),
    generatePersonSchema(),
    generateWebSiteSchema(),
);

// =============================================================
// Privacy Page — Server Component
// =============================================================
export default function PrivacyPage() {
    return (
        <>
            <JsonLd data={privacySchema} />
            <PrivacyPageClient />
        </>
    );
}
