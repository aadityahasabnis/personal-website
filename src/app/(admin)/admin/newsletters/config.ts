// =============================================================
// Newsletters Table Configuration
// Professional Config-Driven Table Setup for Newsletter Management
// =============================================================

import {
    Eye,
    Mail,
    Pencil,
    Send,
} from 'lucide-react';

import {
    createBadgeColumn,
    createBulkAction,
    createColumn,
    createDateColumn,
    createDeleteAction,
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
import { NEWSLETTER_STATUS_FILTER_OPTIONS } from '@/constants/tableConstants';
import type { IAdminNewsletterRow } from '@/server/new/admin/newsletter';

// =============================================================
// Table Key & Query Key
// =============================================================

export const NEWSLETTERS_TABLE_KEY = 'admin-newsletters';
export const NEWSLETTERS_QUERY_KEY = ['admin', 'newsletters'] as const;

// =============================================================
// Search Fields
// =============================================================

export const NEWSLETTERS_SEARCH_FIELDS: (keyof IAdminNewsletterRow)[] = [
    'subject',
    'bodyPreview',
];

// =============================================================
// Filters Configuration
// =============================================================

export const NEWSLETTERS_FILTERS: IFilterConfig[] = [
    createSelectFilter('filter', 'Status', NEWSLETTER_STATUS_FILTER_OPTIONS),
];

// =============================================================
// Column Definitions
// =============================================================

export const createNewslettersColumns = (): IColumnConfig<IAdminNewsletterRow>[] => [
    // Subject Column (Main identifier)
    createColumn<IAdminNewsletterRow>({
        id: 'subject',
        header: 'Subject',
        width: '300px',
        minWidth: '250px',
        // Cell renderer is handled in component
    }),

    // Preview Column (Body preview)
    createColumn<IAdminNewsletterRow>({
        id: 'preview',
        header: 'Preview',
        width: '250px',
        minWidth: '200px',
        // Cell renderer is handled in component
    }),

    // Status Column (Draft/Sent)
    createBadgeColumn<IAdminNewsletterRow>(
        'status',
        'Status',
        () => null, // Handled in component for StatusBadge
        {
            width: '100px',
            align: 'center',
        }
    ),

    // Recipients Column (Success/Total count)
    createNumberColumn<IAdminNewsletterRow>(
        'recipientCount',
        'Recipients',
        'recipientCount',
        {
            width: '120px',
            align: 'center',
        }
    ),

    // Delivery Rate Column
    createColumn<IAdminNewsletterRow>({
        id: 'deliveryRate',
        header: 'Delivery',
        width: '100px',
        align: 'center',
        // Cell renderer is handled in component
    }),

    // Sent At Column
    createDateColumn<IAdminNewsletterRow>(
        'sentAt',
        'Sent',
        'sentAt',
        {
            width: '140px',
        }
    ),

    // Created At Column
    createDateColumn<IAdminNewsletterRow>(
        'createdAt',
        'Created',
        'createdAt',
        {
            width: '140px',
        }
    ),
];

// =============================================================
// Row Actions Factory
// =============================================================

export interface INewsletterActionHandlers {
    onView: (newsletter: IAdminNewsletterRow) => void;
    onEdit: (newsletter: IAdminNewsletterRow) => void;
    onSend: (newsletter: IAdminNewsletterRow) => Promise<void>;
    onDelete: (newsletter: IAdminNewsletterRow) => Promise<void>;
}

export const createNewsletterRowActions = (
    handlers: INewsletterActionHandlers
): IRowAction<IAdminNewsletterRow>[] => [
    // View Action (always visible - for viewing newsletter details)
    {
        id: 'view',
        label: 'View Details',
        icon: Eye,
        type: 'custom',
        onClick: (newsletter) => {
            handlers.onView(newsletter);
        },
    },

    // Edit Action (only visible for drafts)
    {
        id: 'edit',
        label: 'Edit',
        icon: Pencil,
        type: 'custom',
        onClick: (newsletter) => {
            handlers.onEdit(newsletter);
        },
        isVisible: (newsletter) => newsletter.status === 'draft',
    },

    // Send Action (only visible for drafts)
    {
        id: 'send',
        label: 'Send to Subscribers',
        icon: Send,
        type: 'custom',
        onClick: async (newsletter) => {
            await handlers.onSend(newsletter);
        },
        isVisible: (newsletter) => newsletter.status === 'draft',
        confirm: {
            title: 'Send Newsletter',
            message: (newsletter: IAdminNewsletterRow) =>
                `Are you sure you want to send "${newsletter.subject}" to all active subscribers? This action cannot be undone.`,
            confirmLabel: 'Send Now',
            cancelLabel: 'Cancel',
        },
    },

    // Delete Action
    createDeleteAction<IAdminNewsletterRow>(
        handlers.onDelete,
        {
            itemName: (newsletter) => newsletter.subject,
            confirmTitle: 'Delete Newsletter',
            confirmMessage: (newsletter) =>
                `Are you sure you want to delete "${newsletter.subject}"? This action cannot be undone.`,
        }
    ),
];

// =============================================================
// Bulk Actions Factory
// =============================================================

export interface INewsletterBulkActionHandlers {
    onBulkDelete: (rows: IAdminNewsletterRow[], ids: string[]) => Promise<void>;
}

export const createNewsletterBulkActions = (
    handlers: INewsletterBulkActionHandlers
): IBulkAction<IAdminNewsletterRow>[] => [
    // Bulk Delete
    createBulkAction<IAdminNewsletterRow>({
        id: 'bulk-delete',
        label: 'Delete',
        variant: 'destructive',
        onClick: handlers.onBulkDelete,
        confirm: {
            title: 'Delete Newsletters',
            message: (count) =>
                `Are you sure you want to delete ${count} newsletters? This action cannot be undone.`,
            confirmLabel: 'Delete All',
            cancelLabel: 'Cancel',
        },
    }),
];

// =============================================================
// Full Table Configuration Factory
// =============================================================

export interface INewslettersTableConfigOptions {
    rowActions: INewsletterActionHandlers;
    bulkActions: INewsletterBulkActionHandlers;
}

export const createNewslettersTableConfig = (
    options: INewslettersTableConfigOptions
): ITableConfig<IAdminNewsletterRow> =>
    createTableConfig<IAdminNewsletterRow>({
        // Identity
        tableKey: NEWSLETTERS_TABLE_KEY,
        queryKey: NEWSLETTERS_QUERY_KEY,

        // Data
        keyExtractor: (newsletter) => newsletter.id,

        // Columns (basic - custom rendering in component)
        columns: createNewslettersColumns(),

        // Row Actions
        rowActions: createNewsletterRowActions(options.rowActions),

        // Bulk Actions
        bulkActions: createNewsletterBulkActions(options.bulkActions),

        // Selection
        selectable: true,

        // Search
        searchable: true,
        searchPlaceholder: 'Search newsletters by subject or content...',
        searchFields: NEWSLETTERS_SEARCH_FIELDS,

        // Filters
        filters: NEWSLETTERS_FILTERS,

        // Pagination
        pagination: createPaginationConfig({
            mode: 'server',
            pageSize: 15,
            pageSizeOptions: [10, 15, 25, 50],
        }),

        // Appearance
        emptyState: {
            icon: Mail,
            title: 'No newsletters yet',
            description: 'Create your first newsletter to engage with your subscribers.',
            action: {
                label: 'Create Newsletter',
                onClick: () => {
                    window.location.href = '/admin/newsletters/new';
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
 * Skeleton props for NewslettersTable loading state
 * Use with DataTableSkeleton in Suspense fallback
 */
export const NEWSLETTERS_TABLE_SKELETON_PROPS: IDataTableSkeletonProps<IAdminNewsletterRow> = {
    columns: createNewslettersColumns(),
    rowCount: 15, // Match pagination.pageSize
    showSearch: true,
    showSelection: true,
    showActions: true,
};
