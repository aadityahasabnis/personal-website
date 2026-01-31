import type { MetadataRoute } from 'next';

import { getAllContentSlugs } from '@/server/queries/content';
import { getProjects } from '@/server/queries/projects';
import { SITE_CONFIG } from '@/constants';

/**
 * Dynamic Sitemap Generation
 *
 * Generates a sitemap.xml with all public pages:
 * - Static pages (home, about, contact, articles, notes, projects)
 * - Dynamic content (articles, notes)
 * - Projects
 */
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
    const baseUrl = SITE_CONFIG.url;

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/articles`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/notes`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/projects`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
    ];

    // Dynamic content pages
    const contentSlugs = await getAllContentSlugs();
    const contentPages: MetadataRoute.Sitemap = contentSlugs.map((item) => {
        const urlPath =
            item.type === 'article'
                ? `/articles/${item.slug}`
                : item.type === 'note'
                  ? `/notes/${item.slug}`
                  : `/${item.slug}`;

        return {
            url: `${baseUrl}${urlPath}`,
            lastModified: item.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: item.type === 'article' ? 0.8 : 0.6,
        };
    });

    // Project pages (if you have individual project pages)
    const projects = await getProjects();
    const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
        url: `${baseUrl}/projects/${project.slug}`,
        lastModified: project.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    }));

    return [...staticPages, ...contentPages, ...projectPages];
};

export default sitemap;
