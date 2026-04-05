// =============================================================
// Topics Table Configuration
// Professional Config-Driven Table Setup
// =============================================================

import { Layers } from 'lucide-react';

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
    createPublishAction,
    createReorderConfig,
    createSelectFilter,
    createTableConfig,
    type IBulkAction,
    type IColumnConfig,
    type IFilterConfig,
    type IRowAction,
    type ITableConfig,
} from '@/components/admin/table';
import type { IApiResponse } from '@/interfaces/actionHelper';
import type { ITopicRow } from '@/server/new/admin/topic';

// =============================================================
// Table Key & Query Key
// =============================================================

export const TOPICS_TABLE_KEY = 'admin-topics';
export const TOPICS_QUERY_KEY = ['admin', 'topics'] as const;

// =============================================================
// Search Fields
// =============================================================

export const TOPICS_SEARCH_FIELDS: (keyof ITopicRow)[] = ['title', 'slug', 'description'];

// =============================================================
// Filters Configuration
// =============================================================

import { PUBLISHED_FILTER_OPTIONS, FEATURED_FILTER_OPTIONS } from '@/constants/tableConstants';

export const TOPICS_FILTERS: IFilterConfig[] = [
    createSelectFilter('published', 'Status', PUBLISHED_FILTER_OPTIONS),
    createSelectFilter('featured', 'Featured', FEATURED_FILTER_OPTIONS),
];

// =============================================================
// Column Definitions
// =============================================================

