import { SITE_CONFIG } from '@/constants';
import type { IArticle, ITopic } from '@/interfaces';

/**
 * SEO Utilities for Enhanced Search Engine Optimization
 * 
 * Implements JSON-LD structured data for:
 * - Articles (BlogPosting, TechArticle)
 * - Breadcrumbs
 * - Organization
 * - WebSite with SearchAction
 * - FAQ sections
 * - Person schema
 * 
 * This helps:
 * 1. Search engines understand content structure
 * 2. AI models scrape accurate data
 * 3. Rich snippets in search results
 * 4. Knowledge graph integration
 */

// ===== BASE SCHEMAS =====

/**
 * Organization Schema
 * Used across all pages for brand identity
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        '@id': `${SITE_CONFIG.url}/#person`,
        name: SITE_CONFIG.author.name,
        url: SITE_CONFIG.url,
        email: SITE_CONFIG.author.email,
        description: SITE_CONFIG.author.bio,
        sameAs: SITE_CONFIG.socials?.map(s => s.url) || [],
        jobTitle: 'Software Developer',
        knowsAbout: [
            'Web Development',
            'JavaScript',
            'TypeScript',
            'React',
            'Next.js',
            'Node.js',
            'Data Structures',
            'Algorithms',
            'System Design',
        ],
    };
}

/**
 * Website Schema with SearchAction
 * Enables site search in search results
 */
export function generateWebSiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_CONFIG.url}/#website`,
        url: SITE_CONFIG.url,
        name: SITE_CONFIG.name,
        description: SITE_CONFIG.description,
        publisher: {
            '@id': `${SITE_CONFIG.url}/#person`,
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
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
}

/**
 * Generate comprehensive Article schema
 * Combines TechArticle and BlogPosting for maximum SEO
 */
export function generateArticleSchema({
    article,
    topicSlug,
    articleSlug,
    topicTitle,
    subtopicTitle,
}: IArticleSchemaProps) {
    const url = `${SITE_CONFIG.url}/articles/${topicSlug}/${articleSlug}`;
    
    const keywords = [
        topicTitle,
        ...(subtopicTitle ? [subtopicTitle] : []),
        ...(article.tags || []),
    ];

    return {
        '@context': 'https://schema.org',
        '@type': ['TechArticle', 'BlogPosting'],
        '@id': url,
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
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        articleSection: topicTitle,
        keywords: keywords.join(', '),
        wordCount: article.body ? article.body.split(/\s+/).length : 0,
        timeRequired: `PT${article.readingTime || 5}M`,
        inLanguage: 'en-US',
        isAccessibleForFree: true,
    };
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
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
