import { NAV_LINKS, SITE_CONFIG } from '@/constants/siteConstants';
import type { MetadataRoute } from 'next';

const THEME_COLOR = '#8b5cf6';
const BACKGROUND_COLOR = '#ffffff';

const toManifestCategories = (): string[] => {
    const authorTokens = new Set(
        [SITE_CONFIG.author.name, ...SITE_CONFIG.author.aliasesExact]
            .map((value) => value.toLowerCase().trim())
            .filter(Boolean),
    );

    return Array.from(
        new Set(
            SITE_CONFIG.seo.defaultKeywords
                .map((value) => value.toLowerCase().trim())
                .filter((value) => value.length > 0 && !authorTokens.has(value)),
        ),
    ).slice(0, 6);
};

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: SITE_CONFIG.name,
        short_name: SITE_CONFIG.shortName,
        description: SITE_CONFIG.description,
        id: '/',
        start_url: '/',
        scope: '/',
        lang: SITE_CONFIG.locale,
        dir: 'ltr',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui', 'browser'],
        background_color: BACKGROUND_COLOR,
        theme_color: THEME_COLOR,
        categories: toManifestCategories(),
        prefer_related_applications: false,
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/favicon-16x16.png',
                sizes: '16x16',
                type: 'image/png',
            },
            {
                src: '/apple-touch-icon.png',
                sizes: '180x180',
                type: 'image/png',
            },
        ],
        shortcuts: NAV_LINKS.map((link) => ({
            name: link.label,
            short_name: link.label,
            url: link.href,
            icons: [{ src: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }],
        })),
    };
}
