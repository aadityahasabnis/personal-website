// =============================================================
// Blogs Table Configuration
// Professional Config-Driven Table Setup
// =============================================================

import { FileText } from 'lucide-react';

import {
    createBadgeColumn,
    createBulkAction,
    createColumn,
    createDateColumn,
    createDeleteAction,
    createEditAction,
    createFeatureAction,
    createNumberColumn,
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
import type { PublishStatusType } from '@/constants/schemaConstants';
import type { IBlogRow } from '@/server/new/admin/content/blog';

// =============================================================
// Table Key & Query Key
// =============================================================

export const BLOGS_TABLE_KEY = 'admin-blogs';
export const BLOGS_QUERY_KEY = ['admin', 'blogs'] as const;

// =============================================================
// Search Fields
// =============================================================

export const BLOGS_SEARCH_FIELDS: (keyof IBlogRow)[] = [
    'title',
    'slug',
    'description',
];

// =============================================================
// Filters Configuration
// =============================================================

import { FEATURED_FILTER_OPTIONS, PUBLISH_STATUS_FILTER_OPTIONS } from '@/constants/tableConstants';

export const BLOGS_FILTERS: IFilterConfig[] = [
    createSelectFilter('publishStatus', 'Status', PUBLISH_STATUS_FILTER_OPTIONS),
    createSelectFilter('featured', 'Featured', FEATURED_FILTER_OPTIONS),
];

// =============================================================
// Column Definitions
// =============================================================

export const createBlogsColumns = (): IColumnConfig<IBlogRow>[] => [
    // Blog Column (Icon + Title + Slug)
    createColumn<IBlogRow>({
        id: 'blog',
        header: 'Blog',
        width: '400px',
        minWidth: '350px',
        // Cell renderer is handled in component for Link support
    }),

    // Status Column (3-state: draft/published/archived)
    createBadgeColumn<IBlogRow>(
        'publishStatus',
        'Status',
        () => null, // Handled in component for StatusBadge
        {
            width: '120px',
            align: 'center',
        }
    ),

    // Featured Column
    createBadgeColumn<IBlogRow>(
        'featured',
        'Featured',
        () => null, // Handled in component for StatusBadge
        {
            width: '100px',
            align: 'center',
        }
    ),

    // Reading Time Column
    createNumberColumn<IBlogRow>(
        'readingTime',
        'Read Time',
        'readingTime',
        {
            width: '110px',
            align: 'center',
        }
    ),

    // Last Updated Column
    createDateColumn<IBlogRow>(
        'updatedAt',
        'Last Updated',
        'updatedAt',
        {
            width: '150px',
        }
    ),
];

// =============================================================
// Row Actions Factory
// =============================================================

export interface IBlogActionHandlers {
    onSetStatus: (blog: IBlogRow, status: PublishStatusType) => Promise<void>;
    onToggleFeatured: (blog: IBlogRow) => Promise<void>;
    onDelete: (blog: IBlogRow) => Promise<void>;
}

export const createBlogRowActions = (
    handlers: IBlogActionHandlers
): IRowAction<IBlogRow>[] => [
    // Edit Action
    createEditAction<IBlogRow>((blog) => `/admin/blogs/${blog.id}/edit`),

    // Publish Action (Set to 'published')
    {
        id: 'publish',
        label: 'Publish',
        icon: FileText,
        type: 'publish',
        onClick: async (blog) => {
            await handlers.onSetStatus(blog, 'published');
        },
        isVisible: (blog) => blog.publishStatus !== 'published',
    },

    // Draft Action (Set to 'draft')
    {
        id: 'draft',
        label: 'Move to Draft',
        icon: FileText,
        type: 'custom',
        onClick: async (blog) => {
            await handlers.onSetStatus(blog, 'draft');
        },
        isVisible: (blog) => blog.publishStatus !== 'draft',
    },

    // Archive Action (Set to 'archived')
    {
        id: 'archive',
        label: 'Archive',
        icon: FileText,
        type: 'archive',
        onClick: async (blog) => {
            await handlers.onSetStatus(blog, 'archived');
        },
        isVisible: (blog) => blog.publishStatus !== 'archived',
    },

    // Toggle Featured Action
    createFeatureAction<IBlogRow>(
        handlers.onToggleFeatured,
        (blog) => blog.featured
    ),

    // Delete Action
    createDeleteAction<IBlogRow>(
        handlers.onDelete,
        {
            itemName: (blog) => blog.title,
            confirmTitle: 'Delete Blog',
            confirmMessage: (blog) =>
                `Are you sure you want to delete "${blog.title}"? This will also remove all associated page stats and comments. This action cannot be undone.`,
        }
    ),
];

// =============================================================
// Bulk Actions Factory
// =============================================================

export interface IBlogBulkActionHandlers {
    onBulkPublish: (rows: IBlogRow[], ids: string[]) => Promise<void>;
    onBulkDraft: (rows: IBlogRow[], ids: string[]) => Promise<void>;
    onBulkArchive: (rows: IBlogRow[], ids: string[]) => Promise<void>;
    onBulkDelete: (rows: IBlogRow[], ids: string[]) => Promise<void>;
}

export const createBlogBulkActions = (
    handlers: IBlogBulkActionHandlers
): IBulkAction<IBlogRow>[] => [
    // Bulk Publish
    createBulkAction<IBlogRow>({
        id: 'bulk-publish',
        label: 'Publish',
        variant: 'default',
        onClick: handlers.onBulkPublish,
        isVisible: (rows) => rows.some((r) => r.publishStatus !== 'published'),
    }),

    // Bulk Draft
    createBulkAction<IBlogRow>({
        id: 'bulk-draft',
        label: 'Move to Draft',
        variant: 'outline',
        onClick: handlers.onBulkDraft,
        isVisible: (rows) => rows.some((r) => r.publishStatus !== 'draft'),
    }),

    // Bulk Archive
    createBulkAction<IBlogRow>({
        id: 'bulk-archive',
        label: 'Archive',
        variant: 'outline',
        onClick: handlers.onBulkArchive,
        isVisible: (rows) => rows.some((r) => r.publishStatus !== 'archived'),
    }),

    // Bulk Delete
    createBulkAction<IBlogRow>({
        id: 'bulk-delete',
        label: 'Delete',
        variant: 'destructive',
        onClick: handlers.onBulkDelete,
        confirm: {
            title: 'Delete Blogs',
            message: (count) =>
                `Are you sure you want to delete ${count} blogs? This will also remove all associated page stats and comments. This action cannot be undone.`,
            confirmLabel: 'Delete All',
            cancelLabel: 'Cancel',
        },
    }),
];

// =============================================================
// Full Table Configuration Factory
// =============================================================

export interface IBlogsTableConfigOptions {
    rowActions: IBlogActionHandlers;
    bulkActions: IBlogBulkActionHandlers;
}

export const createBlogsTableConfig = (
    options: IBlogsTableConfigOptions
): ITableConfig<IBlogRow> =>
    createTableConfig<IBlogRow>({
        // Identity
        tableKey: BLOGS_TABLE_KEY,
        queryKey: BLOGS_QUERY_KEY,

        // Data
        keyExtractor: (blog) => blog.id,

        // Columns (basic - custom rendering in component)
        columns: createBlogsColumns(),

        // Row Actions
        rowActions: createBlogRowActions(options.rowActions),

        // Bulk Actions
        bulkActions: createBlogBulkActions(options.bulkActions),

        // Selection
        selectable: true,

        // Search
        searchable: true,
        searchPlaceholder: 'Search blogs by title, slug, or description...',
        searchFields: BLOGS_SEARCH_FIELDS,

        // Filters
        filters: BLOGS_FILTERS,

        // Pagination
        pagination: createPaginationConfig({
            mode: 'server',
            pageSize: 15,
            pageSizeOptions: [5, 10, 15, 25, 50],
        }),

        // Appearance
        emptyState: {
            icon: FileText,
            title: 'No blogs found',
            description: 'Create your first blog post to start publishing content.',
            action: {
                label: 'Create Blog',
                onClick: () => {
                    window.location.href = '/admin/blogs/new';
                },
            },
        },

        // Options
        stickyHeader: true,
        striped: false,
    });

// =============================================================
// Skeleton Configuration for SSR Suspense Fallback
// =============================================================

/**
 * Skeleton props for BlogsTable loading state
 * Use with DataTableSkeleton in Suspense fallback
 */
export const BLOGS_TABLE_SKELETON_PROPS: IDataTableSkeletonProps<IBlogRow> = {
    columns: createBlogsColumns(),
    rowCount: 15, // Match pagination.pageSize
    showSearch: true,
    showSelection: true,
    showActions: true,
};
