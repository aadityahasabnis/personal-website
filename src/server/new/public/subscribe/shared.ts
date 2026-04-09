import { VALIDATION_PATTERNS } from '@/constants/schemaConstants';

export const normalizeSubscriberEmail = (value: string): string => value.trim().toLowerCase();

export const isValidSubscriberEmail = (email: string): boolean => VALIDATION_PATTERNS.EMAIL.test(email);
