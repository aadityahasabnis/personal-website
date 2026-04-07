import type { ContactStatusType } from '@/constants/schemaConstants';

// ========================================================
// Public Contact Types
// ========================================================

export interface ISubmitPublicContactInput {
    name: string;
    email: string;
    subject: string;
    message: string;
    ipAddress?: string | null;
}

export interface IPublicContactSubmission {
    id: string;
    status: ContactStatusType;
    createdAt: string;
}
