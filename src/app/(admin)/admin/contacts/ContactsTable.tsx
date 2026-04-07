'use client';

// =============================================================
// ContactsTable - Professional Server-Side Table
// Uses DataTable component with server-action-first architecture
// Uses useAction hook for TanStack Query mutation benefits
// Uses useDialog for viewing full contact details
// =============================================================

import { Mail } from 'lucide-react';
import { useMemo } from 'react';

import { DataTable } from '@/components/admin/table';
import { useDialog } from '@/hooks/ui/useDialog';
import { useSnackbar } from '@/hooks/form/useSnackbar';
import { useAction } from '@/hooks/server/useAction';
import { formatDate } from '@/lib/utils';
import type { IAdminContactRow } from '@/server/new/admin/contacts';
import {
    archiveContact,
    bulkArchiveContacts,
    bulkDeleteContacts,
    deleteContact,
    getContacts,
    markContactAsRead,
    markContactAsReplied,
    unarchiveContact,
} from '@/server/new/admin/contacts';

import {
    createContactsTableConfig,
    type IContactActionHandlers,
    type IContactBulkActionHandlers,
} from './config';

// =============================================================
// Types
// =============================================================

interface IContactsTableProps {
    /** Initial server-side data for hydration */
    initialData?: IAdminContactRow[] | undefined;
    /** Initial total count for pagination */
    initialTotal?: number | undefined;
}

// =============================================================
// Contact View Dialog Content Component
// =============================================================

function ContactViewContent({ contact }: { contact: IAdminContactRow }): React.ReactElement {
    return (
        <div className="space-y-4">
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-sm">{contact.name}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <a 
                        href={`mailto:${contact.email}`}
                        className="text-sm text-primary hover:underline"
                    >
                        {contact.email}
                    </a>
                </div>
            </div>

            {/* Subject */}
            <div>
                <p className="text-sm font-medium text-muted-foreground">Subject</p>
                <p className="text-sm">{contact.subject}</p>
            </div>

            {/* Message */}
            <div>
                <p className="text-sm font-medium text-muted-foreground">Message</p>
                <div className="mt-1 rounded-md border bg-muted/50 p-3">
                    <p className="whitespace-pre-wrap text-sm">{contact.message}</p>
                </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Received</p>
                    <p className="text-sm">{formatDate(contact.createdAt)}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-sm capitalize">{contact.status}</p>
                </div>
            </div>
        </div>
    );
}

// =============================================================
// ContactsTable Component
// =============================================================

