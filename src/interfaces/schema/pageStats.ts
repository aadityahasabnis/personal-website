import { type ObjectId } from 'mongodb';
import type { IDocument, ITimestamps } from './base';

// ============================================================
// Page Statistics Interface
// ============================================================

export interface IPageStats extends IDocument, ITimestamps {
    contentId: ObjectId; // References Content._id
    views: number;
    likes: number;
    lastViewedAt: Date | null;
}
