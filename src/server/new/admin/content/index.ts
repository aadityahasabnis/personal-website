/**
 * Admin Content Actions – Barrel Export
 *
 * Re-exports all content-type admin actions (article, blog, project).
 */

// ---- Articles ----
export {
    createArticle, deleteArticle, getArticleForEdit,
    getArticleSidebarData, getArticles,
    getArticlesByTopic, publishArticle, reorderArticles, toggleArticleFeatured, toggleArticlePublished, unpublishArticle, updateArticle
} from './article';
export type {
    ArticleCreateInput, ArticleSidebarData, ArticleUpdateInput,
    SerializedArticle,
    SerializedArticleForEdit
} from './article';

// ---- Blogs ----
export {
    createBlog, deleteBlog, getBlogForEdit, getBlogs, publishBlog, toggleBlogFeatured, toggleBlogPublished, unpublishBlog, updateBlog
} from './blog';
export type {
    BlogCreateInput,
    BlogUpdateInput,
    SerializedBlog,
    SerializedBlogForEdit
} from './blog';

// ---- Projects ----
export {
    createProject, deleteProject, getProjectForEdit, getProjects, publishProject, reorderProjects, toggleProjectFeatured, unpublishProject, updateProject, updateProjectStatus
} from './project';
export type {
    ProjectCreateInput,
    ProjectUpdateInput,
    SerializedProject,
    SerializedProjectForEdit
} from './project';

