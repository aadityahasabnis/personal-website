import { SITE_CONFIG, SOCIAL_LINKS } from '@/constants/siteConstants';
import type { ITopic } from '@/interfaces/schema';

const toUnique = (values: readonly string[]): string[] => Array.from(new Set(values.filter(Boolean)));

const toAbsoluteUrl = (value: string): string => {
    return /^https?:\/\//.test(value) ? value : `${SITE_CONFIG.url}${value}`;
};

const getDefaultOgImage = (): string => toAbsoluteUrl(SITE_CONFIG.seo.ogImage);

const getAuthorAlternateNames = (): string[] => {
    return toUnique([...SITE_CONFIG.author.aliasesExact, SITE_CONFIG.shortName]);
};

/**
 * SEO Utilities for Enhanced Search Engine Optimization
 *
 * Implements JSON-LD structured data for:
 * - Articles (BlogPosting, TechArticle)
 * - Breadcrumbs
 * - Person
 * - WebSite
 * - Topic lists and collection pages
 *
 * This helps:
 * 1. Search engines understand content structure
 * 2. AI models scrape accurate data
 * 3. Rich snippets in search results
 * 4. Knowledge graph integration
 */

// ===== BASE SCHEMAS =====

/**
 * Person Schema
 * Used across all pages for author identity.
 */
export function generatePersonSchema() {
    const sameAs = SOCIAL_LINKS.map((link) => link.url).filter((url) => /^https?:\/\//.test(url));

    const alternateNames = getAuthorAlternateNames();

    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': `${SITE_CONFIG.url}/#person`,
        name: SITE_CONFIG.author.name,
        givenName: SITE_CONFIG.author.givenName,
        familyName: SITE_CONFIG.author.familyName,
        ...(alternateNames.length > 0 ? { alternateName: alternateNames } : {}),
        url: SITE_CONFIG.url,
        image: getDefaultOgImage(),
        email: SITE_CONFIG.author.email,
        description: SITE_CONFIG.author.bio,
        sameAs,
        jobTitle: SITE_CONFIG.author.jobTitle,
        knowsAbout: SITE_CONFIG.author.knowsAbout,
    };
}

/**
 * Website Schema
 * Describes the overall site to search engines.
 * SearchAction is conditional and enabled only when a public search route exists.
 */
export function generateWebSiteSchema() {
    const searchTarget = `${SITE_CONFIG.url}${SITE_CONFIG.seo.search.path}?${SITE_CONFIG.seo.search.queryParam}={search_term_string}`;

    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_CONFIG.url}/#website`,
        url: SITE_CONFIG.url,
        name: SITE_CONFIG.name,
        alternateName: SITE_CONFIG.seo.websiteAlternateNames,
        description: SITE_CONFIG.description,
        publisher: {
            '@id': `${SITE_CONFIG.url}/#person`,
        },
        ...(SITE_CONFIG.seo.search.enabled
            ? {
                  potentialAction: {
                      '@type': 'SearchAction',
                      target: searchTarget,
                      'query-input': 'required name=search_term_string',
                  },
              }
            : {}),
    };
}

/**
 * Home WebPage schema to complete the identity graph.
 */
export function generateHomeWebPageSchema() {
    return generateWebPageSchema({
        title: SITE_CONFIG.title,
        description: SITE_CONFIG.description,
        path: '/',
    });
}

interface IGenerateWebPageSchemaOptions {
    title: string;
    description: string;
    path: string;
}

export function generateWebPageSchema({ title, description, path }: IGenerateWebPageSchemaOptions) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = normalizedPath === '/' ? SITE_CONFIG.url : `${SITE_CONFIG.url}${normalizedPath}`;

    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        isPartOf: {
            '@id': `${SITE_CONFIG.url}/#website`,
        },
        about: {
            '@id': `${SITE_CONFIG.url}/#person`,
        },
    };
}

// ===== ARTICLE SCHEMAS =====

interface IArticleSchemaProps {
    article: {
        title: string;
        description: string;
        body: string;
        tags: string[];
        coverImage: string | null;
        readingTime: number;
        publishedAt: Date | string | null;
        updatedAt: Date | string | null;
    };
    topicSlug: string;
    articleSlug: string;
    topicTitle: string;
    subtopicTitle?: string;
    commentCount?: number;
    relatedArticles?: Array<{ slug: string; title: string }>;
}

