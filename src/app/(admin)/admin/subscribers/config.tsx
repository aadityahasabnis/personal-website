// =============================================================
// Subscribers Table Configuration
// Professional Config-Driven Table Setup
// =============================================================

import { Mail, UserCheck, UserMinus, UserX } from 'lucide-react';

import {
    createBadgeColumn,
    createBulkAction,
    createColumn,
    createDateColumn,
    createDeleteAction,
    createPaginationConfig,
    createRowAction,
    createSelectFilter,
    createTableConfig,
    type IBulkAction,
    type IColumnConfig,
    type IDataTableSkeletonProps,
    type IFilterConfig,
    type IRowAction,
    type ITableConfig,
} from '@/components/admin/table';
import type { IAdminSubscriberRow, SubscriberFilter } from '@/server/new/admin/subscribers';

// =============================================================
// Table Key & Query Key
// =============================================================

export const SUBSCRIBERS_TABLE_KEY = 'admin-subscribers';
export const SUBSCRIBERS_QUERY_KEY = ['admin', 'subscribers'] as const;

// =============================================================
// Search Fields
// =============================================================

export const SUBSCRIBERS_SEARCH_FIELDS: (keyof IAdminSubscriberRow)[] = ['email', 'name'];

// =============================================================
// Filters Configuration
// =============================================================

/**
 * Subscriber status filter options
 * Note: "All" option is added automatically by the filter component
 */
export const SUBSCRIBER_STATUS_FILTER_OPTIONS = [
    { label: 'Confirmed', value: 'confirmed' satisfies SubscriberFilter },
    { label: 'Pending', value: 'pending' satisfies SubscriberFilter },
    { label: 'Unsubscribed', value: 'unsubscribed' satisfies SubscriberFilter },
];

export const SUBSCRIBERS_FILTERS: IFilterConfig[] = [
    createSelectFilter('filter', 'Status', SUBSCRIBER_STATUS_FILTER_OPTIONS),
];

// =============================================================
// Column Definitions
// =============================================================

export const createSubscribersColumns = (): IColumnConfig<IAdminSubscriberRow>[] => [
    // Subscriber Column (Icon + Email + Name)
    createColumn<IAdminSubscriberRow>({
        id: 'subscriber',
        header: 'Subscriber',
        width: '300px',
        minWidth: '250px',
        // Cell renderer is handled in component
    }),

    // Name Column (separate for sorting)
    createColumn<IAdminSubscriberRow>({
        id: 'name',
        header: 'Name',
        width: '180px',
        // Cell renderer handled in component
    }),

    // Status Column
    createBadgeColumn<IAdminSubscriberRow>(
        'status',
        'Status',
        () => null, // Handled in component for StatusBadge
        {
            width: '130px',
            align: 'center',
        }
    ),

    // Subscribed Date Column
    createDateColumn<IAdminSubscriberRow>(
        'subscribedAt',
        'Subscribed',
        'subscribedAt',
        {
            width: '150px',
        }
    ),

    // Created Date Column
    createDateColumn<IAdminSubscriberRow>(
        'createdAt',
        'Created',
        'createdAt',
        {
            width: '150px',
        }
    ),
];

// =============================================================
// Row Actions Factory
// =============================================================

export interface ISubscriberActionHandlers {
    onConfirm: (subscriber: IAdminSubscriberRow) => Promise<void>;
    onDelete: (subscriber: IAdminSubscriberRow) => Promise<void>;
}

export const createSubscriberRowActions = (
    handlers: ISubscriberActionHandlers
): IRowAction<IAdminSubscriberRow>[] => [
    // Confirm Action (only for pending subscribers)
    createRowAction<IAdminSubscriberRow>({
        id: 'confirm',
        label: 'Confirm',
        icon: UserCheck,
        type: 'custom',
        onClick: handlers.onConfirm,
        isVisible: (subscriber) => subscriber.status === 'pending',
    }),

    // Delete Action
    createDeleteAction<IAdminSubscriberRow>(
        handlers.onDelete,
        {
            itemName: (subscriber) => subscriber.email,
            confirmTitle: 'Delete Subscriber',
            confirmMessage: (subscriber) =>
                `Are you sure you want to delete "${subscriber.email}"? This action cannot be undone.`,
        }
    ),
];

