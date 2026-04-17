import { SITE_CONFIG } from '@/constants/siteConstants';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/server/new/public/content/article', () => ({
    getPublishedArticleTopics: vi.fn().mockResolvedValue({
        success: true,
        data: [
            {
                id: 'topic-1',
                slug: 'system-design',
                title: 'System Design',
                description: 'System Design Articles',
                coverImage: null,
                order: 0,
                featured: true,
                subTopicCount: 0,
                contentCount: 1,
                updatedAt: '2026-04-01T10:00:00.000Z',
            },
        ],
    }),
    getPublishedArticleStaticPaths: vi.fn().mockResolvedValue({
        success: true,
        data: [{ contentId: 'a1', topicSlug: 'system-design', articleSlug: 'caching-strategies' }],
    }),
    getPublishedArticleByPath: vi.fn().mockResolvedValue({
        success: true,
        data: {
            id: 'a1',
            slug: 'caching-strategies',
            title: 'Caching Strategies',
            description: 'Practical caching strategies for scalable systems.',
            body: 'Article body',
            html: '<p>Article body</p>',
            tags: ['caching', 'performance'],
            coverImage: null,
            readingTime: 8,
            featured: true,
            updatedAt: '2026-04-10T10:00:00.000Z',
            publishedAt: '2026-04-08T10:00:00.000Z',
            topic: { id: 'topic-1', slug: 'system-design', title: 'System Design' },
            subtopic: null,
            seo: null,
        },
    }),
}));

vi.mock('@/server/new/public/content/blog', () => ({
    getPublishedBlogStaticPaths: vi.fn().mockResolvedValue({
        success: true,
        data: [{ contentId: 'b1', blogSlug: 'deep-work' }],
    }),
    getPublishedBlogByPath: vi.fn().mockResolvedValue({
        success: true,
        data: {
            updatedAt: '2026-04-11T10:00:00.000Z',
            publishedAt: '2026-04-09T10:00:00.000Z',
        },
    }),
}));

vi.mock('@/server/new/public/content/project', () => ({
    getPublishedProjectStaticPaths: vi.fn().mockResolvedValue({
        success: true,
        data: [{ contentId: 'p1', projectSlug: 'portfolio-revamp' }],
    }),
    getPublishedProjectByPath: vi.fn().mockResolvedValue({
        success: true,
        data: {
            updatedAt: '2026-04-12T10:00:00.000Z',
            publishedAt: '2026-04-09T10:00:00.000Z',
        },
    }),
}));

describe('crawl contracts', () => {
    it('robots keeps Next assets crawlable while blocking private surfaces', async () => {
        const robotsModule = await import('@/app/robots');
        const output = robotsModule.default();
        const firstRule = (Array.isArray(output.rules) ? output.rules[0] : output.rules) as { disallow?: string | string[] } | undefined;

        expect(firstRule).toBeDefined();
        expect(firstRule?.disallow).toEqual(expect.arrayContaining(['/admin', '/admin/', '/api', '/api/', '/private/']));
        expect(firstRule?.disallow).not.toEqual(expect.arrayContaining(['/_next/']));
    });

    it('sitemap uses detail content dates for article/blog/project lastModified', async () => {
        const sitemapModule = await import('@/app/sitemap');
        const entries = await sitemapModule.default();

        const articleEntry = entries.find((entry) => entry.url === `${SITE_CONFIG.url}/articles/system-design/caching-strategies`);
        const blogEntry = entries.find((entry) => entry.url === `${SITE_CONFIG.url}/blogs/deep-work`);
        const projectEntry = entries.find((entry) => entry.url === `${SITE_CONFIG.url}/projects/portfolio-revamp`);

        const toIso = (value: string | Date | undefined): string | undefined => {
            if (!value) return undefined;
            const normalized = typeof value === 'string' ? new Date(value) : value;
            return normalized.toISOString();
        };

        expect(toIso(articleEntry?.lastModified)).toBe('2026-04-10T10:00:00.000Z');
        expect(toIso(blogEntry?.lastModified)).toBe('2026-04-11T10:00:00.000Z');
        expect(toIso(projectEntry?.lastModified)).toBe('2026-04-12T10:00:00.000Z');
    });

    it('rss emits absolute channel image URL without duplicate origin prefix', async () => {
        const rssModule = await import('@/app/rss.xml/route');
        const res = await rssModule.GET();
        const xml = await res.text();

        expect(xml).toContain(`<url>${SITE_CONFIG.seo.ogImage}</url>`);
        expect(xml).not.toContain(`<url>${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}</url>`);
    });

    it('article hub and topic pages compose person and website identities in their schema graph', () => {
        const articlesHubSource = fs.readFileSync(path.resolve(process.cwd(), 'src/app/(public)/articles/page.tsx'), 'utf8');
        const topicPageSource = fs.readFileSync(path.resolve(process.cwd(), 'src/app/(public)/articles/[topicSlug]/page.tsx'), 'utf8');

        expect(articlesHubSource).toContain('generatePersonSchema()');
        expect(articlesHubSource).toContain('generateWebSiteSchema()');
        expect(topicPageSource).toContain('generatePersonSchema()');
        expect(topicPageSource).toContain('generateWebSiteSchema()');
    });
});
