// =============================================================
// Projects Table Configuration
// Professional Config-Driven Table Setup
// =============================================================

import { FolderKanban } from 'lucide-react';

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
import { PROJECT_STATUS, type ProjectStatusType, type PublishStatusType } from '@/constants/schemaConstants';
import type { IProjectRow } from '@/server/new/admin/content/project';

// =============================================================
// Table Key & Query Key
// =============================================================

export const PROJECTS_TABLE_KEY = 'admin-projects';
export const PROJECTS_QUERY_KEY = ['admin', 'projects'] as const;

// =============================================================
// Search Fields
// =============================================================

export const PROJECTS_SEARCH_FIELDS: (keyof IProjectRow)[] = [
    'title',
    'slug',
    'description',
];

// =============================================================
// Filters Configuration
// =============================================================

import { FEATURED_FILTER_OPTIONS, PUBLISH_STATUS_FILTER_OPTIONS } from '@/constants/tableConstants';

/**
 * Project lifecycle status filter options
 * Filter component automatically adds "All" option
 */
export const PROJECT_STATUS_FILTER_OPTIONS = [
    { label: 'In Progress', value: PROJECT_STATUS.IN_PROGRESS },
    { label: 'Live', value: PROJECT_STATUS.LIVE },
    { label: 'Archived', value: PROJECT_STATUS.ARCHIVED },
];

export const PROJECTS_FILTERS: IFilterConfig[] = [
    createSelectFilter('publishStatus', 'Publish Status', PUBLISH_STATUS_FILTER_OPTIONS),
    createSelectFilter('status', 'Lifecycle', PROJECT_STATUS_FILTER_OPTIONS),
    createSelectFilter('featured', 'Featured', FEATURED_FILTER_OPTIONS),
];

// =============================================================
// Column Definitions
// =============================================================

