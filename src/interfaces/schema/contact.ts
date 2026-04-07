import { type ContactStatusType } from '@/constants/schemaConstants';
import type { IDocument, ITimestamps } from './base';

// ============================================================
// Contact Interface
// ============================================================

export interface IContact extends IDocument, ITimestamps {
    name: string;
    email: string;
    subject: string;
    message: string;
    status: ContactStatusType;
    ipHash: string | null;
}
