/**
 * Articles Domain - Barrel Export
 */

// Types
export type {
    CreateArticleRequest,
    CreateArticleResponse,
} from './createArticle';

export type {
    UpdateArticleRequest,
    UpdateArticleResponse,
} from './updateArticle';

export type {
    DeleteArticleResponse,
} from './deleteArticle';

export type {
    PublishArticleResponse,
    TogglePublishedResponse,
} from './publishArticle';

export type {
    ToggleFeaturedResponse,
    ReorderArticlesResponse,
} from './toggleArticle';

export type {
    SerializedArticle,
    ArticleForEdit,
    ArticleSidebarData,
} from './getArticles';

// Actions
export { createArticle } from './createArticle';
export { updateArticle } from './updateArticle';
export { deleteArticle } from './deleteArticle';
export { publishArticle, unpublishArticle, toggleArticlePublished } from './publishArticle';
export { toggleArticleFeatured, reorderArticles } from './toggleArticle';

// Queries
export { getArticles, getArticleForEdit, getArticleSidebarData, getArticlesByTopic } from './getArticles';
