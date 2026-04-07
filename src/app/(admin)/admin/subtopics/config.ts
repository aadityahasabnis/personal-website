// =============================================================
// Subtopics Table Configuration
// Professional Config-Driven Table Setup
// =============================================================

import { ListTree } from 'lucide-react';

import {
    createBadgeColumn,
    createBulkAction,
    createColumn,
    createDateColumn,
    createDeleteAction,
    createEditAction,
    createNumberColumn,
    createPaginationConfig,
    createPublishAction,
    createReorderConfig,
    createSelectFilter,
    createTableConfig,
    type IBulkAction,
    type IColumnConfig,
    type IDataTableSkeletonProps,
    type IFilterConfig,
    type IRowAction,
    type ITableConfig,
} from '@/components/admin/table';
import type { IApiResponse } from '@/interfaces/actionHelper';
import type { ISubtopicRow } from '@/server/new/admin/subtopic';

// =============================================================
// Table Key & Query Key
// =============================================================

export const SUBTOPICS_TABLE_KEY = 'admin-subtopics';
export const SUBTOPICS_QUERY_KEY = ['admin', 'subtopics'] as const;

// =============================================================
// Search Fields
// =============================================================

export const SUBTOPICS_SEARCH_FIELDS: (keyof ISubtopicRow)[] = ['title', 'slug', 'description', 'topicTitle'];

// =============================================================
// Filters Configuration
// =============================================================

import { PUBLISHED_FILTER_OPTIONS } from '@/constants/tableConstants';

export const SUBTOPICS_FILTERS: IFilterConfig[] = [
    createSelectFilter('published', 'Status', PUBLISHED_FILTER_OPTIONS),
];

// =============================================================
// Column Definitions
// =============================================================

