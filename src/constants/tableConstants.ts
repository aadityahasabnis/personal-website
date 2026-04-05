// =============================================================
// Table Constants
// =============================================================

/**
 * Boolean filter options for published/featured/active states
 */
export const BOOLEAN_FILTER_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' },
];

/**
 * Published status filter options for topics/articles
 */
export const PUBLISHED_FILTER_OPTIONS = [
    { label: 'All Status', value: 'all' },
    { label: 'Published', value: 'true' },
    { label: 'Draft', value: 'false' },
];

/**
 * Featured status filter options for topics/articles
 */
export const FEATURED_FILTER_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Featured', value: 'true' },
    { label: 'Not Featured', value: 'false' },
];

/**
 * Default page size options for tables
 */
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 15, 25, 50, 100];

/**
 * Default page sizes by table type
 */
export const DEFAULT_PAGE_SIZES = {
    topics: 15,
    articles: 15,
    subtopics: 15,
    contacts: 20,
    subscribers: 25,
};
