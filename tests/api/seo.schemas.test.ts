import { SITE_CONFIG, SOCIAL_LINKS } from '@/constants/siteConstants';
import {
    generateBlogPostingSchema,
    generateHomeWebPageSchema,
    generatePersonSchema,
    generateProjectSchema,
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

    it('blog posting schema emits canonical identifiers and content metadata', () => {
        const schema = generateBlogPostingSchema({
            slug: 'shipping-fast-with-nextjs',
            title: 'Shipping Fast with Next.js',
            description: 'Practical systems thinking for shipping and iteration.',
            body: 'This is a practical guide for shipping reliable features quickly.',
            tags: ['nextjs', 'shipping', 'engineering'],
            imageUrl: '/images/blog-og.png',
            publishedAt: '2026-04-16T10:00:00.000Z',
            updatedAt: '2026-04-17T10:00:00.000Z',
        }) as Record<string, unknown>;

        expect(schema['@type']).toBe('BlogPosting');
        expect(schema.url).toBe(`${SITE_CONFIG.url}/blogs/shipping-fast-with-nextjs`);
        expect(schema.mainEntityOfPage).toEqual({
            '@type': 'WebPage',
            '@id': `${SITE_CONFIG.url}/blogs/shipping-fast-with-nextjs#webpage`,
        });
        expect(schema.image).toBe(`${SITE_CONFIG.url}/images/blog-og.png`);
        expect(schema.author).toEqual(
            expect.objectContaining({
                '@type': 'Person',
                '@id': `${SITE_CONFIG.url}/#person`,
                name: SITE_CONFIG.author.name,
            })
        );
        expect(schema.keywords).toBe('nextjs, shipping, engineering');
        expect(schema.datePublished).toBe('2026-04-16T10:00:00.000Z');
        expect(schema.dateModified).toBe('2026-04-17T10:00:00.000Z');
    });

    it('project schema emits software source code graph fields', () => {
        const schema = generateProjectSchema({
            slug: 'portfolio-revamp',
            title: 'Portfolio Revamp',
            description: 'A static-first portfolio with dynamic engagement islands.',
            body: 'Project deep dive body with architecture decisions.',
            tags: ['portfolio', 'seo'],
            techStack: ['Next.js', 'TypeScript'],
            imageUrl: '/images/project-og.png',
            publishedAt: '2026-04-10T10:00:00.000Z',
            updatedAt: '2026-04-17T10:00:00.000Z',
            liveUrl: 'https://aadityahasabnis.com/projects/portfolio-revamp',
            githubUrl: 'https://github.com/example/repo',
        }) as Record<string, unknown>;

        expect(schema['@type']).toBe('SoftwareSourceCode');
        expect(schema.url).toBe(`${SITE_CONFIG.url}/projects/portfolio-revamp`);
        expect(schema.mainEntityOfPage).toEqual({
            '@type': 'WebPage',
            '@id': `${SITE_CONFIG.url}/projects/portfolio-revamp#webpage`,
        });
        expect(schema.image).toBe(`${SITE_CONFIG.url}/images/project-og.png`);
        expect(schema.codeRepository).toBe('https://github.com/example/repo');
        expect(schema.programmingLanguage).toEqual(['Next.js', 'TypeScript']);
        expect(schema.keywords).toBe('portfolio, seo, Next.js, TypeScript');
    });
});
