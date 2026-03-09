/**
 * Admin Blog – Input Types
 *
 * Derived from schema.ts interfaces using Pick/Omit/Partial.
 * No Zod — validation is handled at the action level.
 */

import type { IBlog, ISeoMetadata } from '@/interfaces/schema';

// ============================================================
// Create Input
// ============================================================

/**
 * Fields the client provides when creating a blog post.
 * Auto-generated fields (_id, timestamps, published state) are excluded.
 */
export type BlogCreateInput = {
    slug: string;
    title: string;
    description: string;
    body: string;
    tags?: string[];
    coverImage?: string | null;
    readingTime?: number;
    seo?: Partial<ISeoMetadata> | null;
};

// ============================================================
// Update Input
// ============================================================

/**
 * All user-editable fields are optional for partial updates.
 */
export type BlogUpdateInput = Partial<
    Pick<
        IBlog,
        | 'slug'
        | 'title'
        | 'description'
        | 'body'
        | 'tags'
        | 'coverImage'
        | 'readingTime'
    >
> & {
    seo?: Partial<ISeoMetadata> | null;
};
