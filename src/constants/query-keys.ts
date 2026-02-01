/**
 * Query Keys - Centralized query key management
 * 
 * Used with TanStack Query for:
 * - Consistent cache key naming
 * - Type-safe query invalidation
 * - Predictable cache behavior
 * 
 * Pattern: RESOURCE.ACTION or RESOURCE.BY_PARAM(param)
 */

export const QUERY_KEYS = {
    // ===== TOPICS =====
    TOPICS: {
        ALL: ['topics'] as const,
        FEATURED: ['topics', 'featured'] as const,
        BY_SLUG: (slug: string) => ['topics', slug] as const,
        WITH_CONTENT: (slug: string) => ['topics', slug, 'content'] as const,
    },

    // ===== SUBTOPICS =====
    SUBTOPICS: {
        ALL: ['subtopics'] as const,
        BY_TOPIC: (topicSlug: string) => ['subtopics', 'topic', topicSlug] as const,
        BY_SLUG: (topicSlug: string, slug: string) => ['subtopics', topicSlug, slug] as const,
    },

    // ===== ARTICLES =====
    ARTICLES: {
        ALL: ['articles'] as const,
        RECENT: (limit?: number) => ['articles', 'recent', limit ?? 10] as const,
        BY_TOPIC: (topicSlug: string) => ['articles', 'topic', topicSlug] as const,
        BY_SUBTOPIC: (topicSlug: string, subtopicSlug: string) => 
            ['articles', 'topic', topicSlug, 'subtopic', subtopicSlug] as const,
        BY_SLUG: (topicSlug: string, articleSlug: string) => 
            ['articles', topicSlug, articleSlug] as const,
        SIDEBAR: (topicSlug: string) => ['articles', topicSlug, 'sidebar'] as const,
    },

    // ===== NOTES =====
    NOTES: {
        ALL: ['notes'] as const,
        RECENT: (limit?: number) => ['notes', 'recent', limit ?? 10] as const,
        BY_SLUG: (slug: string) => ['notes', slug] as const,
    },

    // ===== PROJECTS =====
    PROJECTS: {
        ALL: ['projects'] as const,
        FEATURED: ['projects', 'featured'] as const,
        BY_SLUG: (slug: string) => ['projects', slug] as const,
    },

    // ===== STATS =====
    STATS: {
        ARTICLE: (slug: string) => ['stats', 'article', slug] as const,
        page: (slug: string) => ['stats', 'page', slug] as const,
        PAGE: (slug: string) => ['stats', 'page', slug] as const,
        VIEWS: (slug: string) => ['stats', 'views', slug] as const,
        LIKES: (slug: string) => ['stats', 'likes', slug] as const,
    },

    // ===== COMMENTS =====
    COMMENTS: {
        BY_ARTICLE: (slug: string) => ['comments', 'article', slug] as const,
        BY_ID: (commentId: string) => ['comments', commentId] as const,
        list: (slug: string, limit?: number, offset?: number) => 
            ['comments', 'article', slug, { limit, offset }] as const,
    },

    // ===== SUBSCRIBERS =====
    SUBSCRIBERS: {
        ALL: ['subscribers'] as const,
        BY_EMAIL: (email: string) => ['subscribers', email] as const,
    },
} as const;

// ===== TYPE HELPERS =====

type QueryKeyArray = readonly (string | number | undefined)[];

/**
 * Helper to create typed query key arrays
 */
export function createQueryKey<T extends QueryKeyArray>(...keys: T): T {
    return keys;
}

/**
 * Helper to check if a query key starts with a prefix
 */
export function queryKeyStartsWith(
    key: QueryKeyArray, 
    prefix: QueryKeyArray
): boolean {
    if (key.length < prefix.length) return false;
    return prefix.every((p, i) => key[i] === p);
}
