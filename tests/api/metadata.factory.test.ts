import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { describe, expect, it } from 'vitest';

describe('metadata factory', () => {
    it('uses absolute default OG image and canonical URL', () => {
        const metadata = createPageMetadata({
            title: 'Testing Metadata',
            description: 'Metadata factory contract test',
            canonicalPath: '/blogs/testing-metadata',
            includeSocial: true,
            socialType: 'article',
        });

        expect(metadata.alternates?.canonical).toBe(`${SITE_CONFIG.url}/blogs/testing-metadata`);
        expect(metadata.openGraph?.url).toBe(`${SITE_CONFIG.url}/blogs/testing-metadata`);
        expect(metadata.openGraph?.images).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    url: SITE_CONFIG.seo.ogImage,
                    secureUrl: SITE_CONFIG.seo.ogImage,
                    width: 1200,
                    height: 630,
                    alt: 'Testing Metadata',
                }),
            ])
        );
    });

    it('accepts canonical overrides passed as absolute URLs', () => {
        const metadata = createPageMetadata({
            title: 'Custom Canonical',
            description: 'Custom canonical test',
            canonicalPath: 'https://example.com/custom-canonical',
            includeSocial: true,
        });

        expect(metadata.alternates?.canonical).toBe('https://example.com/custom-canonical');
        expect(metadata.openGraph?.url).toBe('https://example.com/custom-canonical');
    });

    it('preserves repeated-style metadata values like article tags', () => {
        const metadata = createPageMetadata({
            title: 'Tagged Article',
            description: 'Article tag metadata test',
            canonicalPath: '/articles/topic/tagged-article',
            includeSocial: true,
            socialType: 'article',
            other: {
                'article:section': 'Engineering',
                'article:tag': ['Guide', 'SEO', 'Open Graph'],
            },
        });

        expect(metadata.other?.['article:section']).toBe('Engineering');
        expect(metadata.other?.['article:tag']).toEqual(['Guide', 'SEO', 'Open Graph']);
    });
});
