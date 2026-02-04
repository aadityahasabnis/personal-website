import { type ObjectId } from 'mongodb';

// ===== TOPIC TYPES =====

export interface ITopic {
    _id?: ObjectId;
    slug: string;                    // "dsa", "web-development"
    title: string;                   // "Data Structures & Algorithms"
    description: string;
    icon?: string;                   // Lucide icon name
    coverImage?: string;
    order: number;                   // Display order
    published: boolean;
    featured: boolean;
    metadata: {
        articleCount: number;        // Denormalized for performance
        lastUpdated?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface ISubtopic {
    _id?: ObjectId;
    topicSlug: string;               // Parent topic reference
    slug: string;                    // "dsa-fundamentals"
    title: string;                   // "DSA Fundamentals"
    description?: string;
    order: number;                   // Order within topic
    published: boolean;
    metadata: {
        articleCount: number;        // Denormalized
    };
    createdAt: Date;
    updatedAt: Date;
}

// ===== TABLE OF CONTENTS =====

export interface IHeading {
    id: string;
    text: string;
    level: number;
}

// ===== CONTENT TYPES =====

export interface IContent {
    _id?: ObjectId;
    type: 'article' | 'series' | 'note' | 'log' | 'page';
    slug: string;
    title: string;
    description: string;
    
    // Markdown content
    body: string;
    
    // Pre-rendered HTML for SSR/SEO (generated from body)
    html?: string;
    
    tags?: string[];
    coverImage?: string;
    published: boolean;
    publishedAt?: Date;
    featured?: boolean;
    readingTime?: number;            // Estimated reading time in minutes
    seriesSlug?: string;
    seriesOrder?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IArticle extends IContent {
    type: 'article';
    topicSlug: string;               // "dsa"
    subtopicSlug?: string;           // "dsa-fundamentals" (optional)
    order: number;                   // Order within subtopic
    readingTime?: number;
    tableOfContents?: IHeading[];    // Pre-generated TOC
    seo?: {
        title?: string;
        description?: string;
        keywords?: string[];
        ogImage?: string;
    };
}

export interface INote extends IContent {
    type: 'note';
}

export interface ISeries extends IContent {
    type: 'series';
    articles?: string[];
}

// ===== PROJECT TYPES =====

export interface IProject {
    _id?: ObjectId;
    slug: string;
    title: string;
    description: string;
    longDescription?: string;
    coverImage?: string;     // Primary image for cards and detail pages
    tags: string[];
    techStack?: string[];    // Tech stack badges
    githubUrl?: string;      // Repository URL (standardized)
    liveUrl?: string;        // Live demo URL (standardized)
    featured: boolean;
    status: 'active' | 'archived' | 'wip';
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

// ===== STATS TYPES =====

export interface IPageStats {
    _id?: ObjectId;
    slug: string;
    views: number;
    likes: number;
    lastViewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IArticleStats {
    _id?: ObjectId;
    slug: string;                    // Full path: "dsa/logic-building-problems"
    views: number;
    likes: number;
    shares?: number;
    lastViewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ===== COMMENT TYPES =====

export interface ICommentAuthor {
    name: string;
    email: string;
    avatar?: string;
    isAuthor?: boolean;             // True for site owner replies
}

export interface ICommentReply {
    _id?: ObjectId;
    author: ICommentAuthor;
    content: string;
    upvotes: number;                 // Standardized field name
    createdAt: Date;
}

export interface IComment {
    _id?: ObjectId;
    articleSlug: string;             // Full path: "dsa/logic-building-problems"
    author: ICommentAuthor;
    content: string;
    replies?: ICommentReply[];
    upvotes: number;                 // Standardized field name (removed likes)
    reported?: boolean;
    approved: boolean;               // Moderation flag
    createdAt: Date;
    updatedAt: Date;
}

// ===== USER TYPES =====

export interface IUser {
    _id?: ObjectId;
    email: string;
    name: string;
    image?: string;
    role: 'admin' | 'editor';
    createdAt: Date;
    updatedAt: Date;
}

// ===== SUBSCRIBER TYPES =====

export interface ISubscriber {
    _id?: ObjectId;
    email: string;
    name?: string;
    confirmed: boolean;
    subscribedAt: Date;
    unsubscribedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

// ===== MEDIA TYPES =====

export interface IMedia {
    _id?: ObjectId;
    filename: string;
    url: string;
    publicId: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    alt?: string;
    uploadedBy: ObjectId;
    createdAt: Date;
}

// ===== API RESPONSE TYPES =====

export interface IApiResponse<T = unknown> {
    success: boolean;
    status: number;
    data?: T;
    metadata?: {
        count?: number;
        id?: string;
    };
    message?: string;
    error?: string;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
    metadata: {
        count: number;
        offset: number;
        limit: number;
        hasMore: boolean;
    };
}

// ===== FORM DATA TYPE =====

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IFormData<T = Record<string, any>> = T;
