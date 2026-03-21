import { ARTICLE_READ_CONTRACT } from './article';
import { BLOG_READ_CONTRACT } from './blog';
import { PROJECT_READ_CONTRACT } from './project';
import type { IReadContract } from './shared';

export const PUBLIC_READ_CONTRACTS: Record<'article' | 'blog' | 'project', IReadContract> = {
    article: ARTICLE_READ_CONTRACT,
    blog: BLOG_READ_CONTRACT,
    project: PROJECT_READ_CONTRACT,
};

export const PUBLIC_READ_CONTRACT_DOMAINS = Object.freeze(
    Object.keys(PUBLIC_READ_CONTRACTS) as Array<keyof typeof PUBLIC_READ_CONTRACTS>
);
