import { TERMS_PAGE_CONTENT } from '@/constants/legalConstants';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { JsonLd, combineSchemas, generatePersonSchema, generateWebPageSchema, generateWebSiteSchema } from '@/lib/seo';
import type { Metadata } from 'next';
import TermsPageClient from './TermsPageClient';

const { meta } = TERMS_PAGE_CONTENT;

const termsOgImage = buildDynamicOgImageUrl({
    title: meta.title,
    eyebrow: 'Policy',
    subtitle: 'Clear terms for fair use, content rights, responsibilities, and practical expectations.',
    tags: ['terms', 'usage', 'rights', 'policy'],
});

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = createPageMetadata({
    title: meta.title,
    description: meta.description,
    canonicalPath: '/terms',
    keywords: ['terms of service', 'content usage', 'intellectual property', 'policy', 'legal terms', SITE_CONFIG.author.name],
    includeAuthor: true,
    includeSocial: true,
    socialType: 'website',
    imageUrl: termsOgImage,
    robots: {
        index: true,
        follow: true,
    },
});

const termsSchema = combineSchemas(
    generateWebPageSchema({
        title: meta.title,
        description: meta.description,
        path: '/terms',
    }),
    generatePersonSchema(),
    generateWebSiteSchema(),
);

// =============================================================
// Terms Page — Server Component
// =============================================================
export default function TermsPage() {
    return (
        <>
            <JsonLd data={termsSchema} />
            <TermsPageClient />
        </>
    );
}