const toIsoString = (value: Date | string | undefined | null): string | undefined => {
    if (!value) return undefined;
    return new Date(value).toISOString();
};

const toWordCount = (body: string | undefined): number | undefined => {
    if (!body) return undefined;
    const cleanBody = body
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!cleanBody) return undefined;
    return cleanBody.split(' ').length;
};

const toArticleBodyExcerpt = (body: string | undefined): string | undefined => {
    if (!body) return undefined;

    const plain = body
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!plain) return undefined;
    return plain.slice(0, 5000);
};

/**
 * Generate comprehensive Article schema
 * Combines TechArticle and BlogPosting for maximum SEO
 * Now includes comment count and related articles for better SEO
 */
export function generateArticleSchema({ article, topicSlug, articleSlug, topicTitle, subtopicTitle, commentCount = 0, relatedArticles = [] }: IArticleSchemaProps) {
    const url = `${SITE_CONFIG.url}/articles/${topicSlug}/${articleSlug}`;
    const articleBodyExcerpt = toArticleBodyExcerpt(article.body);
    const wordCount = toWordCount(article.body);
    const publishedAt = toIsoString(article.publishedAt);
    const modifiedAt = toIsoString(article.updatedAt);

    const keywords = [topicTitle, ...(subtopicTitle ? [subtopicTitle] : []), ...(article.tags || [])];

    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': ['TechArticle', 'BlogPosting'],
        '@id': url,
        url,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${url}#webpage`,
        },
        headline: article.title,
        description: article.description,
        image: article.coverImage ? toAbsoluteUrl(article.coverImage) : getDefaultOgImage(),
        author: {
            '@type': 'Person',
            '@id': `${SITE_CONFIG.url}/#person`,
            name: SITE_CONFIG.author.name,
            url: SITE_CONFIG.url,
        },
        publisher: {
            '@type': 'Person',
            '@id': `${SITE_CONFIG.url}/#person`,
            name: SITE_CONFIG.author.name,
            url: SITE_CONFIG.url,
        },
        ...(publishedAt ? { datePublished: publishedAt } : {}),
        ...(modifiedAt ? { dateModified: modifiedAt } : {}),
        articleSection: topicTitle,
        keywords: keywords.join(', '),
        ...(articleBodyExcerpt ? { articleBody: articleBodyExcerpt } : {}),
        ...(wordCount ? { wordCount } : {}),
        ...(article.readingTime > 0 ? { timeRequired: `PT${article.readingTime}M` } : {}),
        inLanguage: 'en-US',
        isAccessibleForFree: true,
    };

    // Add interaction statistics if comments exist
    if (commentCount > 0) {
        schema['interactionStatistic'] = {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/CommentAction',
            userInteractionCount: commentCount,
        };
        schema['commentCount'] = commentCount;
    }

    // Add related articles for internal linking
    if (relatedArticles.length > 0) {
        schema['relatedLink'] = relatedArticles.map((article) => `${SITE_CONFIG.url}/articles/${topicSlug}/${article.slug}`);
    }

    return schema;
}

interface IGenerateBlogPostingSchemaOptions {
    slug: string;
    title: string;
    description: string;
    body?: string;
    tags?: string[];
    imageUrl?: string | null;
    publishedAt?: string | null;
    updatedAt?: string | null;
}

export function generateBlogPostingSchema(options: IGenerateBlogPostingSchemaOptions) {
    const url = `${SITE_CONFIG.url}/blogs/${options.slug}`;
    const articleBodyExcerpt = toArticleBodyExcerpt(options.body);
    const wordCount = toWordCount(options.body);
    const publishedAt = toIsoString(options.publishedAt);
    const modifiedAt = toIsoString(options.updatedAt);

    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': url,
        url,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${url}#webpage`,
        },
        headline: options.title,
        description: options.description,
        image: options.imageUrl ? toAbsoluteUrl(options.imageUrl) : getDefaultOgImage(),
        author: {
            '@type': 'Person',
            '@id': `${SITE_CONFIG.url}/#person`,
            name: SITE_CONFIG.author.name,
            url: SITE_CONFIG.url,
        },
        publisher: {
            '@type': 'Person',
            '@id': `${SITE_CONFIG.url}/#person`,
            name: SITE_CONFIG.author.name,
            url: SITE_CONFIG.url,
        },
        ...(publishedAt ? { datePublished: publishedAt } : {}),
        ...(modifiedAt ? { dateModified: modifiedAt } : {}),
        ...(options.tags && options.tags.length > 0 ? { keywords: options.tags.join(', ') } : {}),
        ...(articleBodyExcerpt ? { articleBody: articleBodyExcerpt } : {}),
        ...(wordCount ? { wordCount } : {}),
        inLanguage: 'en-US',
        isAccessibleForFree: true,
    };
}

