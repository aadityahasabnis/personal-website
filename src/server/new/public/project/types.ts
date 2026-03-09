/**
 * Public Project – Serialized Types
 *
 * Derived from schema.ts using Pick + Serialized<T>.
 * These serve as a security boundary and stable API contract.
 */

import type {
    IProject,
    ISeoMetadata,
    Serialized,
} from '@/interfaces/schema';

// ============================================================
// Full Project (detail page)
// ============================================================

/**
 * Full published project for the detail page (SSG/ISR).
 * Includes body, gallery, and complete SEO metadata.
 */
export type PublicProject = Pick<
    Serialized<IProject>,
    | '_id'
    | 'slug'
    | 'title'
    | 'description'
    | 'body'
    | 'tags'
    | 'coverImage'
    | 'publishedAt'
    | 'updatedAt'
    | 'featured'
    | 'techStack'
    | 'githubUrl'
    | 'liveUrl'
    | 'demoVideo'
    | 'gallery'
    | 'status'
    | 'startDate'
    | 'completedDate'
    | 'order'
> & {
    seo: Serialized<ISeoMetadata>;
};

// ============================================================
// Project Card (listing pages)
// ============================================================

/**
 * Lightweight card for listing pages — no body, no gallery.
 */
export type PublicProjectCard = Pick<
    Serialized<IProject>,
    | 'slug'
    | 'title'
    | 'description'
    | 'coverImage'
    | 'tags'
    | 'techStack'
    | 'githubUrl'
    | 'liveUrl'
    | 'status'
    | 'featured'
    | 'order'
>;
