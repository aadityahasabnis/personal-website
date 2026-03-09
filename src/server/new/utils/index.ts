/**
 * Server New Utils - Barrel Export
 */

export {
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

    // Database helpers
    collections,
    findArticle,
    findPublishedArticle,
    findBlog,
    findPublishedBlog,
    findProject,
    findPublishedProject,
    verifyTopicExists,
    verifySubtopicExists,
    updateTopicContentCount,
    updateSubtopicContentCount,
    updateContentCounts,
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
    paginatedQuery,

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
