import type { MetadataRoute } from 'next';

import { getAllArticlesForSitemap, getAllNotesForSitemap } from '@/server/queries/content';
import { getAllTopicsForSitemap } from '@/server/queries/topics';
import { SITE_CONFIG } from '@/constants/siteConstants';

/**
 * Dynamic Sitemap Generation
 *
 * Static pages + all dynamic content with correct URLs.
 *
 * Article URLs follow the actual route structure:
 *   /articles/[topicSlug]/[articleSlug]
 *
 * Topic pages are listed separately:
 *   /articles/[topicSlug]
 *
 * Project pages are NOT listed individually — there are no /projects/[slug] routes.
 */
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
    const baseUrl = SITE_CONFIG.url;
    const now = new Date();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/articles`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/notes`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/projects`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];

    // Fetch dynamic data in parallel
    const [articles, notes, topics] = await Promise.all([
        getAllArticlesForSitemap(),
        getAllNotesForSitemap(),
        getAllTopicsForSitemap(),
    ]);

    // Topic hub pages: /articles/[topicSlug]
    const topicPages: MetadataRoute.Sitemap = topics.map((topic) => ({
        url: `${baseUrl}/articles/${topic.slug}`,
        lastModified: topic.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Individual article pages: /articles/[topicSlug]/[articleSlug]
    const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
        url: `${baseUrl}/articles/${article.topicSlug}/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Individual note pages: /notes/[slug]
    const notePages: MetadataRoute.Sitemap = notes.map((note) => ({
        url: `${baseUrl}/notes/${note.slug}`,
        lastModified: note.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    }));

    return [...staticPages, ...topicPages, ...articlePages, ...notePages];
};

export default sitemap;
