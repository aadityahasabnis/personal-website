/**
 * Public Blog – Serialized Types
 *
 * Derived from schema.ts using Pick + Serialized<T>.
 * These serve as a security boundary and stable API contract.
 */

import type {
    IBlog,
    ISeoMetadata,
    Serialized,
} from '@/interfaces/schema';

// ============================================================
// Full Blog (detail page)
// ============================================================

/**
 * Full published blog post for the detail page (SSG/ISR).
 * Includes body and complete SEO metadata.
 */
export type PublicBlog = Pick<
    Serialized<IBlog>,
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
> & {
    seo: Serialized<ISeoMetadata>;
};

// ============================================================
// Blog Card (listing pages)
// ============================================================

/**
 * Lightweight card for listing pages — no body, no _id.
 */
export type PublicBlogCard = Pick<
    Serialized<IBlog>,
    | 'slug'
    | 'title'
    | 'description'
    | 'coverImage'
    | 'readingTime'
    | 'publishedAt'
    | 'tags'
    | 'featured'
>;
