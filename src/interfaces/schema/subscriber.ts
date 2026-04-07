import type { IDocument, ITimestamps } from './base';

// ============================================================
// Subscriber Interface
// ============================================================

export interface ISubscriber extends IDocument, ITimestamps {
    email: string;
    name: string | null;
    confirmed: boolean;
    subscribedAt: Date;
    unsubscribedAt: Date | null;
}
