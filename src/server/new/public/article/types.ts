/**
 * Public Article – Serialized Types
 *
 * Explicitly defined interfaces for JSON-safe transport.
 * These serve as a security boundary (no drafts, no internal fields)
 * and a stable API contract for the frontend.
 */

// No imports needed - types are self-contained

// ============================================================
// Full Article (detail page)
// ============================================================

/**
 * Full published article for the detail page (SSG/ISR).
 * Includes body and complete SEO metadata.
 */
export interface PublicArticle {
    _id: string;
    slug: string;
    title: string;
    description: string;
    body: string;
    tags: string[];
    coverImage: string | null;
    readingTime: number;
    publishedAt: string;
    updatedAt: string;
    featured: boolean;
    topicSlug: string;
    subtopicSlug: string | null;
    order: number;
    seo: {
        title: string | null;
        description: string | null;
        keywords: string[];
        ogImage: string | null;
        canonicalUrl: string | null;
        noIndex: boolean;
    };
}

// ============================================================
// Article Card (listing pages)
// ============================================================

/**
 * Lightweight card for listing pages — no body, no _id.
 */
export interface PublicArticleCard {
    slug: string;
    title: string;
    description: string;
    coverImage: string | null;
    readingTime: number;
    publishedAt: string;
    tags: string[];
    topicSlug: string;
    subtopicSlug: string | null;
    featured: boolean;
}

// ============================================================
// Topic with Articles (sidebar navigation)
// ============================================================

/**
 * A topic with its subtopics and articles for navigation rendering.
 */
export interface PublicTopicWithArticles {
    slug: string;
    title: string;
    description: string;
    coverImage: string | null;
    subtopics: Array<{
        slug: string;
        title: string;
        articles: PublicArticleCard[];
    }>;
    uncategorizedArticles: PublicArticleCard[];
}
