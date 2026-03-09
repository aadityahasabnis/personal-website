'use server';

/**
 * Admin Settings – Queries
 *
 * Read-only operations for retrieving site configuration.
 * Uses the new IApiResponse<T> pattern and centralized helpers.
 */

import type { IApiResponse } from '@/interfaces/IApiResponse';
import { COLLECTIONS } from '@/constants/siteConstants';
import { getCollection } from '@/lib/db/connect';

import { ok, handleError } from '../../utils';

import type {
    SettingDocument,
    SiteSettings,
    SeoSettings,
    SocialSettings,
    AllSettings,
} from './types';

// ============================================================
// Helpers
// ============================================================

/**
 * Fetch a single settings document by key.
 * Returns null if the key has never been set.
 */
async function getSetting<T>(key: string): Promise<T | null> {
    const collection = await getCollection<SettingDocument>(COLLECTIONS.settings);
    const doc = await collection.findOne({ key });
    return doc ? (doc.value as T) : null;
}

// ============================================================
// Queries
// ============================================================

export async function getSiteSettings(): Promise<IApiResponse<SiteSettings | null>> {
    try {
        const settings = await getSetting<SiteSettings>('site');
        return ok(settings);
    } catch (err) {
        return handleError(err, 'Failed to get site settings');
    }
}

export async function getSeoSettings(): Promise<IApiResponse<SeoSettings | null>> {
    try {
        const settings = await getSetting<SeoSettings>('seo');
        return ok(settings);
    } catch (err) {
        return handleError(err, 'Failed to get SEO settings');
    }
}

export async function getSocialSettings(): Promise<IApiResponse<SocialSettings | null>> {
    try {
        const settings = await getSetting<SocialSettings>('social');
        return ok(settings);
    } catch (err) {
        return handleError(err, 'Failed to get social settings');
    }
}

export async function getAllSettings(): Promise<IApiResponse<AllSettings>> {
    try {
        const [site, seo, social] = await Promise.all([
            getSetting<SiteSettings>('site'),
            getSetting<SeoSettings>('seo'),
            getSetting<SocialSettings>('social'),
        ]);

        return ok({ site, seo, social });
    } catch (err) {
        return handleError(err, 'Failed to get settings');
    }
}
