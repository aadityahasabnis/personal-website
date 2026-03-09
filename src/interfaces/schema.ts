// Database Schema Interfaces
import { type ObjectId } from 'mongodb';


// ============================================================
// Base Types
// ============================================================

export interface IDocument {
    _id?: ObjectId;
}

export interface ITimestamps {
    createdAt: Date;
    updatedAt: Date;
}


// ============================================================
// Constants & Enums
// ============================================================

export const CONTENT_TYPES = {
    ARTICLE: 'article',
    BLOG: 'blog',
    PROJECT: 'project',
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

export const PROJECT_STATUS = {
    IN_PROGRESS: 'In Progress',       // Currently working on
    LIVE: 'Live',           // Project is live and accessible
    ARCHIVED: 'Archived',   // No longer maintained
} as const;

export type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

export const USER_ROLES = {
    ADMIN: 'admin',
    VIEWER: 'viewer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];


// ============================================================
// Topic & Subtopic
// ============================================================

// Collection: topics
// Indexes: slug (unique), order (asc)
export interface ITopic extends IDocument, ITimestamps {
    slug: string;
    title: string;
    description: string;
    coverImage: string | null;
    order: number;
    published: boolean;
    featured: boolean;
    contentCount: number; // Denormalized - count of published articles in this topic
}

// Collection: subtopics
// Indexes: topicSlug + slug (compound unique)
export interface ISubtopic extends IDocument, ITimestamps {
    topicSlug: string; // Parent topic reference
    slug: string;
    title: string;
    description: string | null;
    order: number;
    published: boolean;
    contentCount: number; // Denormalized - count of published articles in this subtopic
}


// ============================================================
// Shared Content Fields
// ============================================================

export interface ISeoMetadata {
    title: string | null;
    description: string | null;
    keywords: string[];
    ogImage: string | null;
    canonicalUrl: string | null; // For republished content
    noIndex: boolean; // Prevent search engine indexing
}

// Base interface - don't use directly
interface IContentBase extends IDocument, ITimestamps {
    type: ContentType;
    slug: string;
    title: string;
    description: string;
    body: string; // HTML stored
    tags: string[];
    coverImage: string | null;
    readingTime: number; // Minutes
    
    // Publishing
    published: boolean;
    publishedAt: Date | null;
    scheduledAt: Date | null;
    featured: boolean;
    
    // SEO
    seo: ISeoMetadata | null;
}


// ============================================================
// Content Types (Discriminated Union)
// ============================================================

// Collection: content
// Indexes: type + slug (unique), type + topicSlug + order
export interface IArticle extends IContentBase {
    type: 'article';
    topicSlug: string;
    subtopicSlug: string | null;
    order: number;
}

// Collection: content
// Indexes: type + publishedAt (desc)
export interface IBlog extends IContentBase {
    type: 'blog';
}

// Collection: content
// Indexes: type + status + order
export interface IProject extends IContentBase {
    type: 'project';
    techStack: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    demoVideo: string | null; // Demo video URL
    gallery: string[]; // Project screenshots
    status: ProjectStatus;
    startDate: Date | null; // When project started
    completedDate: Date | null; // When project finished
    order: number;
}

// Union of all content types
export type IContent = IArticle | IBlog | IProject;


// ============================================================
// Stats & Engagement
// ============================================================

/**
 * Page-level statistics (views, likes)
 * 
 * WHY SEPARATE FROM IContent?
 * 1. Performance: Stats are write-heavy (every view updates), content is read-heavy
 * 2. Atomic operations: Use $inc for counters without locking content document
 * 3. Caching: Cache static content separately from volatile stats
 * 4. Scaling: Can shard/optimize stats collection independently
 * 
 * Linked via: pageStats.slug === content.slug
 */

// Collection: pageStats
// Indexes: slug (unique)
export interface IPageStats extends IDocument, ITimestamps {
    slug: string; // References content.slug (any content type)
    views: number;
    likes: number;
    lastViewedAt: Date | null;
}


// ============================================================
// Comments
// ============================================================

/**
 * Comment system - FLAT ARCHITECTURE (Recommended)
 * 
 * WHY FLAT vs NESTED?
 * ❌ Nested (replies array): Document size limits, hard to paginate deep threads
 * ✅ Flat (parentId): Unlimited depth, flexible queries, scalable
 * 
 * LINKING:
 * - Top-level comment: parentId = null, contentSlug = content.slug
 * - Reply: parentId = commentId, contentSlug = content.slug (denormalized for queries)
 * 
 * Query patterns:
 *   // Get top-level comments
 *   db.comments.find({ contentSlug: slug, parentId: null, approved: true })
 *   
 *   // Get replies to a comment
 *   db.comments.find({ parentId: commentId, approved: true })
 */

// Collection: comments
// Indexes: contentSlug + parentId + createdAt (compound), approved + createdAt (desc)
export interface IComment extends IDocument, ITimestamps {
    contentSlug: string; // References content.slug
    parentId: ObjectId | null; // null = top-level, ObjectId = reply to comment
    
    author: {
        name: string;
        email: string;
        avatar: string | null; // Gravatar URL or uploaded avatar
        website: string | null; // Optional author website
        isOwner: boolean; // True for site owner
    };
    
    content: string; // Markdown supported
    upvotes: number;
    approved: boolean; // Moderation status
    
    replyCount: number; // Denormalized - count of approved replies
    ipHash: string | null; // Hashed IP for spam prevention
}


// ============================================================
// Newsletter & Users
// ============================================================

// Collection: subscribers
// Indexes: email (unique)
export interface ISubscriber extends IDocument, ITimestamps {
    email: string;
    name: string | null;
    confirmed: boolean;
    subscribedAt: Date;
    unsubscribedAt: Date | null;
}

// Collection: users
// Indexes: email (unique)
export interface IUser extends IDocument, ITimestamps {
    email: string;
    name: string;
    image: string | null;
    role: UserRole;
    passwordHash: string | null;
    lastLoginAt: Date | null;
}

// Collection: contacts
// Indexes: createdAt (desc), status (asc)
export interface IContact extends IDocument, ITimestamps {
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    ipHash: string | null;
}


// ============================================================
// Type Guards
// ============================================================

export function isArticle(content: IContent): content is IArticle {
    return content.type === CONTENT_TYPES.ARTICLE;
}

export function isBlog(content: IContent): content is IBlog {
    return content.type === CONTENT_TYPES.BLOG;
}

export function isProject(content: IContent): content is IProject {
    return content.type === CONTENT_TYPES.PROJECT;
}


// ============================================================
// Utility Types
// ============================================================

/**
 * Recursively serialize a type for JSON transport:
 *   - ObjectId  -> string
 *   - Date      -> string
 *   - null stays null, arrays & nested objects are walked recursively
 *
 * Usage:
 *   Serialized<IArticle>      — full article, JSON-safe
 *   Serialized<ISeoMetadata>  — SEO block, JSON-safe
 */
export type Serialized<T> =
    T extends ObjectId ? string :
    T extends Date ? string :
    T extends (infer U)[] ? Serialized<U>[] :
    T extends Record<string, unknown> ? { [K in keyof T]: Serialized<T[K]> } :
    T;

// Extract specific content type: ContentByType<'article'> => IArticle
export type ContentByType<T extends ContentType> = 
    T extends 'article' ? IArticle :
    T extends 'blog' ? IBlog :
    T extends 'project' ? IProject :
    never;

// Omit auto-generated fields for creation
export type CreateInput<T extends IDocument & ITimestamps> = Omit<
    T,
    '_id' | 'createdAt' | 'updatedAt'
>;

// Make all fields optional for updates
export type UpdateInput<T extends IDocument & ITimestamps> = Partial<
    Omit<T, '_id' | 'createdAt' | 'updatedAt'>
>;

// Convert ObjectId to string for JSON serialization
export type PublicContent<T extends IContent> = Omit<T, 'html'> & {
    _id: string;
};


// ============================================================
// Relationship Helpers (Cross-Collection Queries)
// ============================================================

/**
 * Content with related data (stats + comments)
 * Use this type when you fetch content with its engagement data
 * 
 * Example usage:
 *   const article = await getArticle(slug);
 *   const stats = await getPageStats(slug);
 *   const comments = await getComments(slug); // Top-level only
 *   
 *   const fullContent: ContentWithEngagement<IArticle> = {
 *     ...article,
 *     stats,
 *     comments
 *   };
 */
export type ContentWithEngagement<T extends IContent> = T & {
    stats: {
        views: number;
        likes: number;
        lastViewedAt: Date | null;
    };
    comments: {
        total: number; // Total top-level comments
        approved: number; // Approved top-level comments
        items: IComment[]; // Top-level comments (fetch replies separately)
    };
};

/**
 * Comment with nested replies (for UI rendering)
 * 
 * Example:
 *   const topLevelComments = await getTopLevelComments(slug);
 *   const commentsWithReplies: CommentWithReplies[] = await Promise.all(
 *     topLevelComments.map(async comment => ({
 *       ...comment,
 *       replies: await getReplies(comment._id)
 *     }))
 *   );
 */
export type CommentWithReplies = IComment & {
    replies: IComment[]; // Replies fetched separately
};