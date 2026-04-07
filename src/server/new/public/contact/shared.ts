import { SCHEMA_LIMITS, VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import { createHash } from 'crypto';

// ========================================================
// Public Contact Shared Helpers
// ========================================================

export const normalizeContactName = (name: string): string => name.trim();

export const normalizeContactEmail = (email: string): string => email.trim().toLowerCase();

export const normalizeContactSubject = (subject: string): string => subject.trim();

export const normalizeContactMessage = (message: string): string => message.trim();

export const validateContactName = (name: string): string | null => {
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (name.length > SCHEMA_LIMITS.CONTACT_NAME_MAX_LENGTH) {
        return `Name cannot exceed ${String(SCHEMA_LIMITS.CONTACT_NAME_MAX_LENGTH)} characters`;
    }
    return null;
};

export const validateContactEmail = (email: string): string | null => {
    if (!VALIDATION_PATTERNS.EMAIL.test(email)) return 'Please provide a valid email address';
    return null;
};

export const validateContactSubject = (subject: string): string | null => {
    if (subject.length < 5) return 'Subject must be at least 5 characters';
    if (subject.length > SCHEMA_LIMITS.CONTACT_SUBJECT_MAX_LENGTH) {
        return `Subject cannot exceed ${String(SCHEMA_LIMITS.CONTACT_SUBJECT_MAX_LENGTH)} characters`;
    }
    return null;
};

export const validateContactMessage = (message: string): string | null => {
    if (message.length < 10) return 'Message must be at least 10 characters';
    if (message.length > SCHEMA_LIMITS.CONTACT_MESSAGE_MAX_LENGTH) {
        return `Message cannot exceed ${String(SCHEMA_LIMITS.CONTACT_MESSAGE_MAX_LENGTH)} characters`;
    }
    return null;
};

export const hashContactIp = (ipAddress: string): string =>
    createHash('sha256').update(ipAddress).digest('hex');