interface IGenerateProjectSchemaOptions {
    slug: string;
    title: string;
    description: string;
    body?: string;
    tags?: string[];
    techStack?: string[];
    imageUrl?: string | null;
    publishedAt?: string | null;
    updatedAt?: string | null;
    liveUrl?: string | null;
    githubUrl?: string | null;
}

export function generateProjectSchema(options: IGenerateProjectSchemaOptions) {
    const url = `${SITE_CONFIG.url}/projects/${options.slug}`;
    const articleBodyExcerpt = toArticleBodyExcerpt(options.body);
    const modifiedAt = toIsoString(options.updatedAt);
    const publishedAt = toIsoString(options.publishedAt);
    const softwareKeywords = [...(options.tags ?? []), ...(options.techStack ?? [])];

    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        '@id': url,
        url,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${url}#webpage`,
        },
        name: options.title,
        description: options.description,
        image: options.imageUrl ? toAbsoluteUrl(options.imageUrl) : getDefaultOgImage(),
        author: {
            '@type': 'Person',
            '@id': `${SITE_CONFIG.url}/#person`,
            name: SITE_CONFIG.author.name,
            url: SITE_CONFIG.url,
        },
        publisher: {
            '@type': 'Person',
            '@id': `${SITE_CONFIG.url}/#person`,
            name: SITE_CONFIG.author.name,
            url: SITE_CONFIG.url,
        },
        ...(publishedAt ? { datePublished: publishedAt } : {}),
        ...(modifiedAt ? { dateModified: modifiedAt } : {}),
        ...(options.liveUrl ? { codeSampleType: 'full', targetProduct: toAbsoluteUrl(options.liveUrl) } : {}),
        ...(options.githubUrl ? { codeRepository: options.githubUrl } : {}),
        ...(softwareKeywords.length > 0 ? { keywords: softwareKeywords.join(', ') } : {}),
        ...(options.techStack && options.techStack.length > 0 ? { programmingLanguage: options.techStack } : {}),
        ...(articleBodyExcerpt ? { text: articleBodyExcerpt } : {}),
        inLanguage: 'en-US',
    };
}

/**
 * Generate Breadcrumb List Schema
 * Shows page hierarchy in search results
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

// ===== COLLECTION SCHEMAS =====

/**
 * Generate ItemList schema for article collections
 * Used on topic pages and subtopic pages
 */
export function generateArticleListSchema(articles: Array<{ slug: string; title: string; description?: string }>, topicSlug: string, listName: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: listName,
        description: `Collection of articles about ${listName}`,
        numberOfItems: articles.length,
        itemListElement: articles.map((article, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_CONFIG.url}/articles/${topicSlug}/${article.slug}`,
            name: article.title,
            description: article.description,
        })),
    };
}

/**
 * Generate CollectionPage schema for topic pages
 */
export function generateTopicSchema(topic: ITopic, articleCount: number) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${SITE_CONFIG.url}/articles/${topic.slug}`,
        name: topic.title,
        description: topic.description,
        url: `${SITE_CONFIG.url}/articles/${topic.slug}`,
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: articleCount,
        },
        about: {
            '@type': 'Thing',
            name: topic.title,
            description: topic.description,
        },
    };
}

// ===== HELPER FUNCTIONS =====

/**
 * Combine multiple schemas into a single JSON-LD graph
 */
export function combineSchemas(...schemas: object[]) {
    return {
        '@context': 'https://schema.org',
        '@graph': schemas,
    };
}

/**
 * Render JSON-LD script tag
 * Use in page components like: <JsonLd data={schema} />
 */
export function JsonLd({ data }: { data: object }) {
    const json = JSON.stringify(data).replace(/</g, '\\u003c');

    return <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: json }} />;
}
