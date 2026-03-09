/**
 * Admin Content Actions – Barrel Export
 *
 * Re-exports all content-type admin actions (article, blog, project).
 */

// ---- Articles ----
export {
    createArticle,
    updateArticle,
    deleteArticle,
    publishArticle,
    unpublishArticle,
    toggleArticlePublished,
    toggleArticleFeatured,
    scheduleArticle,
    reorderArticles,
    getArticles,
    getArticlesByTopic,
    getArticleForEdit,
    getArticleSidebarData,
} from './article';
export type {
    ArticleCreateInput,
    ArticleUpdateInput,
    SerializedArticle,
    SerializedArticleForEdit,
    ArticleSidebarData,
} from './article';

// ---- Blogs ----
export {
    createBlog,
    updateBlog,
    deleteBlog,
    publishBlog,
    unpublishBlog,
    toggleBlogPublished,
    toggleBlogFeatured,
    scheduleBlog,
    getBlogs,
    getBlogForEdit,
} from './blog';
export type {
    BlogCreateInput,
    BlogUpdateInput,
    SerializedBlog,
    SerializedBlogForEdit,
} from './blog';

// ---- Projects ----
export {
    createProject,
    updateProject,
    deleteProject,
    publishProject,
    unpublishProject,
    toggleProjectFeatured,
    updateProjectStatus,
    reorderProjects,
    getProjects,
    getProjectForEdit,
} from './project';
export type {
    ProjectCreateInput,
    ProjectUpdateInput,
    SerializedProject,
    SerializedProjectForEdit,
} from './project';
