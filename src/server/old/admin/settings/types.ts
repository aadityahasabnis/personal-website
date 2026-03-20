/**
 * Settings Domain - Types
 * 
 * TypeScript interfaces for settings management.
 */

import { z } from 'zod';

// ===== VALIDATION SCHEMAS =====

export const siteSettingsSchema = z.object({
    name: z.string().min(1, 'Site name is required'),
    title: z.string().min(1, 'Site title is required'),
    description: z.string().min(1, 'Description is required'),
    url: z.string().url('Must be a valid URL'),
    email: z.string().email('Must be a valid email'),
    author: z.object({
        name: z.string().min(1, 'Author name is required'),
        email: z.string().email('Must be a valid email'),
        bio: z.string().optional(),
    }),
});

export const seoSettingsSchema = z.object({
    twitterHandle: z.string().optional(),
    ogImage: z.string().optional(),
    keywords: z.array(z.string()).optional(),
});

export const socialSettingsSchema = z.object({
    github: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    email: z.string().email().optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

// ===== INFERRED TYPES =====

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type SeoSettingsInput = z.infer<typeof seoSettingsSchema>;
export type SocialSettingsInput = z.infer<typeof socialSettingsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ===== SETTING DOCUMENT TYPE =====

export interface SettingDocument {
    key: string;
    value: unknown;
    updatedAt?: Date;
}

// ===== RESPONSE TYPES =====

export interface SiteSettings {
    name: string;
    title: string;
    description: string;
    url: string;
    email: string;
    author: {
        name: string;
        email: string;
        bio?: string;
    };
}

export interface SeoSettings {
    twitterHandle?: string;
    ogImage?: string;
    keywords?: string[];
}

export interface SocialSettings {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
}

export interface AllSettings {
    site: SiteSettings | null;
    seo: SeoSettings | null;
    social: SocialSettings | null;
}