// =============================================================
// Bulk Actions Factory
// =============================================================

export interface ISubscriberBulkActionHandlers {
    onBulkDelete: (rows: IAdminSubscriberRow[], ids: string[]) => Promise<void>;
}

export const createSubscriberBulkActions = (
    handlers: ISubscriberBulkActionHandlers
): IBulkAction<IAdminSubscriberRow>[] => [
    // Bulk Delete
    createBulkAction<IAdminSubscriberRow>({
        id: 'bulk-delete',
        label: 'Delete',
        variant: 'destructive',
        onClick: handlers.onBulkDelete,
        confirm: {
            title: 'Delete Subscribers',
            message: (count) =>
                `Are you sure you want to delete ${count} subscribers? This action cannot be undone.`,
            confirmLabel: 'Delete All',
            cancelLabel: 'Cancel',
        },
    }),
];

// =============================================================
// Full Table Configuration Factory
// =============================================================

export interface ISubscribersTableConfigOptions {
    rowActions: ISubscriberActionHandlers;
    bulkActions: ISubscriberBulkActionHandlers;
}

export const createSubscribersTableConfig = (
    options: ISubscribersTableConfigOptions
): ITableConfig<IAdminSubscriberRow> =>
    createTableConfig<IAdminSubscriberRow>({
        // Identity
        tableKey: SUBSCRIBERS_TABLE_KEY,
        queryKey: SUBSCRIBERS_QUERY_KEY,

        // Data
        keyExtractor: (subscriber) => subscriber.id,

        // Columns (basic - custom rendering in component)
        columns: createSubscribersColumns(),

        // Row Actions
        rowActions: createSubscriberRowActions(options.rowActions),

        // Bulk Actions
        bulkActions: createSubscriberBulkActions(options.bulkActions),

        // Selection
        selectable: true,

        // Search
        searchable: true,
        searchPlaceholder: 'Search by email or name...',
        searchFields: SUBSCRIBERS_SEARCH_FIELDS,

        // Filters
        filters: SUBSCRIBERS_FILTERS,

        // Pagination
        pagination: createPaginationConfig({
            mode: 'server',
            pageSize: 25,
            pageSizeOptions: [10, 25, 50, 100],
        }),

        // Appearance
        emptyState: {
            icon: Mail,
            title: 'No subscribers found',
            description: 'Subscribers will appear here when people sign up for your newsletter.',
        },

        // Options
        stickyHeader: true,
        striped: false,
    });

// =============================================================
// Status Badge Configuration
// =============================================================

export type SubscriberStatusVariant = 'confirmed' | 'pending' | 'unsubscribed';

export const SUBSCRIBER_STATUS_CONFIG: Record<
    SubscriberStatusVariant,
    { label: string; icon: typeof UserCheck; className: string }
> = {
    confirmed: {
        label: 'Confirmed',
        icon: UserCheck,
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    pending: {
        label: 'Pending',
        icon: UserMinus,
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    unsubscribed: {
        label: 'Unsubscribed',
        icon: UserX,
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
};

// =============================================================
// Skeleton Configuration for SSR Suspense Fallback
// =============================================================

/**
 * Skeleton props for SubscribersTable loading state
 * Use with DataTableSkeleton in Suspense fallback
 */
export const SUBSCRIBERS_TABLE_SKELETON_PROPS: IDataTableSkeletonProps<IAdminSubscriberRow> = {
    columns: createSubscribersColumns(),
    rowCount: 25, // Match pagination.pageSize
    showSearch: true,
    showSelection: true,
    showDragHandle: false, // No reordering for subscribers
    showActions: true,
};
