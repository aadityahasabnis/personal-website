/**
 * Server New Utils - Barrel Export
 */

export {
    // Connection guard
    ensureConnection,

    // Response builders
    ok,
    created,
    okVoid,
    paginatedOk,

    // Error helpers
    errorResponse,
    notFoundError,
    duplicateError,
    unauthorizedError,
    forbiddenError,
    serverError,
    handleError,

    // Database helpers — Mongoose models
    Content,
    Topic,
    Subtopic,
    PageStats,
    Comment,

    // Database helpers — typed finders (lean, plain objects)
    findArticle,
    findPublishedArticle,
    findBlog,
    findPublishedBlog,
    findProject,
    findPublishedProject,

    // Database helpers — document finders (for instance methods)
    findArticleDoc,
    findBlogDoc,
    findProjectDoc,

    // Database helpers — reference verification
    verifyTopicExists,
    verifySubtopicExists,

    // Database helpers — denormalized count updaters
    updateTopicContentCount,
    updateSubtopicContentCount,
    updateContentCounts,

    // Database helpers — page stats
    incrementViews,
    incrementLikes,
    decrementLikes,
    getStats,

    // Validation helpers
    isValidObjectId,
    toObjectId,
    cleanUndefined,

    // Pagination helpers
    normalizePagination,
    buildSort,

    // Revalidation helpers
    revalidatePaths,
    revalidateContentPaths,

    // Serialization helpers
    serialize,
    serializeMany,
    buildSeoMetadata,

    // Action wrappers
    tryCatch,
    timestamps,
    updatedNow,
} from './helper';

export type {
    PaginationParams,
    SortParams,
} from './helper';
