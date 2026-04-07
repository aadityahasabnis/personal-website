// =============================================================
// Table Filter Constants
// Note: Do NOT include "All" option - the filter component adds it automatically
// =============================================================

/**
 * Published status filter options for topics/articles
 * Filter component automatically adds "All Status" option
 */
export const PUBLISHED_FILTER_OPTIONS = [
    { label: 'Published', value: 'true' },
    { label: 'Draft', value: 'false' },
];

/**
 * Publish status filter options for articles (3-state status)
 * Filter component automatically adds "All Status" option
 */
export const PUBLISH_STATUS_FILTER_OPTIONS = [
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
    { label: 'Archived', value: 'archived' },
];

/**
 * Featured status filter options for topics/articles  
 * Filter component automatically adds "All" option
 */
export const FEATURED_FILTER_OPTIONS = [
    { label: 'Featured', value: 'true' },
    { label: 'Not Featured', value: 'false' },
];

/**
 * Default page size options for tables
 */
export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 15, 25, 50, 100];

/**
 * Default page sizes by table type
 */
export const DEFAULT_PAGE_SIZES = {
    topics: 15,
    articles: 15,
    subtopics: 15,
    contacts: 20,
    subscribers: 25,
    comments: 25,
};

// =============================================================
// Comment Filter Constants
// =============================================================

/**
 * Comment moderation status filter options
 * Filter component automatically adds "All" option
 */
export const COMMENT_STATUS_FILTER_OPTIONS = [
    { label: 'Approved', value: 'approved' },
    { label: 'Pending', value: 'pending' },
    { label: 'Owner', value: 'owner' },
    { label: 'Top-level', value: 'top-level' },
    { label: 'Replies', value: 'replies' },
];

/**
 * Comment content type filter options
 * Filter component automatically adds "All" option
 */
export const COMMENT_CONTENT_TYPE_FILTER_OPTIONS = [
    { label: 'Article', value: 'article' },
    { label: 'Blog', value: 'blog' },
    { label: 'Project', value: 'project' },
];

// =============================================================
// Newsletter Filter Constants
// =============================================================

/**
 * Newsletter status filter options
 * Filter component automatically adds "All" option
 */
export const NEWSLETTER_STATUS_FILTER_OPTIONS = [
    { label: 'Draft', value: 'draft' },
    { label: 'Sent', value: 'sent' },
];
