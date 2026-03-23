import { SITE_CONFIG, SOCIAL_LINKS } from '@/constants/siteConstants';
import {
    generateHomeWebPageSchema,
    generatePersonSchema,
    generateWebSiteSchema,
} from '@/lib/seo';
import { describe, expect, it } from 'vitest';

describe('seo schema utilities', () => {
    it('person schema includes canonical identity, alternates, and only http(s) sameAs links', () => {
        const schema = generatePersonSchema() as Record<string, unknown>;

        expect(schema['@type']).toBe('Person');
        expect(schema.name).toBe(SITE_CONFIG.author.name);
        expect(schema.givenName).toBe(SITE_CONFIG.author.givenName);
        expect(schema.familyName).toBe(SITE_CONFIG.author.familyName);

        expect(schema.alternateName).toEqual(
            expect.arrayContaining([...SITE_CONFIG.author.aliasesExact, SITE_CONFIG.shortName])
        );

        const expectedSameAs = SOCIAL_LINKS
            .map((link) => link.url)
            .filter((url) => /^https?:\/\//.test(url));

        expect(schema.sameAs).toEqual(expectedSameAs);
        expect((schema.sameAs as string[]).some((url) => url.startsWith('mailto:'))).toBe(false);
    });

    it('website schema omits SearchAction when search is disabled', () => {
        const original = SITE_CONFIG.seo.search.enabled;

        try {
            (SITE_CONFIG as unknown as { seo: { search: { enabled: boolean } } }).seo.search.enabled = false;

            const schema = generateWebSiteSchema() as Record<string, unknown>;
            expect(schema['@type']).toBe('WebSite');
            expect(schema.potentialAction).toBeUndefined();
        } finally {
            (SITE_CONFIG as unknown as { seo: { search: { enabled: boolean } } }).seo.search.enabled = original;
        }
    });

    it('website schema includes SearchAction when search is enabled', () => {
        const original = SITE_CONFIG.seo.search.enabled;

        try {
            (SITE_CONFIG as unknown as { seo: { search: { enabled: boolean } } }).seo.search.enabled = true;

            const schema = generateWebSiteSchema() as Record<string, unknown>;
            const expectedTarget = `${SITE_CONFIG.url}${SITE_CONFIG.seo.search.path}?${SITE_CONFIG.seo.search.queryParam}={search_term_string}`;

            expect(schema.potentialAction).toEqual({
                '@type': 'SearchAction',
                target: expectedTarget,
                'query-input': 'required name=search_term_string',
            });
        } finally {
            (SITE_CONFIG as unknown as { seo: { search: { enabled: boolean } } }).seo.search.enabled = original;
        }
    });

    it('home webpage schema links site and person entities', () => {
        const schema = generateHomeWebPageSchema() as Record<string, unknown>;

        expect(schema['@type']).toBe('WebPage');
        expect(schema.url).toBe(SITE_CONFIG.url);
        expect(schema.isPartOf).toEqual({ '@id': `${SITE_CONFIG.url}/#website` });
        expect(schema.about).toEqual({ '@id': `${SITE_CONFIG.url}/#person` });
    });
});
