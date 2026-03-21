import { defineReadContract } from '../shared';
import { getPublishedArticleById } from './getPublishedArticleById';
import { getPublishedArticleByPath } from './getPublishedArticleByPath';
import { getPublishedArticleStaticPaths } from './getPublishedArticleStaticPaths';
import { getPublishedArticleTopics } from './getPublishedArticleTopics';

export const ARTICLE_READ_CONTRACT = defineReadContract({
    byPath: getPublishedArticleByPath,
    byId: getPublishedArticleById,
    list: getPublishedArticleTopics,
    staticPaths: getPublishedArticleStaticPaths,
});

export * from './getPublishedArticleById';
export * from './getPublishedArticleByPath';
export * from './getPublishedArticleStaticPaths';
export * from './getPublishedArticleTopics';
export * from './getPublishedTopicTreeBySlug';
export * from './types';

