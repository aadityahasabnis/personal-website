// =============================================================
// Comments Table Configuration
// Professional Config-Driven Table Setup for Comment Moderation
// =============================================================

import {
    CheckCircle,
    Eye,
    MessageCircle,
    MessageSquareReply,
    ThumbsDown,
    Trash2,
} from 'lucide-react';

import {
    createBadgeColumn,
    createBulkAction,
    createColumn,
    createDateColumn,
    createPaginationConfig,
    createSelectFilter,
    createTableConfig,
    type IBulkAction,
    type IColumnConfig,
    type IDataTableSkeletonProps,
    type IFilterConfig,
    type IRowAction,
    type ITableConfig,
} from '@/components/admin/table';
import {
    COMMENT_CONTENT_TYPE_FILTER_OPTIONS,
    COMMENT_STATUS_FILTER_OPTIONS,
} from '@/constants/tableConstants';
import type { IAdminCommentRow } from '@/server/new/admin/comments';

// =============================================================
// Table Key & Query Key
// =============================================================

export const COMMENTS_TABLE_KEY = 'admin-comments';
export const COMMENTS_QUERY_KEY = ['admin', 'comments'] as const;

// =============================================================
// Search Fields
// =============================================================

export const COMMENTS_SEARCH_FIELDS: (keyof IAdminCommentRow)[] = [
    'body',
    'bodyPreview',
];

// =============================================================
// Filters Configuration
// =============================================================

export const COMMENTS_FILTERS: IFilterConfig[] = [
    createSelectFilter('filter', 'Status', COMMENT_STATUS_FILTER_OPTIONS),
    createSelectFilter('contentType', 'Content Type', COMMENT_CONTENT_TYPE_FILTER_OPTIONS),
];

// =============================================================
// Column Definitions
// =============================================================

export const createCommentsColumns = (): IColumnConfig<IAdminCommentRow>[] => [
    // Author Column (Name + Email + Owner Badge)
    createColumn<IAdminCommentRow>({
        id: 'author',
        header: 'Author',
        width: '200px',
        minWidth: '160px',
        // Cell renderer is handled in component
    }),

    // Comment Column (Preview + Parent preview if reply)
    createColumn<IAdminCommentRow>({
        id: 'comment',
        header: 'Comment',
        width: '350px',
        minWidth: '250px',
        // Cell renderer is handled in component
    }),

    // Content Column (Title + Type Badge + Link)
    createColumn<IAdminCommentRow>({
        id: 'content',
        header: 'Content',
        width: '250px',
        minWidth: '180px',
        // Cell renderer is handled in component
    }),

    // Status Column (Approved/Pending)
    createBadgeColumn<IAdminCommentRow>(
        'moderationStatus',
        'Status',
        () => null, // Handled in component for StatusBadge
        {
            width: '100px',
            align: 'center',
        }
    ),

    // Stats Column (Upvotes + Replies)
    createColumn<IAdminCommentRow>({
        id: 'stats',
        header: 'Stats',
        width: '100px',
        align: 'center',
        // Cell renderer is handled in component
    }),

    // Date Column
    createDateColumn<IAdminCommentRow>(
        'createdAt',
        'Date',
        'createdAt',
        {
            width: '140px',
        }
    ),
];

// =============================================================
// Row Actions Factory
// =============================================================

export interface ICommentActionHandlers {
    onView: (comment: IAdminCommentRow) => void;
    onApprove: (comment: IAdminCommentRow) => Promise<void>;
    onReject: (comment: IAdminCommentRow) => Promise<void>;
    onReply: (comment: IAdminCommentRow) => void;
    onDelete: (comment: IAdminCommentRow) => Promise<void>;
}

