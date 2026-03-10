/**
 * Public Blog – Serialized Types
 *
 * Explicitly defined interfaces for JSON-safe transport.
 * These serve as a security boundary and stable API contract for the frontend.
 */

// No imports needed - types are self-contained

// ============================================================
// Full Blog (detail page)
// ============================================================

/**
 * Full published blog post for the detail page (SSG/ISR).
 * Includes body and complete SEO metadata.
 */
export interface PublicBlog {
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
// Blog Card (listing pages)
// ============================================================

/**
 * Lightweight card for listing pages — no body, no _id.
 */
export interface PublicBlogCard {
    slug: string;
    title: string;
    description: string;
    coverImage: string | null;
    readingTime: number;
    publishedAt: string;
    tags: string[];
    featured: boolean;
}
