// =============================================================
// Contacts Table Configuration
// Professional Config-Driven Table Setup
// =============================================================

import { Archive, ArchiveRestore, CheckCheck, Eye, Mail, MailOpen, Reply } from 'lucide-react';

import {
    createBadgeColumn,
    createBulkAction,
    createColumn,
    createDateColumn,
    createDeleteAction,
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
import type { IAdminContactRow } from '@/server/new/admin/contacts';

// =============================================================
// Table Key & Query Key
// =============================================================

export const CONTACTS_TABLE_KEY = 'admin-contacts';
export const CONTACTS_QUERY_KEY = ['admin', 'contacts'] as const;

// =============================================================
// Search Fields
// =============================================================

export const CONTACTS_SEARCH_FIELDS: (keyof IAdminContactRow)[] = [
    'name',
    'email',
    'subject',
    'message',
];

// =============================================================
// Filters Configuration
// =============================================================

/**
 * Contact status filter options
 * Filter component automatically adds "All" option
 */
export const CONTACT_STATUS_FILTER_OPTIONS = [
    { label: 'New', value: 'new' },
    { label: 'Read', value: 'read' },
    { label: 'Replied', value: 'replied' },
    { label: 'Archived', value: 'archived' },
];

export const CONTACTS_FILTERS: IFilterConfig[] = [
    createSelectFilter('status', 'Status', CONTACT_STATUS_FILTER_OPTIONS),
];

// =============================================================
// Column Definitions
// =============================================================

export const createContactsColumns = (): IColumnConfig<IAdminContactRow>[] => [
    // Contact Column (Name + Email)
    createColumn<IAdminContactRow>({
        id: 'contact',
        header: 'Contact',
        width: '250px',
        minWidth: '200px',
        // Cell renderer is handled in component
    }),

    // Subject Column (truncated)
    createColumn<IAdminContactRow>({
        id: 'subject',
        header: 'Subject',
        width: '300px',
        minWidth: '200px',
        // Cell renderer is handled in component
    }),

    // Status Column (new/read/replied/archived)
    createBadgeColumn<IAdminContactRow>(
        'status',
        'Status',
        () => null, // Handled in component for StatusBadge
        {
            width: '120px',
            align: 'center',
        }
    ),

    // Received Date Column
    createDateColumn<IAdminContactRow>(
        'createdAt',
        'Received',
        'createdAt',
        {
            width: '150px',
        }
    ),
];

// =============================================================
// Row Actions Factory
// =============================================================

export interface IContactActionHandlers {
    onView: (contact: IAdminContactRow) => void;
    onMarkAsRead: (contact: IAdminContactRow) => Promise<void>;
    onMarkAsReplied: (contact: IAdminContactRow) => Promise<void>;
    onArchive: (contact: IAdminContactRow) => Promise<void>;
    onUnarchive: (contact: IAdminContactRow) => Promise<void>;
    onDelete: (contact: IAdminContactRow) => Promise<void>;
}

export const createContactRowActions = (
    handlers: IContactActionHandlers
): IRowAction<IAdminContactRow>[] => [
    // View Action (opens dialog)
    {
        id: 'view',
        label: 'View Message',
        icon: Eye,
        type: 'custom',
        onClick: (contact) => {
            handlers.onView(contact);
        },
    },

    // Respond Action
    {
        id: 'respond',
        label: 'Respond',
        icon: Reply,
        type: 'custom',
        href: (contact) => `/admin/contacts/${contact.id}/response`,
        isVisible: (contact) => contact.status !== 'archived',
    },

    // Mark as Read Action
    {
        id: 'mark-read',
        label: 'Mark as Read',
        icon: MailOpen,
        type: 'custom',
        onClick: async (contact) => {
            await handlers.onMarkAsRead(contact);
        },
        isVisible: (contact) => contact.status === 'new',
    },

    // Mark as Replied Action
    {
        id: 'mark-replied',
        label: 'Mark as Replied',
        icon: CheckCheck,
        type: 'custom',
        onClick: async (contact) => {
            await handlers.onMarkAsReplied(contact);
        },
        isVisible: (contact) => contact.status !== 'replied' && contact.status !== 'archived',
    },

    // Archive Action
    {
        id: 'archive',
        label: 'Archive',
        icon: Archive,
        type: 'archive',
        onClick: async (contact) => {
            await handlers.onArchive(contact);
        },
        isVisible: (contact) => contact.status !== 'archived',
    },

    // Unarchive Action
    {
        id: 'unarchive',
        label: 'Unarchive',
        icon: ArchiveRestore,
        type: 'custom',
        onClick: async (contact) => {
            await handlers.onUnarchive(contact);
        },
        isVisible: (contact) => contact.status === 'archived',
    },

    // Delete Action
    createDeleteAction<IAdminContactRow>(
        handlers.onDelete,
        {
            itemName: (contact) => `message from ${contact.name}`,
            confirmTitle: 'Delete Contact Message',
            confirmMessage: (contact) =>
                `Are you sure you want to delete the message from "${contact.name}" (${contact.email})? This action cannot be undone.`,
        }
    ),
];

// =============================================================
// Bulk Actions Factory
// =============================================================

export interface IContactBulkActionHandlers {
    onBulkArchive: (rows: IAdminContactRow[], ids: string[]) => Promise<void>;
    onBulkDelete: (rows: IAdminContactRow[], ids: string[]) => Promise<void>;
}

export const createContactBulkActions = (
    handlers: IContactBulkActionHandlers
): IBulkAction<IAdminContactRow>[] => [
    // Bulk Archive
    createBulkAction<IAdminContactRow>({
        id: 'bulk-archive',
        label: 'Archive',
        variant: 'outline',
        onClick: handlers.onBulkArchive,
        isVisible: (rows) => rows.some((r) => r.status !== 'archived'),
    }),

    // Bulk Delete
    createBulkAction<IAdminContactRow>({
        id: 'bulk-delete',
        label: 'Delete',
        variant: 'destructive',
        onClick: handlers.onBulkDelete,
        confirm: {
            title: 'Delete Contact Messages',
            message: (count) =>
                `Are you sure you want to delete ${count} contact messages? This action cannot be undone.`,
            confirmLabel: 'Delete All',
            cancelLabel: 'Cancel',
        },
    }),
];

// =============================================================
// Full Table Configuration Factory
// =============================================================

export interface IContactsTableConfigOptions {
    rowActions: IContactActionHandlers;
    bulkActions: IContactBulkActionHandlers;
}

export const createContactsTableConfig = (
    options: IContactsTableConfigOptions
): ITableConfig<IAdminContactRow> =>
    createTableConfig<IAdminContactRow>({
        // Identity
        tableKey: CONTACTS_TABLE_KEY,
        queryKey: CONTACTS_QUERY_KEY,

        // Data
        keyExtractor: (contact) => contact.id,

        // Columns (basic - custom rendering in component)
        columns: createContactsColumns(),

        // Row Actions
        rowActions: createContactRowActions(options.rowActions),

        // Bulk Actions
        bulkActions: createContactBulkActions(options.bulkActions),

        // Selection
        selectable: true,

        // Search
        searchable: true,
        searchPlaceholder: 'Search contacts by name, email, subject, or message...',
        searchFields: CONTACTS_SEARCH_FIELDS,

        // Filters
        filters: CONTACTS_FILTERS,

        // Pagination
        pagination: createPaginationConfig({
            mode: 'server',
            pageSize: 20,
            pageSizeOptions: [10, 20, 30, 50, 100],
        }),

        // Appearance
        emptyState: {
            icon: Mail,
            title: 'No contact messages',
            description: 'When visitors send you messages through the contact form, they will appear here.',
        },

        // Options
        stickyHeader: true,
        striped: false,
    });

// =============================================================
// Skeleton Configuration for SSR Suspense Fallback
// =============================================================

/**
 * Skeleton props for ContactsTable loading state
 * Use with DataTableSkeleton in Suspense fallback
 */
export const CONTACTS_TABLE_SKELETON_PROPS: IDataTableSkeletonProps<IAdminContactRow> = {
    columns: createContactsColumns(),
    rowCount: 20, // Match pagination.pageSize
    showSearch: true,
    showSelection: true,
    showActions: true,
};