export function ContactsTable({ initialData, initialTotal }: IContactsTableProps): React.ReactElement {
    const { showSuccess, showError } = useSnackbar();
    const { openView } = useDialog();

    // =============================================================
    // Row Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - DataTableActions handles invalidation
    // =============================================================

    const markAsReadAction = useAction({
        action: async (contact: IAdminContactRow) => markContactAsRead(contact.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Contact marked as read');
        },
        onError: (message) => {
            showError(message ?? 'Failed to mark contact as read');
        },
    });

    const markAsRepliedAction = useAction({
        action: async (contact: IAdminContactRow) => markContactAsReplied(contact.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Contact marked as replied');
        },
        onError: (message) => {
            showError(message ?? 'Failed to mark contact as replied');
        },
    });

    const archiveAction = useAction({
        action: async (contact: IAdminContactRow) => archiveContact(contact.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Contact archived');
        },
        onError: (message) => {
            showError(message ?? 'Failed to archive contact');
        },
    });

    const unarchiveAction = useAction({
        action: async (contact: IAdminContactRow) => unarchiveContact(contact.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Contact unarchived');
        },
        onError: (message) => {
            showError(message ?? 'Failed to unarchive contact');
        },
    });

    const deleteAction = useAction({
        action: async (contact: IAdminContactRow) => deleteContact(contact.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Contact deleted successfully');
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete contact');
        },
    });

    const rowActionHandlers: IContactActionHandlers = useMemo(
        () => ({
            onView: (contact: IAdminContactRow) => {
                openView({
                    title: contact.subject,
                    description: `From: ${contact.name} <${contact.email}>`,
                    icon: Mail,
                    content: <ContactViewContent contact={contact} />,
                    width: 'lg',
                    closeLabel: 'Close',
                });
            },
            onMarkAsRead: async (contact: IAdminContactRow) => {
                await markAsReadAction.mutateAsync(contact);
            },
            onMarkAsReplied: async (contact: IAdminContactRow) => {
                await markAsRepliedAction.mutateAsync(contact);
            },
            onArchive: async (contact: IAdminContactRow) => {
                await archiveAction.mutateAsync(contact);
            },
            onUnarchive: async (contact: IAdminContactRow) => {
                await unarchiveAction.mutateAsync(contact);
            },
            onDelete: async (contact: IAdminContactRow) => {
                await deleteAction.mutateAsync(contact);
            },
        }),
        [
            openView,
            markAsReadAction.mutateAsync,
            markAsRepliedAction.mutateAsync,
            archiveAction.mutateAsync,
            unarchiveAction.mutateAsync,
            deleteAction.mutateAsync,
        ],
    );

    // =============================================================
    // Bulk Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - BulkActionsBar handles invalidation
    // =============================================================

    const bulkArchiveAction = useAction({
        action: async (_rows: IAdminContactRow[], ids: string[]) => bulkArchiveContacts(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} contacts archived`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to archive contacts');
        },
    });

    const bulkDeleteAction = useAction({
        action: async (_rows: IAdminContactRow[], ids: string[]) => bulkDeleteContacts(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} contacts deleted`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete contacts');
        },
    });

    const bulkActionHandlers: IContactBulkActionHandlers = useMemo(
        () => ({
            onBulkArchive: async (rows: IAdminContactRow[], ids: string[]) => {
                await bulkArchiveAction.mutateAsync(rows, ids);
            },
            onBulkDelete: async (rows: IAdminContactRow[], ids: string[]) => {
                await bulkDeleteAction.mutateAsync(rows, ids);
            },
        }),
        [bulkArchiveAction.mutateAsync, bulkDeleteAction.mutateAsync],
    );

    // =============================================================
    // Table Config with Custom Cell Renderers
    // =============================================================

    const config = useMemo(() => {
        const baseConfig = createContactsTableConfig({
            rowActions: rowActionHandlers,
            bulkActions: bulkActionHandlers,
        });

        // Add custom cell renderers
        const columnsWithRenderers = baseConfig.columns.map((col) => {
            // Contact column - Icon + Name + Email
            if (col.id === 'contact') {
                return {
                    ...col,
                    cell: (contact: IAdminContactRow) => (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate font-medium">{contact.name}</p>
                                <a
                                    href={`mailto:${contact.email}`}
                                    className="text-sm text-muted-foreground hover:text-primary hover:underline"
                                >
                                    {contact.email}
                                </a>
                            </div>
                        </div>
                    ),
                };
            }

            // Subject column - Truncated subject
            if (col.id === 'subject') {
                return {
                    ...col,
                    cell: (contact: IAdminContactRow) => (
                        <div className="min-w-0">
                            <p className="truncate font-medium">{contact.subject}</p>
                            <p className="truncate text-sm text-muted-foreground">
                                {contact.message.length > 60
                                    ? `${contact.message.substring(0, 60)}...`
                                    : contact.message}
                            </p>
                        </div>
                    ),
                };
            }

            // Status column - 4-state badge (new/read/replied/archived)
            if (col.id === 'status') {
                return {
                    ...col,
                    cell: (contact: IAdminContactRow) => {
                        const { status } = contact;

                        // Custom 4-state status badge for contacts
                        const statusConfig = {
                            new: {
                                label: 'New',
                                className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                            },
                            read: {
                                label: 'Read',
                                className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                            },
                            replied: {
                                label: 'Replied',
                                className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                            },
                            archived: {
                                label: 'Archived',
                                className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                            },
                        };

                        const badgeConfig = statusConfig[status];

                        return (
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeConfig.className}`}
                            >
                                {badgeConfig.label}
                            </span>
                        );
                    },
                };
            }

            // Received column - Formatted date
            if (col.id === 'createdAt') {
                return {
                    ...col,
                    cell: (contact: IAdminContactRow) => (
                        <span className="text-sm text-muted-foreground">{formatDate(contact.createdAt)}</span>
                    ),
                };
            }

            return col;
        });

        return {
            ...baseConfig,
            columns: columnsWithRenderers,
        };
    }, [rowActionHandlers, bulkActionHandlers]);

    // =============================================================
    // Render
    // =============================================================

    return <DataTable config={config} serverAction={getContacts} initialData={initialData} initialTotal={initialTotal} />;
}

export default ContactsTable;
