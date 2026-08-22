import { SITE_CONFIG } from '@/constants/siteConstants';
import { env } from '@/env';

const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i;

export const getPublicSiteUrl = (): string => {
    const configuredUrl = env.NEXTAUTH_URL.trim().replace(/\/$/, '');

    if (configuredUrl && !LOCAL_ORIGIN_PATTERN.test(configuredUrl)) {
        try {
            const parsedUrl = new URL(configuredUrl);
            if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
                return parsedUrl.origin;
            }
        } catch {
            return SITE_CONFIG.url;
        }
    }

    return SITE_CONFIG.url;
};