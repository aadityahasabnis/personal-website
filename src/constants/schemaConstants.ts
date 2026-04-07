// ============================================================
// Content Types
// ============================================================

export const CONTENT_TYPES = { ARTICLE: 'article', BLOG: 'blog', PROJECT: 'project' } as const;
export type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];

export type PublicReadContentType = Extract<ContentType, 'article' | 'blog' | 'project'>;
export const PUBLIC_READ_CONTENT_TYPE_VALUES: readonly PublicReadContentType[] = [
  CONTENT_TYPES.ARTICLE,
  CONTENT_TYPES.BLOG,
  CONTENT_TYPES.PROJECT,
];

export const CONTENT_ROUTE_SEGMENTS = {
  ARTICLE: 'articles',
  BLOG: 'blogs',
  PROJECT: 'projects',
} as const;
export type PublicReadContentRouteSegment =
  (typeof CONTENT_ROUTE_SEGMENTS)[keyof typeof CONTENT_ROUTE_SEGMENTS];

export const CONTENT_TYPE_TO_ROUTE_SEGMENT: Record<PublicReadContentType, PublicReadContentRouteSegment> = {
  [CONTENT_TYPES.ARTICLE]: CONTENT_ROUTE_SEGMENTS.ARTICLE,
  [CONTENT_TYPES.BLOG]: CONTENT_ROUTE_SEGMENTS.BLOG,
  [CONTENT_TYPES.PROJECT]: CONTENT_ROUTE_SEGMENTS.PROJECT,
};

// ============================================================
// Project Status
// ============================================================

export const PROJECT_STATUS = { IN_PROGRESS: 'In Progress', LIVE: 'Live', ARCHIVED: 'Archived' } as const;
export type ProjectStatusType = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];
export const PROJECT_STATUS_OPTIONS = Object.values(PROJECT_STATUS);

// ============================================================
// Contact Message Status
// ============================================================

export const CONTACT_STATUS = { NEW: 'new', READ: 'read', REPLIED: 'replied', ARCHIVED: 'archived' } as const;
export type ContactStatusType = (typeof CONTACT_STATUS)[keyof typeof CONTACT_STATUS];

// ============================================================
// Comment Moderation Status
// ============================================================

export const COMMENT_STATUS = { APPROVED: 'approved', REJECTED: 'rejected' } as const;
export type CommentStatusType = (typeof COMMENT_STATUS)[keyof typeof COMMENT_STATUS];

// ============================================================
// Subscriber Status
// ============================================================

export const SUBSCRIBER_STATUS = { ACTIVE: 'active', UNSUBSCRIBED: 'unsubscribed' } as const;
export type SubscriberStatusType = (typeof SUBSCRIBER_STATUS)[keyof typeof SUBSCRIBER_STATUS];

// ============================================================
// Content Visibility & Publishing
// ============================================================

export const PUBLISH_STATUS = { DRAFT: 'draft', PUBLISHED: 'published', ARCHIVED: 'archived' } as const;
export type PublishStatusType = (typeof PUBLISH_STATUS)[keyof typeof PUBLISH_STATUS];

// ============================================================
// Schema Limits
// ============================================================

export const SCHEMA_LIMITS = {
  // Content
  TITLE_MIN_LENGTH: 2,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 500,
  SLUG_MAX_LENGTH: 100,
  TAGS_MAX_COUNT: 10,
  TAG_MAX_LENGTH: 30,

  // SEO
  SEO_TITLE_MAX_LENGTH: 70,
  SEO_DESCRIPTION_MAX_LENGTH: 160,
  SEO_KEYWORDS_MAX_COUNT: 15,

  // Comments
  COMMENT_MIN_LENGTH: 2,
  COMMENT_MAX_LENGTH: 2000,
  AUTHOR_NAME_MAX_LENGTH: 100,
  COMMENT_MAX_DEPTH: 5,

  // Contact
  CONTACT_NAME_MAX_LENGTH: 100,
  CONTACT_SUBJECT_MAX_LENGTH: 200,
  CONTACT_MESSAGE_MAX_LENGTH: 5000,

  // Projects
  PROJECT_TECH_MAX_COUNT: 20,
  PROJECT_GALLERY_MAX_COUNT: 10,

  // Newsletter
  NEWSLETTER_SUBJECT_MIN_LENGTH: 2,
  NEWSLETTER_SUBJECT_MAX_LENGTH: 200,
  NEWSLETTER_PREVIEW_TEXT_MAX_LENGTH: 150,

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// ============================================================
// Validation Patterns
// ============================================================

export const VALIDATION_PATTERNS = {
  SLUG: /^[a-z0-9-]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  GITHUB_URL: /^https:\/\/github\.com\/.+/,
} as const;
