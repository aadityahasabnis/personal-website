/**
 * Admin Settings – Types
 *
 * Plain TypeScript interfaces for all settings mutations and documents
 * stored in MongoDB.
 *
 * Settings use a key-value pattern: each document in the `settings`
 * collection has { key: string, value: T, updatedAt: Date }.
 */

// ============================================================
// Input Types (for mutations)
// ============================================================

export type SiteSettingsInput = {
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
};

export type SeoSettingsInput = {
    twitterHandle?: string;
    ogImage?: string;
    keywords?: string[];
};

export type SocialSettingsInput = {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
};

export type ChangePasswordInput = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

// ============================================================
// Document & Response Interfaces
// ============================================================

/** Shape of a single document in the `settings` collection. */
export interface SettingDocument {
    key: string;
    value: unknown;
    updatedAt?: Date;
}

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
