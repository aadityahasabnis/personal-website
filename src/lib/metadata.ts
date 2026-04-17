import type { OpenGraphType } from '@/constants/schemaConstants';
import { SITE_CONFIG } from '@/constants/siteConstants';
import type { Metadata } from 'next';

interface IMetadataFactoryOptions {
    title: string;
    titleAbsolute?: boolean;
    description: string;
    canonicalPath: string;
    keywords?: string[];
    includeAuthor?: boolean;
    includeSocial?: boolean;
    socialType?: OpenGraphType;
    imageUrl?: string;
    openGraph?: {
        publishedTime?: string;
        modifiedTime?: string;
        authors?: string[];
        tags?: string[];
    };
    robots?: Metadata['robots'];
    other?: Metadata['other'];
}

const toAbsoluteUrl = (value: string): string => {
    return /^https?:\/\//.test(value) ? value : `${SITE_CONFIG.url}${value}`;
};

const detectMimeFromImageUrl = (url: string): string | undefined => {
    const lower = url.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.avif')) return 'image/avif';
    if (lower.endsWith('.gif')) return 'image/gif';
    if (lower.endsWith('.svg')) return 'image/svg+xml';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    return undefined;
};

const toBrandedOgTitle = (title: string): string => {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
        return SITE_CONFIG.title;
    }

    if (normalizedTitle.includes(SITE_CONFIG.name) || normalizedTitle.includes(SITE_CONFIG.author.name)) {
        return normalizedTitle;
    }

    return `${normalizedTitle} | ${SITE_CONFIG.name}`;
};

/**
 * Shared metadata factory for route-level generateMetadata functions.
 *
 * Usage (article/blog/project/note detail pages):
 * createPageMetadata({
 *   title,
 *   description,
 *   canonicalPath: '/blogs/my-post',
 *   includeSocial: true,
 *   socialType: 'article',
 *   imageUrl,
 *   robots: { index: true, follow: true },
 * });
 *
 * Usage (search page):
 * createPageMetadata({
 *   title: hasQuery ? `Search: ${query}` : 'Search',
 *   description: `Search ${SITE_CONFIG.name} content across articles, blogs, and projects.`,
 *   canonicalPath: SITE_CONFIG.seo.search.path,
 *   robots: hasQuery ? { index: false, follow: true } : { index: true, follow: true },
 * });
 */
export function createPageMetadata(options: IMetadataFactoryOptions): Metadata {
    const canonical = toAbsoluteUrl(options.canonicalPath);
    const image = options.imageUrl ? toAbsoluteUrl(options.imageUrl) : toAbsoluteUrl(SITE_CONFIG.seo.ogImage);
    const imageMime = detectMimeFromImageUrl(image);

    const metadata: Metadata = {
        title: options.titleAbsolute ? { absolute: options.title } : options.title,
        description: options.description,
        alternates: {
            canonical,
            languages: {
                [SITE_CONFIG.locale]: canonical,
            },
        },
        ...(options.keywords && options.keywords.length > 0
            ? { keywords: options.keywords.join(', ') }
            : {}),
        ...(options.robots ? { robots: options.robots } : {}),
        ...(options.other ? { other: options.other } : {}),
    };

    if (options.includeAuthor) {
        metadata.authors = [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.url }];
        metadata.creator = SITE_CONFIG.author.name;
        metadata.publisher = SITE_CONFIG.author.name;
    }

    if (options.includeSocial) {
        const socialTitle = toBrandedOgTitle(options.title);

        metadata.openGraph = {
            title: socialTitle,
            description: options.description,
            url: canonical,
            siteName: SITE_CONFIG.name,
            locale: SITE_CONFIG.seo.ogLocale,
            type: options.socialType ?? 'website',
            images: [
                {
                    url: image,
                    secureUrl: image.startsWith('https://') ? image : undefined,
                    width: 1200,
                    height: 630,
                    alt: options.title,
                    ...(imageMime ? { type: imageMime } : {}),
                },
            ],
            ...(options.openGraph?.publishedTime
                ? { publishedTime: options.openGraph.publishedTime }
                : {}),
            ...(options.openGraph?.modifiedTime
                ? { modifiedTime: options.openGraph.modifiedTime }
                : {}),
            ...(options.openGraph?.authors && options.openGraph.authors.length > 0
                ? { authors: options.openGraph.authors }
                : {}),
            ...(options.openGraph?.tags && options.openGraph.tags.length > 0
                ? { tags: options.openGraph.tags }
                : {}),
        };

        metadata.twitter = {
            card: 'summary_large_image',
            title: socialTitle,
            description: options.description,
            creator: SITE_CONFIG.seo.twitterHandle,
            site: SITE_CONFIG.seo.twitterHandle,
            images: [image],
        };
    }

    return metadata;
}
