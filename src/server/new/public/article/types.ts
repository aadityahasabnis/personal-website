/**
 * Public Article – Serialized Types
 *
 * Derived from schema.ts using Pick + Serialized<T>.
 * These serve as a security boundary (no drafts, no internal fields)
 * and a stable API contract for the frontend.
 */

import type {
    IArticle,
    ISeoMetadata,
    Serialized,
} from '@/interfaces/schema';

// ============================================================
// Full Article (detail page)
// ============================================================

/**
 * Full published article for the detail page (SSG/ISR).
 * Includes body and complete SEO metadata.
 */
export type PublicArticle = Pick<
    Serialized<IArticle>,
    | '_id'
    | 'slug'
    | 'title'
    | 'description'
    | 'body'
    | 'tags'
    | 'coverImage'
    | 'readingTime'
    | 'publishedAt'
    | 'updatedAt'
    | 'featured'
    | 'topicSlug'
    | 'subtopicSlug'
    | 'order'
> & {
    seo: Serialized<ISeoMetadata>;
};

// ============================================================
// Article Card (listing pages)
// ============================================================

/**
 * Lightweight card for listing pages — no body, no _id.
 */
export type PublicArticleCard = Pick<
    Serialized<IArticle>,
    | 'slug'
    | 'title'
    | 'description'
    | 'coverImage'
    | 'readingTime'
    | 'publishedAt'
    | 'tags'
    | 'topicSlug'
    | 'subtopicSlug'
    | 'featured'
>;

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
