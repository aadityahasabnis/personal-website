import type { MetadataRoute } from 'next';

import { SITE_CONFIG } from '@/constants';

/**
 * Robots.txt Generation
 *
 * Defines crawling rules for search engines:
 * - Allows all public pages
 * - Blocks admin routes
 * - Blocks API routes (except specific ones if needed)
 * - References sitemap location
 */
const robots = (): MetadataRoute.Robots => {
    const baseUrl = SITE_CONFIG.url;

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/admin/',
                    '/admin',
                    '/api/',
                    '/_next/',
                    '/private/',
                ],
            },
            // Block specific bots that are known to cause issues
            {
                userAgent: 'GPTBot',
                disallow: ['/'],
            },
            {
                userAgent: 'CCBot',
                disallow: ['/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
};

export default robots;
