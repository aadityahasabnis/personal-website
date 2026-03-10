import { type ObjectId } from 'mongodb';
import type { IDocument, ITimestamps } from './base';

// ============================================================
// Topic Interface
// ============================================================

export interface ITopic extends IDocument, ITimestamps {
    slug: string; // Unique identifier for URL
    title: string;
    description: string;
    coverImage: string | null;
    order: number; // Display order
    published: boolean;
    featured: boolean; // Highlight on homepage
    contentCount: number; // Denormalized count of published articles
}
