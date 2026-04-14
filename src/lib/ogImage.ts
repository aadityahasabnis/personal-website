import { SITE_CONFIG } from '@/constants/siteConstants';

interface IBuildOgImageOptions {
    title: string;
    subtitle?: string;
    eyebrow?: string;
    tags?: string[];
}

const normalize = (value: string | undefined, maxLength: number): string | undefined => {
    if (!value) {
        return undefined;
    }

    const collapsed = value.replace(/\s+/g, ' ').trim();
    if (!collapsed) {
        return undefined;
    }

    return collapsed.slice(0, maxLength);
};

export const buildDynamicOgImageUrl = ({ title, subtitle, eyebrow, tags = [] }: IBuildOgImageOptions): string => {
    const params = new URLSearchParams();
    const normalizedTitle = normalize(title, 110);
    const normalizedSubtitle = normalize(subtitle, 180);
    const normalizedEyebrow = normalize(eyebrow, 56);
    const normalizedTags = tags
        .map((tag) => normalize(tag, 32))
        .filter((tag): tag is string => Boolean(tag))
        .slice(0, 4);

    if (normalizedTitle) {
        params.set('title', normalizedTitle);
    }

    if (normalizedSubtitle) {
        params.set('subtitle', normalizedSubtitle);
    }

    if (normalizedEyebrow) {
        params.set('eyebrow', normalizedEyebrow);
    }

    if (normalizedTags.length > 0) {
        params.set('tags', normalizedTags.join(','));
    }

    const query = params.toString();
    return `${SITE_CONFIG.url}/api/og${query ? `?${query}` : ''}`;
};
