// =============================================================
// Articles Table Configuration
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
import type { IArticleRow } from '@/server/new/admin/content/article';

// =============================================================
// Table Key & Query Key
// =============================================================

export const ARTICLES_TABLE_KEY = 'admin-articles';
export const ARTICLES_QUERY_KEY = ['admin', 'articles'] as const;

// =============================================================
// Search Fields
// =============================================================

export const ARTICLES_SEARCH_FIELDS: (keyof IArticleRow)[] = [
    'title',
    'slug',
    'description',
    'topicTitle',
    'subtopicTitle',
];

// =============================================================
// Filters Configuration
// =============================================================

import { FEATURED_FILTER_OPTIONS, PUBLISH_STATUS_FILTER_OPTIONS } from '@/constants/tableConstants';

export const ARTICLES_FILTERS: IFilterConfig[] = [
    createSelectFilter('publishStatus', 'Status', PUBLISH_STATUS_FILTER_OPTIONS),
    createSelectFilter('featured', 'Featured', FEATURED_FILTER_OPTIONS),
];

// =============================================================
// Column Definitions
// =============================================================

export const createArticlesColumns = (): IColumnConfig<IArticleRow>[] => [
    // Article Column (Icon + Title + Slug)
    createColumn<IArticleRow>({
        id: 'article',
        header: 'Article',
        width: '350px',
        minWidth: '300px',
        // Cell renderer is handled in component for Link support
    }),

    // Topic Column (Parent topic with link)
    createColumn<IArticleRow>({
        id: 'topic',
        header: 'Topic',
        width: '180px',
        minWidth: '150px',
        // Cell renderer is handled in component for Link support
    }),

    // Subtopic Column (Parent subtopic with link, nullable)
    createColumn<IArticleRow>({
        id: 'subtopic',
        header: 'Subtopic',
        width: '180px',
        minWidth: '150px',
        // Cell renderer is handled in component for Link support
    }),

    // Status Column (3-state: draft/published/archived)
    createBadgeColumn<IArticleRow>(
        'publishStatus',
        'Status',
        () => null, // Handled in component for StatusBadge
        {
            width: '120px',
            align: 'center',
        }
    ),

    // Featured Column
    createBadgeColumn<IArticleRow>(
        'featured',
        'Featured',
        () => null, // Handled in component for StatusBadge
        {
            width: '100px',
            align: 'center',
        }
    ),

    // Reading Time Column
    createNumberColumn<IArticleRow>(
        'readingTime',
        'Read Time',
        'readingTime',
        {
            width: '110px',
            align: 'center',
        }
    ),

    // Last Updated Column
    createDateColumn<IArticleRow>(
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

export interface IArticleActionHandlers {
    onSetStatus: (article: IArticleRow, status: PublishStatusType) => Promise<void>;
    onToggleFeatured: (article: IArticleRow) => Promise<void>;
    onDelete: (article: IArticleRow) => Promise<void>;
}

export const createArticleRowActions = (
    handlers: IArticleActionHandlers
): IRowAction<IArticleRow>[] => [
    // Edit Action
    createEditAction<IArticleRow>((article) => `/admin/articles/${article.id}/edit`),

    // Publish Action (Set to 'published')
    {
        id: 'publish',
        label: 'Publish',
        icon: FileText,
        type: 'publish',
        onClick: async (article) => {
            await handlers.onSetStatus(article, 'published');
        },
        isVisible: (article) => article.publishStatus !== 'published',
    },

    // Draft Action (Set to 'draft')
    {
        id: 'draft',
        label: 'Move to Draft',
        icon: FileText,
        type: 'custom',
        onClick: async (article) => {
            await handlers.onSetStatus(article, 'draft');
        },
        isVisible: (article) => article.publishStatus !== 'draft',
    },

    // Archive Action (Set to 'archived')
    {
        id: 'archive',
        label: 'Archive',
        icon: FileText,
        type: 'archive',
        onClick: async (article) => {
            await handlers.onSetStatus(article, 'archived');
        },
        isVisible: (article) => article.publishStatus !== 'archived',
    },

    // Toggle Featured Action
    createFeatureAction<IArticleRow>(
        handlers.onToggleFeatured,
        (article) => article.featured
    ),

    // Delete Action
    createDeleteAction<IArticleRow>(
        handlers.onDelete,
        {
            itemName: (article) => article.title,
            confirmTitle: 'Delete Article',
            confirmMessage: (article) =>
                `Are you sure you want to delete "${article.title}"? This will also remove all associated page stats and comments. This action cannot be undone.`,
        }
    ),
];

// =============================================================
// Bulk Actions Factory
// =============================================================

export interface IArticleBulkActionHandlers {
    onBulkPublish: (rows: IArticleRow[], ids: string[]) => Promise<void>;
    onBulkDraft: (rows: IArticleRow[], ids: string[]) => Promise<void>;
    onBulkArchive: (rows: IArticleRow[], ids: string[]) => Promise<void>;
    onBulkDelete: (rows: IArticleRow[], ids: string[]) => Promise<void>;
}

export const createArticleBulkActions = (
    handlers: IArticleBulkActionHandlers
): IBulkAction<IArticleRow>[] => [
    // Bulk Publish
    createBulkAction<IArticleRow>({
        id: 'bulk-publish',
        label: 'Publish',
        variant: 'default',
        onClick: handlers.onBulkPublish,
        isVisible: (rows) => rows.some((r) => r.publishStatus !== 'published'),
    }),

    // Bulk Draft
    createBulkAction<IArticleRow>({
        id: 'bulk-draft',
        label: 'Move to Draft',
        variant: 'outline',
        onClick: handlers.onBulkDraft,
        isVisible: (rows) => rows.some((r) => r.publishStatus !== 'draft'),
    }),

    // Bulk Archive
    createBulkAction<IArticleRow>({
        id: 'bulk-archive',
        label: 'Archive',
        variant: 'outline',
        onClick: handlers.onBulkArchive,
        isVisible: (rows) => rows.some((r) => r.publishStatus !== 'archived'),
    }),

    // Bulk Delete
    createBulkAction<IArticleRow>({
        id: 'bulk-delete',
        label: 'Delete',
        variant: 'destructive',
        onClick: handlers.onBulkDelete,
        confirm: {
            title: 'Delete Articles',
            message: (count) =>
                `Are you sure you want to delete ${count} articles? This will also remove all associated page stats and comments. This action cannot be undone.`,
            confirmLabel: 'Delete All',
            cancelLabel: 'Cancel',
        },
    }),
];

// =============================================================
// Full Table Configuration Factory
// =============================================================

export interface IArticlesTableConfigOptions {
    rowActions: IArticleActionHandlers;
    bulkActions: IArticleBulkActionHandlers;
}

export const createArticlesTableConfig = (
    options: IArticlesTableConfigOptions
): ITableConfig<IArticleRow> =>
    createTableConfig<IArticleRow>({
        // Identity
        tableKey: ARTICLES_TABLE_KEY,
        queryKey: ARTICLES_QUERY_KEY,

        // Data
        keyExtractor: (article) => article.id,

        // Columns (basic - custom rendering in component)
        columns: createArticlesColumns(),

        // Row Actions
        rowActions: createArticleRowActions(options.rowActions),

        // Bulk Actions
        bulkActions: createArticleBulkActions(options.bulkActions),

        // Selection
        selectable: true,

        // Search
        searchable: true,
        searchPlaceholder: 'Search articles by title, slug, topic, or subtopic...',
        searchFields: ARTICLES_SEARCH_FIELDS,

        // Filters
        filters: ARTICLES_FILTERS,

        // Pagination
        pagination: createPaginationConfig({
            mode: 'server',
            pageSize: 15,
            pageSizeOptions: [5, 10, 15, 25, 50],
        }),

        // Appearance
        emptyState: {
            icon: FileText,
            title: 'No articles found',
            description: 'Create your first article to start publishing content.',
            action: {
                label: 'Create Article',
                onClick: () => {
                    window.location.href = '/admin/articles/new';
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
 * Skeleton props for ArticlesTable loading state
 * Use with DataTableSkeleton in Suspense fallback
 */
export const ARTICLES_TABLE_SKELETON_PROPS: IDataTableSkeletonProps<IArticleRow> = {
    columns: createArticlesColumns(),
    rowCount: 15, // Match pagination.pageSize
    showSearch: true,
    showSelection: true,
    showActions: true,
};
