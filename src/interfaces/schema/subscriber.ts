import type { IDocument, ITimestamps } from './base';

// ============================================================
// Subscriber Interface
// ============================================================

export interface ISubscriber extends IDocument, ITimestamps {
    email: string;
    confirmed: boolean;
    subscribedAt: Date;
    unsubscribedAt: Date | null;
}
