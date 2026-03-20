/**
 * Comments Domain - Barrel Export
 */

// Actions
export {
    approveComment,
    rejectComment,
    deleteComment,
    clearReportedFlag,
    bulkApproveComments,
    bulkDeleteComments,
    adminReplyToComment,
} from './actions';

// Action Types
export type {
    AdminComment,
    ApproveCommentRequest,
    RejectCommentRequest,
    DeleteCommentRequest,
    ClearReportedFlagRequest,
    BulkCommentRequest,
    AdminReplyRequest,
} from './actions';

// Queries
export {
    getComments,
    getAllComments,
    getCommentStats,
    getCommentsByArticle,
} from './queries';

// Query Types
export type {
    GetCommentsRequest,
    CommentStats,
} from './queries';