export const createProjectsColumns = (): IColumnConfig<IProjectRow>[] => [
    // Project Column (Icon + Title + Slug)
    createColumn<IProjectRow>({
        id: 'project',
        header: 'Project',
        width: '300px',
        minWidth: '250px',
        // Cell renderer is handled in component for Link support
    }),

    // Tech Stack Column (badges)
    createBadgeColumn<IProjectRow>(
        'techStack',
        'Tech Stack',
        () => null, // Handled in component for badge rendering
        {
            width: '200px',
            minWidth: '150px',
        }
    ),

    // Lifecycle Status Column (in_progress/live/archived)
    createBadgeColumn<IProjectRow>(
        'status',
        'Lifecycle',
        () => null, // Handled in component for StatusBadge
        {
            width: '120px',
            align: 'center',
        }
    ),

    // Publish Status Column (3-state: draft/published/archived)
    createBadgeColumn<IProjectRow>(
        'publishStatus',
        'Status',
        () => null, // Handled in component for StatusBadge
        {
            width: '120px',
            align: 'center',
        }
    ),

    // Featured Column
    createBadgeColumn<IProjectRow>(
        'featured',
        'Featured',
        () => null, // Handled in component for StatusBadge
        {
            width: '100px',
            align: 'center',
        }
    ),

    // Reading Time Column
    createNumberColumn<IProjectRow>(
        'readingTime',
        'Read Time',
        'readingTime',
        {
            width: '110px',
            align: 'center',
        }
    ),

    // Last Updated Column
    createDateColumn<IProjectRow>(
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

export interface IProjectActionHandlers {
    onSetStatus: (project: IProjectRow, status: PublishStatusType) => Promise<void>;
    onSetLifecycleStatus: (project: IProjectRow, status: ProjectStatusType | null) => Promise<void>;
    onToggleFeatured: (project: IProjectRow) => Promise<void>;
    onDelete: (project: IProjectRow) => Promise<void>;
}

export const createProjectRowActions = (
    handlers: IProjectActionHandlers
): IRowAction<IProjectRow>[] => [
    // Edit Action
    createEditAction<IProjectRow>((project) => `/admin/projects/${project.id}/edit`),

    // =========================================
    // Publish Status Actions (draft/published/archived)
    // Controls content visibility on the site
    // =========================================

    // Publish Action (Set publishStatus to 'published')
    {
        id: 'publish',
        label: 'Move to Published',
        icon: FolderKanban,
        type: 'publish',
        onClick: async (project) => {
            await handlers.onSetStatus(project, 'published');
        },
        isVisible: (project) => project.publishStatus !== 'published',
    },

    // Draft Action (Set publishStatus to 'draft')
    {
        id: 'draft',
        label: 'Move to Draft',
        icon: FolderKanban,
        type: 'custom',
        onClick: async (project) => {
            await handlers.onSetStatus(project, 'draft');
        },
        isVisible: (project) => project.publishStatus !== 'draft',
    },

    // Archive Action (Set publishStatus to 'archived')
    {
        id: 'archive',
        label: 'Move to Archived',
        icon: FolderKanban,
        type: 'archive',
        onClick: async (project) => {
            await handlers.onSetStatus(project, 'archived');
        },
        isVisible: (project) => project.publishStatus !== 'archived',
    },

    // =========================================
    // Lifecycle Status Actions (In Progress/Live/Archived)
    // Tracks the project development stage
    // =========================================

    // Set lifecycle to 'In Progress'
    {
        id: 'set-in-progress',
        label: 'Set In Progress',
        icon: FolderKanban,
        type: 'custom',
        onClick: async (project) => {
            await handlers.onSetLifecycleStatus(project, PROJECT_STATUS.IN_PROGRESS);
        },
        isVisible: (project) => project.status !== PROJECT_STATUS.IN_PROGRESS,
    },

    // Set lifecycle to 'Live'
    {
        id: 'set-live',
        label: 'Set Live',
        icon: FolderKanban,
        type: 'custom',
        onClick: async (project) => {
            await handlers.onSetLifecycleStatus(project, PROJECT_STATUS.LIVE);
        },
        isVisible: (project) => project.status !== PROJECT_STATUS.LIVE,
    },

    // Set lifecycle to 'Archived'
    {
        id: 'set-lifecycle-archived',
        label: 'Set Lifecycle Archived',
        icon: FolderKanban,
        type: 'custom',
        onClick: async (project) => {
            await handlers.onSetLifecycleStatus(project, PROJECT_STATUS.ARCHIVED);
        },
        isVisible: (project) => project.status !== PROJECT_STATUS.ARCHIVED,
    },

    // Toggle Featured Action
    createFeatureAction<IProjectRow>(
        handlers.onToggleFeatured,
        (project) => project.featured
    ),

    // Delete Action
    createDeleteAction<IProjectRow>(
        handlers.onDelete,
        {
            itemName: (project) => project.title,
            confirmTitle: 'Delete Project',
            confirmMessage: (project) =>
                `Are you sure you want to delete "${project.title}"? This will also remove all associated page stats and comments. This action cannot be undone.`,
        }
    ),
];

// =============================================================
// Bulk Actions Factory
// =============================================================

export interface IProjectBulkActionHandlers {
    onBulkPublish: (rows: IProjectRow[], ids: string[]) => Promise<void>;
    onBulkDraft: (rows: IProjectRow[], ids: string[]) => Promise<void>;
    onBulkArchive: (rows: IProjectRow[], ids: string[]) => Promise<void>;
    onBulkDelete: (rows: IProjectRow[], ids: string[]) => Promise<void>;
}

export const createProjectBulkActions = (
    handlers: IProjectBulkActionHandlers
): IBulkAction<IProjectRow>[] => [
    // Bulk Publish (Set publishStatus to 'published')
    createBulkAction<IProjectRow>({
        id: 'bulk-publish',
        label: 'Move to Published',
        variant: 'default',
        onClick: handlers.onBulkPublish,
        isVisible: (rows) => rows.some((r) => r.publishStatus !== 'published'),
    }),

    // Bulk Draft (Set publishStatus to 'draft')
    createBulkAction<IProjectRow>({
        id: 'bulk-draft',
        label: 'Move to Draft',
        variant: 'outline',
        onClick: handlers.onBulkDraft,
        isVisible: (rows) => rows.some((r) => r.publishStatus !== 'draft'),
    }),

    // Bulk Archive (Set publishStatus to 'archived')
    createBulkAction<IProjectRow>({
        id: 'bulk-archive',
        label: 'Move to Archived',
        variant: 'outline',
        onClick: handlers.onBulkArchive,
        isVisible: (rows) => rows.some((r) => r.publishStatus !== 'archived'),
    }),

    // Bulk Delete
    createBulkAction<IProjectRow>({
        id: 'bulk-delete',
        label: 'Delete',
        variant: 'destructive',
        onClick: handlers.onBulkDelete,
        confirm: {
            title: 'Delete Projects',
            message: (count) =>
                `Are you sure you want to delete ${count} projects? This will also remove all associated page stats and comments. This action cannot be undone.`,
            confirmLabel: 'Delete All',
            cancelLabel: 'Cancel',
        },
    }),
];

// =============================================================
// Full Table Configuration Factory
// =============================================================

export interface IProjectsTableConfigOptions {
    rowActions: IProjectActionHandlers;
    bulkActions: IProjectBulkActionHandlers;
}

export const createProjectsTableConfig = (
    options: IProjectsTableConfigOptions
): ITableConfig<IProjectRow> =>
    createTableConfig<IProjectRow>({
        // Identity
        tableKey: PROJECTS_TABLE_KEY,
        queryKey: PROJECTS_QUERY_KEY,

        // Data
        keyExtractor: (project) => project.id,

        // Columns (basic - custom rendering in component)
        columns: createProjectsColumns(),

        // Row Actions
        rowActions: createProjectRowActions(options.rowActions),

        // Bulk Actions
        bulkActions: createProjectBulkActions(options.bulkActions),

        // Selection
        selectable: true,

        // Search
        searchable: true,
        searchPlaceholder: 'Search projects by title, slug, or description...',
        searchFields: PROJECTS_SEARCH_FIELDS,

        // Filters
        filters: PROJECTS_FILTERS,

        // Pagination
        pagination: createPaginationConfig({
            mode: 'server',
            pageSize: 15,
            pageSizeOptions: [5, 10, 15, 25, 50],
        }),

        // Appearance
        emptyState: {
            icon: FolderKanban,
            title: 'No projects found',
            description: 'Create your first project to showcase your work.',
            action: {
                label: 'Create Project',
                onClick: () => {
                    window.location.href = '/admin/projects/new';
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
 * Skeleton props for ProjectsTable loading state
 * Use with DataTableSkeleton in Suspense fallback
 */
export const PROJECTS_TABLE_SKELETON_PROPS: IDataTableSkeletonProps<IProjectRow> = {
    columns: createProjectsColumns(),
    rowCount: 15, // Match pagination.pageSize
    showSearch: true,
    showSelection: true,
    showActions: true,
};
