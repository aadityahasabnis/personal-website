import { type ObjectId } from 'mongodb';

// ===== CONTENT TYPES =====

export interface IContent {
    _id?: ObjectId;
    type: 'article' | 'series' | 'note' | 'log' | 'page';
    slug: string;
    title: string;
    description: string;
    body: string;
    html?: string;
    tags?: string[];
    coverImage?: string;
    published: boolean;
    publishedAt?: Date;
    featured?: boolean;
    readingTime?: number;    // Estimated reading time in minutes
    seriesSlug?: string;
    seriesOrder?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IArticle extends IContent {
    type: 'article';
    readingTime?: number;
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
    coverImage?: string;
    image?: string;          // Alternative image field for cards
    tags: string[];
    techStack?: string[];    // Tech stack badges
    github?: string;
    repoUrl?: string;        // Alternative for github
    live?: string;
    liveUrl?: string;        // Alternative for live
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
