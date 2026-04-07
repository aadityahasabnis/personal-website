import { SCHEMA_LIMITS, VALIDATION_PATTERNS } from '@/constants/schemaConstants';

interface INameValidationResult {
    name: string | null;
    errorMessage?: string;
}

const SUBSCRIBER_NAME_MAX = SCHEMA_LIMITS.CONTACT_NAME_MAX_LENGTH;

export const normalizeSubscriberEmail = (value: string): string => value.trim().toLowerCase();

export const isValidSubscriberEmail = (email: string): boolean => VALIDATION_PATTERNS.EMAIL.test(email);

export const validateSubscriberName = (value: string | null | undefined): INameValidationResult => {
    if (typeof value !== 'string') return { name: null };

    const name = value.trim();
    if (!name) return { name: null };

    if (name.length < 2) {
        return { name: null, errorMessage: 'Name must be at least 2 characters' };
    }

    if (name.length > SUBSCRIBER_NAME_MAX) {
        return {
            name: null,
            errorMessage: `Name cannot exceed ${String(SUBSCRIBER_NAME_MAX)} characters`,
        };
    }

    return { name };
};