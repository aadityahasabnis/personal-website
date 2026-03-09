/**
 * Admin Article Actions – Barrel Export
 */

// Mutations
export { createArticle } from './createArticle';
export { updateArticle } from './updateArticle';
export { deleteArticle } from './deleteArticle';
export {
    publishArticle,
    unpublishArticle,
    toggleArticlePublished,
    toggleArticleFeatured,
    scheduleArticle,
    reorderArticles,
} from './publishArticle';

// Queries
export {
    getArticles,
    getArticlesByTopic,
    getArticleForEdit,
    getArticleSidebarData,
} from './getArticles';

// Types – admin serialized types from getArticles, input types from types.ts
export type {
    SerializedArticle,
    SerializedArticleForEdit,
    ArticleSidebarData,
} from './getArticles';
export type { ArticleCreateInput, ArticleUpdateInput } from './types';