export const createCommentRowActions = (
    handlers: ICommentActionHandlers
): IRowAction<IAdminCommentRow>[] => [
    // View Action (opens dialog with full comment)
    {
        id: 'view',
        label: 'View Comment',
        icon: Eye,
        type: 'custom',
        onClick: (comment) => {
            handlers.onView(comment);
        },
    },

    // Approve Action (only visible for pending comments)
    {
        id: 'approve',
        label: 'Approve',
        icon: CheckCircle,
        type: 'custom',
        onClick: async (comment) => {
            await handlers.onApprove(comment);
        },
        isVisible: (comment) => comment.moderationStatus === 'pending',
    },

    // Reject Action (only visible for approved comments)
    {
        id: 'reject',
        label: 'Reject',
        icon: ThumbsDown,
        type: 'custom',
        onClick: async (comment) => {
            await handlers.onReject(comment);
        },
        isVisible: (comment) => comment.moderationStatus === 'approved',
    },

    // Reply Action (opens form dialog)
    {
        id: 'reply',
        label: 'Reply',
        icon: MessageSquareReply,
        type: 'custom',
        onClick: (comment) => {
            handlers.onReply(comment);
        },
    },

    // Delete Action
    {
        id: 'delete',
        label: 'Delete',
        icon: Trash2,
        type: 'delete',
        onClick: async (comment) => {
            await handlers.onDelete(comment);
        },
        confirm: {
            title: 'Delete Comment',
            message: (comment: IAdminCommentRow) =>
                comment.hasReplies
                    ? `Are you sure you want to delete this comment by "${comment.author.name}"? This will also delete ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}. This action cannot be undone.`
                    : `Are you sure you want to delete this comment by "${comment.author.name}"? This action cannot be undone.`,
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel',
        },
    },
];

// =============================================================
// Bulk Actions Factory
// =============================================================

export interface ICommentBulkActionHandlers {
    onBulkApprove: (rows: IAdminCommentRow[], ids: string[]) => Promise<void>;
    onBulkDelete: (rows: IAdminCommentRow[], ids: string[]) => Promise<void>;
}

export const createCommentBulkActions = (
    handlers: ICommentBulkActionHandlers
): IBulkAction<IAdminCommentRow>[] => [
    // Bulk Approve
    createBulkAction<IAdminCommentRow>({
        id: 'bulk-approve',
        label: 'Approve',
        variant: 'outline',
        onClick: handlers.onBulkApprove,
        isVisible: (rows) => rows.some((r) => r.moderationStatus === 'pending'),
    }),

    // Bulk Delete
    createBulkAction<IAdminCommentRow>({
        id: 'bulk-delete',
        label: 'Delete',
        variant: 'destructive',
        onClick: handlers.onBulkDelete,
        confirm: {
            title: 'Delete Comments',
            message: (count) =>
                `Are you sure you want to delete ${count} comments? Any replies to these comments will also be deleted. This action cannot be undone.`,
            confirmLabel: 'Delete All',
            cancelLabel: 'Cancel',
        },
    }),
];

// =============================================================
// Full Table Configuration Factory
// =============================================================

export interface ICommentsTableConfigOptions {
    rowActions: ICommentActionHandlers;
    bulkActions: ICommentBulkActionHandlers;
}

export const createCommentsTableConfig = (
    options: ICommentsTableConfigOptions
): ITableConfig<IAdminCommentRow> =>
    createTableConfig<IAdminCommentRow>({
        // Identity
        tableKey: COMMENTS_TABLE_KEY,
        queryKey: COMMENTS_QUERY_KEY,

        // Data
        keyExtractor: (comment) => comment.id,

        // Columns (basic - custom rendering in component)
        columns: createCommentsColumns(),

        // Row Actions
        rowActions: createCommentRowActions(options.rowActions),

        // Bulk Actions
        bulkActions: createCommentBulkActions(options.bulkActions),

        // Selection
        selectable: true,

        // Search
        searchable: true,
        searchPlaceholder: 'Search comments by content or author...',
        searchFields: COMMENTS_SEARCH_FIELDS,

        // Filters
        filters: COMMENTS_FILTERS,

        // Pagination
        pagination: createPaginationConfig({
            mode: 'server',
            pageSize: 25,
            pageSizeOptions: [10, 25, 50, 100],
        }),

        // Appearance
        emptyState: {
            icon: MessageCircle,
            title: 'No comments yet',
            description: 'When visitors leave comments on your content, they will appear here for moderation.',
        },

        // Options
        stickyHeader: true,
        striped: false,
    });

// =============================================================
// Skeleton Configuration for SSR Suspense Fallback
// =============================================================

/**
 * Skeleton props for CommentsTable loading state
 * Use with DataTableSkeleton in Suspense fallback
 */
export const COMMENTS_TABLE_SKELETON_PROPS: IDataTableSkeletonProps<IAdminCommentRow> = {
    columns: createCommentsColumns(),
    rowCount: 25, // Match pagination.pageSize
    showSearch: true,
    showSelection: true,
    showActions: true,
};
