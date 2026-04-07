import { type ObjectId } from 'mongodb';
import type { IDocument, ITimestamps } from './base';

// ============================================================
// Subtopic Interface
// ============================================================

export interface ISubtopic extends IDocument, ITimestamps {
    topicId: ObjectId; // Parent topic reference
    slug: string; // Unique within topic
    title: string;
    description: string | null;
    order: number; // Display order within topic
    published: boolean;
    contentCount: number; // Denormalized count of published articles
}
