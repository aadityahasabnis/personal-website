import type { ISeoMetadata } from '@/interfaces/schema';

// ========================================================
// SEO
// ========================================================

export const buildSeo = (input?: Partial<ISeoMetadata> | null): ISeoMetadata | null => {
    if (!input) return null;
    return {
        title: input.title ?? null,
        description: input.description ?? null,
        keywords: input.keywords ?? [],
        ogImage: input.ogImage ?? null,
        canonicalUrl: input.canonicalUrl ?? null,
        noIndex: input.noIndex ?? false,
    };
};
