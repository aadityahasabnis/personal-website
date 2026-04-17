import { type ContentType, type OpenGraphType, type ProjectStatusType, type PublishStatusType } from '@/constants/schemaConstants';
import { type ObjectId } from 'mongodb';
import type { IAudit, IDocument, ITimestamps } from './base';

// ============================================================
// SEO Metadata
// ============================================================

export interface ISeoMetadata {
    title: string | null;
    description: string | null;
    keywords: string[];
    ogImage: string | null;
    ogType: OpenGraphType | null;
    canonicalUrl: string | null;
    noIndex: boolean;
}

// ============================================================
// Content Base Interface
// ============================================================

interface IContentBase extends IDocument, ITimestamps, IAudit {
    type: ContentType;
    slug: string;
    title: string;
    description: string;
    body: string; // HTML content
    tags: string[];
    coverImage: string | null;
    readingTime: number; // Minutes
    publishStatus: PublishStatusType;
    published: boolean;
    publishedAt: Date | null;
    featured: boolean;
    seo: ISeoMetadata | null;
}

// ============================================================
// Article Interface
// ============================================================

export interface IArticle extends IContentBase {
    type: 'article';
    topicId: ObjectId; // Parent topic reference
    subtopicId: ObjectId | null; // Optional subtopic reference
    order: number; // Display order within topic/subtopic
}

// ============================================================
// Blog Interface
// ============================================================

export interface IBlog extends IContentBase {
    type: 'blog';
}

// ============================================================
// Project Interface
// ============================================================

export interface IProject extends IContentBase {
    type: 'project';
    techStack: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    demoVideo: string | null;
    gallery: string[];
    status: ProjectStatusType;
    startDate: Date | null;
    completedDate: Date | null;
    order: number;
}

// ============================================================
// Content Union Type
// ============================================================

export type IContent = IArticle | IBlog | IProject;

// ============================================================
// Type Guards
// ============================================================

export function isArticle(content: IContent): content is IArticle {
    return content.type === 'article';
}

export function isBlog(content: IContent): content is IBlog {
    return content.type === 'blog';
}

export function isProject(content: IContent): content is IProject {
    return content.type === 'project';
}
