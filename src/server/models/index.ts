// ============================================================
// Database Models - Central Export
// ============================================================

export { default as Topic } from './Topic';
export { default as Subtopic } from './Subtopic';
export { default as Content } from './Content';
export { default as PageStats } from './PageStats';
export { default as Comment } from './Comment';
export { default as Subscriber } from './Subscriber';
export { default as User } from './User';
export { default as Contact } from './Contact';

// Re-export types for convenience
export type {
    ITopic,
    ISubtopic,
    IContent,
    IArticle,
    IBlog,
    IProject,
    IPageStats,
    IComment,
    ISubscriber,
    IUser,
    IContact,
    ISeoMetadata,
    ContentType,
    ProjectStatus,
    UserRole,
} from '@/interfaces/schema';

export {
    CONTENT_TYPES,
    PROJECT_STATUS,
    USER_ROLES,
    isArticle,
    isBlog,
    isProject,
} from '@/interfaces/schema';
