/**
 * Admin Article – Input Types
 *
 * Derived from schema.ts interfaces using Pick/Omit/Partial.
 * No Zod — validation is handled at the action level.
 */

import type { IArticle, ISeoMetadata } from '@/interfaces/schema';

// ============================================================
// Create Input
// ============================================================

/**
 * Fields the client provides when creating an article.
 * Auto-generated fields (_id, timestamps, published state) are excluded.
 */
export type ArticleCreateInput = {
    slug: string;
    title: string;
    description: string;
    body: string;
    topicSlug: string;
    subtopicSlug?: string | null;
    tags?: string[];
    coverImage?: string | null;
    readingTime?: number;
    order?: number;
    seo?: Partial<ISeoMetadata> | null;
};

// ============================================================
// Update Input
// ============================================================

/**
 * All user-editable fields are optional for partial updates.
 */
export type ArticleUpdateInput = Partial<
    Pick<
        IArticle,
        | 'slug'
        | 'title'
        | 'description'
        | 'body'
        | 'topicSlug'
        | 'subtopicSlug'
        | 'tags'
        | 'coverImage'
        | 'readingTime'
        | 'order'
    >
> & {
    seo?: Partial<ISeoMetadata> | null;
};
