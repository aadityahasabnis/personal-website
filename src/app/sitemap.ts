import type { MetadataRoute } from 'next';

import { SITE_CONFIG } from '@/constants/siteConstants';
import {
    getPublishedArticleStaticPaths,
    getPublishedArticleTopics,
} from '@/server/new/public/content/article';
import { getPublishedBlogStaticPaths } from '@/server/new/public/content/blog';
import { getPublishedProjectStaticPaths } from '@/server/new/public/content/project';

/**
 * Dynamic Sitemap Generation
 *
 * Uses current public content providers (server-action layer) for dynamic URLs.
 * Includes article topic/detail URLs and blog/project detail URLs where public routes exist.
 */
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
    const baseUrl = SITE_CONFIG.url;
    const now = new Date();

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
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/blogs`,
            lastModified: now,
            changeFrequency: 'weekly',
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
        ...(SITE_CONFIG.seo.search.enabled
            ? [
                {
                    url: `${baseUrl}${SITE_CONFIG.seo.search.path}`,
                    lastModified: now,
                    changeFrequency: 'weekly' as const,
                    priority: 0.4,
                },
            ]
            : []),
    ];

    const [topicResult, articlePathsResult, blogPathsResult, projectPathsResult] = await Promise.all([
        getPublishedArticleTopics({
            pagination: {
                offset: 0,
                limit: 5500,
            },
        }),
        getPublishedArticleStaticPaths(),
        getPublishedBlogStaticPaths(),
        getPublishedProjectStaticPaths(),
    ]);

    const topics = topicResult.success ? topicResult.data : [];
    const articlePaths = articlePathsResult.success ? articlePathsResult.data : [];
    const blogPaths = blogPathsResult.success ? blogPathsResult.data : [];
    const projectPaths = projectPathsResult.success ? projectPathsResult.data : [];

    const topicPages: MetadataRoute.Sitemap = topics.map((topic) => ({
        url: `${baseUrl}/articles/${topic.slug}`,
        lastModified: new Date(topic.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const articlePages: MetadataRoute.Sitemap = articlePaths.map((article) => ({
        url: `${baseUrl}/articles/${article.topicSlug}/${article.articleSlug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const blogPages: MetadataRoute.Sitemap = blogPaths.map((blog) => ({
        url: `${baseUrl}/blogs/${blog.blogSlug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const projectPages: MetadataRoute.Sitemap = projectPaths.map((project) => ({
        url: `${baseUrl}/projects/${project.projectSlug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...staticPages, ...topicPages, ...articlePages, ...blogPages, ...projectPages];
};

export default sitemap;
