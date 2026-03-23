import { CONTENT_TYPES, type PublicReadContentType } from '@/constants/schemaConstants';
import { ARTICLE_READ_CONTRACT } from './article';
import { BLOG_READ_CONTRACT } from './blog';
import { PROJECT_READ_CONTRACT } from './project';
import type { IReadContract } from './shared';

export const PUBLIC_READ_CONTRACTS: Record<PublicReadContentType, IReadContract> = {
    [CONTENT_TYPES.ARTICLE]: ARTICLE_READ_CONTRACT,
    [CONTENT_TYPES.BLOG]: BLOG_READ_CONTRACT,
    [CONTENT_TYPES.PROJECT]: PROJECT_READ_CONTRACT,
};

export const PUBLIC_READ_CONTRACT_DOMAINS = Object.freeze(
    Object.keys(PUBLIC_READ_CONTRACTS) as Array<keyof typeof PUBLIC_READ_CONTRACTS>
);
