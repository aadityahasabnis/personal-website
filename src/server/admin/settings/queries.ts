/**
 * Settings Domain - Queries
 * 
 * Read-only operations for settings data.
 */

'use server';

import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ActionResponse } from '../utils/types';
import { success } from '../utils/response';
import { handleError } from '../utils/errorHandler';

import type {
    SettingDocument,
    SiteSettings,
    SeoSettings,
    SocialSettings,
    AllSettings,
} from './types';

// ===== HELPERS =====

const getSetting = async <T>(key: string): Promise<T | null> => {
    const collection = await getCollection<SettingDocument>(COLLECTIONS.settings);
    const doc = await collection.findOne({ key });
    return doc ? (doc.value as T) : null;
};

// ===== QUERIES =====

export async function getSiteSettings(): Promise<ActionResponse<SiteSettings | null>> {
    try {
        const settings = await getSetting<SiteSettings>('site');
        return success(settings);
    } catch (err) {
        return handleError(err, 'Failed to get site settings');
    }
}

export async function getSeoSettings(): Promise<ActionResponse<SeoSettings | null>> {
    try {
        const settings = await getSetting<SeoSettings>('seo');
        return success(settings);
    } catch (err) {
        return handleError(err, 'Failed to get SEO settings');
    }
}

export async function getSocialSettings(): Promise<ActionResponse<SocialSettings | null>> {
    try {
        const settings = await getSetting<SocialSettings>('social');
        return success(settings);
    } catch (err) {
        return handleError(err, 'Failed to get social settings');
    }
}

export async function getAllSettings(): Promise<ActionResponse<AllSettings>> {
    try {
        const [site, seo, social] = await Promise.all([
            getSetting<SiteSettings>('site'),
            getSetting<SeoSettings>('seo'),
            getSetting<SocialSettings>('social'),
        ]);

        return success({
            site,
            seo,
            social,
        });
    } catch (err) {
        return handleError(err, 'Failed to get settings');
    }
}
