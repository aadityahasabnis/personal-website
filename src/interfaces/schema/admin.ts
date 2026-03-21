import type { IDocument, ITimestamps } from './base';

// ============================================================
// Admin Interface
// ============================================================

export interface IAdmin extends IDocument, ITimestamps {
    email: string;
    name: string;
    image: string | null;
    recoveryEmail: string | null;
    passwordHash: string | null;
    lastLoginAt: Date | null;
}
