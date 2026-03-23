import { SITE_CONFIG, SOCIAL_LINKS } from '@/constants/siteConstants';
import type { IArticle, ITopic } from '@/interfaces/schema';

const toUnique = (values: readonly string[]): string[] => Array.from(new Set(values.filter(Boolean)));

const getAuthorAlternateNames = (): string[] => {
    return toUnique([
        ...SITE_CONFIG.author.aliasesExact,
        SITE_CONFIG.shortName,
    ]);
};

/**
 * SEO Utilities for Enhanced Search Engine Optimization
 * 
 * Implements JSON-LD structured data for:
 * - Articles (BlogPosting, TechArticle)
 * - Breadcrumbs
 * - Person
 * - WebSite
 * - FAQ sections
 * - Course and HowTo schemas
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
    const sameAs = SOCIAL_LINKS
        .map((link) => link.url)
        .filter((url) => /^https?:\/\//.test(url));

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
        image: `${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}`,
        email: SITE_CONFIG.author.email,
        description: SITE_CONFIG.author.bio,
        sameAs,
        jobTitle: SITE_CONFIG.author.jobTitle,
        knowsAbout: SITE_CONFIG.author.knowsAbout,
    };
}

// Backward-compatible alias for existing imports.
export const generateOrganizationSchema = generatePersonSchema;

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
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${SITE_CONFIG.url}/#webpage`,
        url: SITE_CONFIG.url,
        name: SITE_CONFIG.title,
        description: SITE_CONFIG.description,
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
    article: IArticle;
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

/**
 * Generate comprehensive Article schema
 * Combines TechArticle and BlogPosting for maximum SEO
 * Now includes comment count and related articles for better SEO
 */
export function generateArticleSchema({
    article,
    topicSlug,
    articleSlug,
    topicTitle,
    subtopicTitle,
    commentCount = 0,
    relatedArticles = [],
}: IArticleSchemaProps) {
    const url = `${SITE_CONFIG.url}/articles/${topicSlug}/${articleSlug}`;

    const keywords = [
        topicTitle,
        ...(subtopicTitle ? [subtopicTitle] : []),
        ...(article.tags || []),
    ];

    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': ['TechArticle', 'BlogPosting'],
        '@id': url,
        url,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
        },
        headline: article.title,
        description: article.description,
        image: article.coverImage || `${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}`,
        author: {
            '@id': `${SITE_CONFIG.url}/#person`,
        },
        publisher: {
            '@id': `${SITE_CONFIG.url}/#person`,
        },
        datePublished: toIsoString(article.publishedAt),
        dateModified: toIsoString(article.updatedAt),
        articleSection: topicTitle,
        keywords: keywords.join(', '),
        wordCount: article.body ? article.body.split(/\s+/).length : 0,
        timeRequired: `PT${article.readingTime || 5}M`,
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
        schema['relatedLink'] = relatedArticles.map(
            (article) => `${SITE_CONFIG.url}/articles/${topicSlug}/${article.slug}`
        );
    }

    return schema;
}

/**
 * Generate Breadcrumb List Schema
 * Shows page hierarchy in search results
 */
export function generateBreadcrumbSchema(
    items: Array<{ name: string; url: string }>
) {
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
export function generateArticleListSchema(
    articles: Array<{ slug: string; title: string; description?: string }>,
    topicSlug: string,
    listName: string
) {
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

// ===== FAQ SCHEMAS =====

interface IFAQItem {
    question: string;
    answer: string;
}

/**
 * Generate FAQ schema for articles with Q&A sections
 */
export function generateFAQSchema(faqs: IFAQItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

// ===== HOW-TO SCHEMAS =====

interface IHowToStep {
    name: string;
    text: string;
    image?: string;
}

/**
 * Generate HowTo schema for tutorial articles
 */
export function generateHowToSchema(
    title: string,
    description: string,
    steps: IHowToStep[],
    totalTime?: string
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: title,
        description: description,
        totalTime: totalTime || 'PT10M',
        step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.name,
            text: step.text,
            image: step.image,
        })),
    };
}

// ===== COURSE SCHEMAS =====

/**
 * Generate Course schema for tutorial series
 */
export function generateCourseSchema(
    topicTitle: string,
    topicDescription: string,
    topicSlug: string,
    articles: Array<{ slug: string; title: string; order: number }>
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: topicTitle,
        description: topicDescription,
        provider: {
            '@id': `${SITE_CONFIG.url}/#person`,
        },
        hasCourseInstance: {
            '@type': 'CourseInstance',
            courseMode: 'online',
            courseWorkload: `PT${articles.length * 10}M`,
        },
        educationalLevel: 'Beginner to Advanced',
        teaches: topicDescription,
        syllabusSections: articles.map((article, index) => ({
            '@type': 'Syllabus',
            position: article.order || index + 1,
            name: article.title,
            url: `${SITE_CONFIG.url}/articles/${topicSlug}/${article.slug}`,
        })),
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

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: json }}
        />
    );
}
