/**
 * Admin Utils - Barrel Export
 * 
 * Central export for all admin utilities.
 */

// Types
export type {
    ActionResponse,
    PaginatedResponse,
    PaginationRequest,
    SortRequest,
    FilterRequest,
    TimestampFields,
    PublishableFields,
    OrderableFields,
    FeaturedFields,
    Serialized,
    ActivityAction,
    ActivityEntity,
    ActivityLogOptions,
} from './types';

// Response helpers
export {
    success,
    created,
    paginated,
    error,
    notFound,
    duplicate,
    unauthorized,
    forbidden,
    validationError,
    serverError,
    isSuccess,
    isError,
} from './response';

// Error handling
export {
    handleError,
    tryCatch,
    withValidation,
} from './errorHandler';

// Auth guard
export type { AuthUser } from './authGuard';
export {
    getAuthUser,
    requireAuth,
    requireAdmin,
    withAuth,
    withAdminAuth,
} from './authGuard';

// Activity logging
export {
    logActivity,
    logCreate,
    logUpdate,
    logDelete,
    logPublish,
    logUnpublish,
    logExport,
    logReorder,
    withActivityLog,
} from './activityLogger';