export const createTopicsColumns = (): IColumnConfig<ITopicRow>[] => [
    // Topic Column (Icon + Title + Slug)
    createColumn<ITopicRow>({
        id: 'topic',
        header: 'Topic',
        width: '300px',
        minWidth: '250px',
        // Cell renderer is handled in component for Link support
    }),

    // Articles Count Column
    createNumberColumn<ITopicRow>(
        'contentCount',
        'Articles',
        'contentCount',
        {
            width: '100px',
            align: 'center',
        }
    ),

    // Status Column
    createBadgeColumn<ITopicRow>(
        'published',
        'Status',
        () => null, // Handled in component for StatusBadge
        {
            width: '120px',
            align: 'center',
        }
    ),

    // Featured Column
    createBadgeColumn<ITopicRow>(
        'featured',
        'Featured',
        () => null, // Handled in component for StatusBadge
        {
            width: '100px',
            align: 'center',
        }
    ),

    // Last Updated Column
    createDateColumn<ITopicRow>(
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

export interface ITopicActionHandlers {
    onTogglePublished: (topic: ITopicRow) => Promise<void>;
    onToggleFeatured: (topic: ITopicRow) => Promise<void>;
    onDelete: (topic: ITopicRow) => Promise<void>;
}

export const createTopicRowActions = (
    handlers: ITopicActionHandlers
): IRowAction<ITopicRow>[] => [
    // Edit Action
    createEditAction<ITopicRow>((topic) => `/admin/topics/${topic.id}/edit`),

    // Toggle Publish Action
    createPublishAction<ITopicRow>(
        handlers.onTogglePublished,
        (topic) => topic.published
    ),

    // Toggle Featured Action
    createFeatureAction<ITopicRow>(
        handlers.onToggleFeatured,
        (topic) => topic.featured
    ),

    // Delete Action
    createDeleteAction<ITopicRow>(
        handlers.onDelete,
        {
            itemName: (topic) => topic.title,
            confirmTitle: 'Delete Topic',
            confirmMessage: (topic) =>
                topic.contentCount > 0
                    ? `This topic has ${topic.contentCount} articles. Deleting it will remove all associated articles. This action cannot be undone.`
                    : `Are you sure you want to delete "${topic.title}"? This action cannot be undone.`,
        }
    ),
];

// =============================================================
// Bulk Actions Factory
// =============================================================

export interface ITopicBulkActionHandlers {
    onBulkPublish: (rows: ITopicRow[], ids: string[]) => Promise<void>;
    onBulkUnpublish: (rows: ITopicRow[], ids: string[]) => Promise<void>;
    onBulkFeature: (rows: ITopicRow[], ids: string[]) => Promise<void>;
    onBulkUnfeature: (rows: ITopicRow[], ids: string[]) => Promise<void>;
    onBulkDelete: (rows: ITopicRow[], ids: string[]) => Promise<void>;
}

export const createTopicBulkActions = (
    handlers: ITopicBulkActionHandlers
): IBulkAction<ITopicRow>[] => [
    // Bulk Publish
    createBulkAction<ITopicRow>({
        id: 'bulk-publish',
        label: 'Publish',
        variant: 'default',
        onClick: handlers.onBulkPublish,
        isVisible: (rows) => rows.some((r) => !r.published),
    }),

    // Bulk Unpublish
    createBulkAction<ITopicRow>({
        id: 'bulk-unpublish',
        label: 'Unpublish',
        variant: 'outline',
        onClick: handlers.onBulkUnpublish,
        isVisible: (rows) => rows.some((r) => r.published),
    }),

    // Bulk Feature
    createBulkAction<ITopicRow>({
        id: 'bulk-feature',
        label: 'Feature',
        variant: 'outline',
        onClick: handlers.onBulkFeature,
        isVisible: (rows) => rows.some((r) => !r.featured),
    }),

    // Bulk Unfeature
    createBulkAction<ITopicRow>({
        id: 'bulk-unfeature',
        label: 'Unfeature',
        variant: 'outline',
        onClick: handlers.onBulkUnfeature,
        isVisible: (rows) => rows.some((r) => r.featured),
    }),

    // Bulk Delete
    createBulkAction<ITopicRow>({
        id: 'bulk-delete',
        label: 'Delete',
        variant: 'destructive',
        onClick: handlers.onBulkDelete,
        confirm: {
            title: 'Delete Topics',
            message: (count) =>
                `Are you sure you want to delete ${count} topics? This action cannot be undone.`,
            confirmLabel: 'Delete All',
            cancelLabel: 'Cancel',
        },
    }),
];

// =============================================================
// Full Table Configuration Factory
// =============================================================

export interface ITopicsTableConfigOptions {
    rowActions: ITopicActionHandlers;
    bulkActions: ITopicBulkActionHandlers;
    onReorder: (items: ITopicRow[], ids: string[]) => Promise<IApiResponse<boolean>>;
}

export const createTopicsTableConfig = (
    options: ITopicsTableConfigOptions
): ITableConfig<ITopicRow> =>
    createTableConfig<ITopicRow>({
        // Identity
        tableKey: TOPICS_TABLE_KEY,
        queryKey: TOPICS_QUERY_KEY,

        // Data
        keyExtractor: (topic) => topic.id,

        // Columns (basic - custom rendering in component)
        columns: createTopicsColumns(),

        // Row Actions
        rowActions: createTopicRowActions(options.rowActions),

        // Bulk Actions
        bulkActions: createTopicBulkActions(options.bulkActions),

        // Selection
        selectable: true,

        // Search
        searchable: true,
        searchPlaceholder: 'Search topics by title, slug, or description...',
        searchFields: TOPICS_SEARCH_FIELDS,

        // Filters
        filters: TOPICS_FILTERS,

        // Reorder
        reorder: createReorderConfig<ITopicRow>(
            options.onReorder,
            { mode: 'both' }
        ),

        // Pagination
        pagination: createPaginationConfig({
            mode: 'server',
            pageSize: 15,
            pageSizeOptions: [10, 15, 25, 50],
        }),

        // Appearance
        emptyState: {
            icon: Layers,
            title: 'No topics found',
            description: 'Create your first topic to organize your articles.',
            action: {
                label: 'Create Topic',
                onClick: () => {
                    window.location.href = '/admin/topics/new';
                },
            },
        },

        // Options
        stickyHeader: true,
        striped: false,
    });
