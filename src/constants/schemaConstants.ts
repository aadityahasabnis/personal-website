/**
 * Schema Constants & Enums
 * 
 * All database schema-related constants, enums, and their derived types.
 * Centralized for consistency across models, queries, and validation.
 */

// ============================================================
// Content Types
// ============================================================

export const CONTENT_TYPES = {
    ARTICLE: 'article',
    BLOG: 'blog',
    PROJECT: 'project',
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

// ============================================================
// Project Status
// ============================================================

export const PROJECT_STATUS = {
    IN_PROGRESS: 'In Progress',
    LIVE: 'Live',
    ARCHIVED: 'Archived',
} as const;

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

// Array of all project statuses for validation/UI
export const PROJECT_STATUS_OPTIONS = Object.values(PROJECT_STATUS);

// ============================================================
// User Roles & Permissions
// ============================================================

export const USER_ROLES = {
    ADMIN: 'admin',
    VIEWER: 'viewer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// ============================================================
// Contact Message Status
// ============================================================

export const CONTACT_STATUS = {
    NEW: 'new',
    READ: 'read',
    REPLIED: 'replied',
    ARCHIVED: 'archived',
} as const;

export type ContactStatus = typeof CONTACT_STATUS[keyof typeof CONTACT_STATUS];

// Status flow for UI (order matters)
export const CONTACT_STATUS_FLOW = [
    CONTACT_STATUS.NEW,
    CONTACT_STATUS.READ,
    CONTACT_STATUS.REPLIED,
    CONTACT_STATUS.ARCHIVED,
] as const;

// ============================================================
// Comment Moderation Status
// ============================================================

export const COMMENT_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    SPAM: 'spam',
    REJECTED: 'rejected',
} as const;

export type CommentStatus = typeof COMMENT_STATUS[keyof typeof COMMENT_STATUS];

// ============================================================
// Subscriber Status
// ============================================================

export const SUBSCRIBER_STATUS = {
    PENDING: 'pending',       // Email sent, awaiting confirmation
    ACTIVE: 'active',         // Confirmed and subscribed
    UNSUBSCRIBED: 'unsubscribed', // User unsubscribed
} as const;

export type SubscriberStatus = typeof SUBSCRIBER_STATUS[keyof typeof SUBSCRIBER_STATUS];

// ============================================================
// Content Visibility & Publishing
// ============================================================

export const PUBLISH_STATUS = {
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
} as const;

export type PublishStatus = typeof PUBLISH_STATUS[keyof typeof PUBLISH_STATUS];

// ============================================================
// Defaults & Limits
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
    COMMENT_MAX_DEPTH: 5, // Max nesting level for replies
    
    // Contact
    CONTACT_NAME_MAX_LENGTH: 100,
    CONTACT_SUBJECT_MAX_LENGTH: 200,
    CONTACT_MESSAGE_MAX_LENGTH: 5000,
    
    // Projects
    PROJECT_TECH_MAX_COUNT: 20,
    PROJECT_GALLERY_MAX_COUNT: 10,
    
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
