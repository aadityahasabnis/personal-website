/**
 * Constants Index
 * 
 * Central export point for all application constants.
 * Import from here for convenience or from specific files for tree-shaking.
 */

// Schema Constants
export {
    CONTENT_TYPES,
    PROJECT_STATUS,
    USER_ROLES,
    CONTACT_STATUS,
    COMMENT_STATUS,
    SUBSCRIBER_STATUS,
    PUBLISH_STATUS,
    SCHEMA_LIMITS,
    VALIDATION_PATTERNS,
    CONTACT_STATUS_FLOW,
    PROJECT_STATUS_OPTIONS
} from './schemaConstants';

export type {
    ContentType,
    ProjectStatus,
    UserRole,
    ContactStatus,
    CommentStatus,
    SubscriberStatus,
    PublishStatus,
} from './schemaConstants';

// Site Constants
export {
    SITE_CONFIG,
    NAV_LINKS,
    FOOTER_LINKS,
    SOCIAL_LINKS,
} from './siteConstants';

export type {
    INavLink,
} from './siteConstants';
