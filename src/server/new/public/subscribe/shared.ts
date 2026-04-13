import { VALIDATION_PATTERNS } from '@/constants/schemaConstants';

export const normalizeSubscriberEmail = (value: string): string => value.trim().toLowerCase();

export const isValidSubscriberEmail = (email: string): boolean => VALIDATION_PATTERNS.EMAIL.test(email);

const MAX_SUBSCRIBER_NAME_LENGTH = 80;

export const normalizeSubscriberName = (value: string | null | undefined): string | null => {
    const normalized = value?.trim().replace(/\s+/g, ' ');
    if (!normalized) return null;
    return normalized.slice(0, MAX_SUBSCRIBER_NAME_LENGTH);
};
