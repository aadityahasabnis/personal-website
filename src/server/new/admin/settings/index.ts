/**
 * Admin Settings – Barrel Export
 */

// Mutations
export {
    updateSiteSettings,
    updateSeoSettings,
    updateSocialSettings,
    changePassword,
} from './actions';

// Queries
export {
    getSiteSettings,
    getSeoSettings,
    getSocialSettings,
    getAllSettings,
} from './queries';

// Types
export type {
    SiteSettingsInput,
    SeoSettingsInput,
    SocialSettingsInput,
    ChangePasswordInput,
    SiteSettings,
    SeoSettings,
    SocialSettings,
    AllSettings,
    SettingDocument,
} from './types';