export const createSubtopicsColumns = (): IColumnConfig<ISubtopicRow>[] => [
    // Subtopic Column (Icon + Title + Slug)
    createColumn<ISubtopicRow>({
        id: 'subtopic',
        header: 'Subtopic',
        width: '300px',
        minWidth: '250px',
        // Cell renderer is handled in component for Link support
    }),

    // Topic Column (Parent topic reference)
    createColumn<ISubtopicRow>({
        id: 'topic',
        header: 'Topic',
        width: '200px',
        minWidth: '150px',
        // Cell renderer is handled in component for Link support
    }),

    // Articles Count Column
    createNumberColumn<ISubtopicRow>(
        'contentCount',
        'Articles',
        'contentCount',
        {
            width: '100px',
            align: 'center',
        }
    ),

    // Status Column
    createBadgeColumn<ISubtopicRow>(
        'published',
        'Status',
        () => null, // Handled in component for StatusBadge
        {
            width: '120px',
            align: 'center',
        }
    ),

    // Last Updated Column
    createDateColumn<ISubtopicRow>(
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

export interface ISubtopicActionHandlers {
    onTogglePublished: (subtopic: ISubtopicRow) => Promise<void>;
    onDelete: (subtopic: ISubtopicRow) => Promise<void>;
}

export const createSubtopicRowActions = (
    handlers: ISubtopicActionHandlers
): IRowAction<ISubtopicRow>[] => [
    // Edit Action
    createEditAction<ISubtopicRow>((subtopic) => `/admin/subtopics/${subtopic.id}/edit`),

    // Toggle Publish Action
    createPublishAction<ISubtopicRow>(
        handlers.onTogglePublished,
        (subtopic) => subtopic.published
    ),

    // Delete Action
    createDeleteAction<ISubtopicRow>(
        handlers.onDelete,
        {
            itemName: (subtopic) => subtopic.title,
            confirmTitle: 'Delete Subtopic',
            confirmMessage: (subtopic) =>
                subtopic.contentCount > 0
                    ? `This subtopic has ${subtopic.contentCount} articles. Deleting it will remove all associated articles. This action cannot be undone.`
                    : `Are you sure you want to delete "${subtopic.title}"? This action cannot be undone.`,
        }
    ),
];

// =============================================================
// Bulk Actions Factory
// =============================================================

export interface ISubtopicBulkActionHandlers {
    onBulkPublish: (rows: ISubtopicRow[], ids: string[]) => Promise<void>;
    onBulkUnpublish: (rows: ISubtopicRow[], ids: string[]) => Promise<void>;
    onBulkDelete: (rows: ISubtopicRow[], ids: string[]) => Promise<void>;
}

export const createSubtopicBulkActions = (
    handlers: ISubtopicBulkActionHandlers
): IBulkAction<ISubtopicRow>[] => [
    // Bulk Publish
    createBulkAction<ISubtopicRow>({
        id: 'bulk-publish',
        label: 'Publish',
        variant: 'default',
        onClick: handlers.onBulkPublish,
        isVisible: (rows) => rows.some((r) => !r.published),
    }),

    // Bulk Unpublish
    createBulkAction<ISubtopicRow>({
        id: 'bulk-unpublish',
        label: 'Unpublish',
        variant: 'outline',
        onClick: handlers.onBulkUnpublish,
        isVisible: (rows) => rows.some((r) => r.published),
    }),

    // Bulk Delete
    createBulkAction<ISubtopicRow>({
        id: 'bulk-delete',
        label: 'Delete',
        variant: 'destructive',
        onClick: handlers.onBulkDelete,
        confirm: {
            title: 'Delete Subtopics',
            message: (count) =>
                `Are you sure you want to delete ${count} subtopics? This action cannot be undone.`,
            confirmLabel: 'Delete All',
            cancelLabel: 'Cancel',
        },
    }),
];

// =============================================================
// Full Table Configuration Factory
// =============================================================

export interface ISubtopicsTableConfigOptions {
    rowActions: ISubtopicActionHandlers;
    bulkActions: ISubtopicBulkActionHandlers;
    onReorder: (items: ISubtopicRow[], ids: string[]) => Promise<IApiResponse<boolean>>;
}

export const createSubtopicsTableConfig = (
    options: ISubtopicsTableConfigOptions
): ITableConfig<ISubtopicRow> =>
    createTableConfig<ISubtopicRow>({
        // Identity
        tableKey: SUBTOPICS_TABLE_KEY,
        queryKey: SUBTOPICS_QUERY_KEY,

        // Data
        keyExtractor: (subtopic) => subtopic.id,

        // Columns (basic - custom rendering in component)
        columns: createSubtopicsColumns(),

        // Row Actions
        rowActions: createSubtopicRowActions(options.rowActions),

        // Bulk Actions
        bulkActions: createSubtopicBulkActions(options.bulkActions),

        // Selection
        selectable: true,

        // Search
        searchable: true,
        searchPlaceholder: 'Search subtopics by title, slug, topic, or description...',
        searchFields: SUBTOPICS_SEARCH_FIELDS,

        // Filters
        filters: SUBTOPICS_FILTERS,

        // Reorder
        reorder: createReorderConfig<ISubtopicRow>(
            options.onReorder,
            { mode: 'both' }
        ),

        // Pagination
        pagination: createPaginationConfig({
            mode: 'server',
            pageSize: 15,
            pageSizeOptions: [5, 10, 15, 25, 50],
        }),

        // Appearance
        emptyState: {
            icon: ListTree,
            title: 'No subtopics found',
            description: 'Create your first subtopic to organize articles within a topic.',
            action: {
                label: 'Create Subtopic',
                onClick: () => {
                    window.location.href = '/admin/subtopics/new';
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
 * Skeleton props for SubtopicsTable loading state
 * Use with DataTableSkeleton in Suspense fallback
 */
export const SUBTOPICS_TABLE_SKELETON_PROPS: IDataTableSkeletonProps<ISubtopicRow> = {
    columns: createSubtopicsColumns(),
    rowCount: 15, // Match pagination.pageSize
    showSearch: true,
    showSelection: true,
    showDragHandle: true, // reorder.mode === 'both' includes drag
    showActions: true,
};
