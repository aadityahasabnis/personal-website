'use client';

// =============================================================
// SubscribersTable - Professional Server-Side Table
// Uses DataTable component with server-action-first architecture
// Uses useAction hook for TanStack Query mutation benefits
// =============================================================

import { Mail } from 'lucide-react';
import { useMemo } from 'react';

import { DataTable } from '@/components/admin/table';
import { useSnackbar } from '@/hooks/form/useSnackbar';
import { useAction } from '@/hooks/server/useAction';
import { cn, formatDate } from '@/lib/utils';
import type { IAdminSubscriberRow } from '@/server/new/admin/subscribers';
import {
    bulkDeleteSubscribers,
    confirmSubscriber,
    deleteSubscriber,
    getSubscribers,
} from '@/server/new/admin/subscribers';

import {
    createSubscribersTableConfig,
    SUBSCRIBER_STATUS_CONFIG,
    type ISubscriberActionHandlers,
    type ISubscriberBulkActionHandlers,
    type SubscriberStatusVariant,
} from './config';

// =============================================================
// Types
// =============================================================

interface ISubscribersTableProps {
    /** Initial server-side data for hydration */
    initialData?: IAdminSubscriberRow[] | undefined;
    /** Initial total count for pagination */
    initialTotal?: number | undefined;
}

// =============================================================
// Status Badge Component
// =============================================================

function SubscriberStatusBadge({ status }: { status: SubscriberStatusVariant }): React.ReactElement {
    const config = SUBSCRIBER_STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                config.className
            )}
        >
            <Icon className="h-3 w-3" />
            {config.label}
        </span>
    );
}

// =============================================================
// SubscribersTable Component
// =============================================================

export function SubscribersTable({ initialData, initialTotal }: ISubscribersTableProps): React.ReactElement {
    const { showSuccess, showError } = useSnackbar();

    // =============================================================
    // Row Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - DataTableActions handles invalidation
    // =============================================================

    const confirmAction = useAction({
        action: async (subscriber: IAdminSubscriberRow) => confirmSubscriber(subscriber.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Subscriber confirmed');
        },
        onError: (message) => {
            showError(message ?? 'Failed to confirm subscriber');
        },
    });

    const deleteAction = useAction({
        action: async (subscriber: IAdminSubscriberRow) => deleteSubscriber(subscriber.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Subscriber deleted');
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete subscriber');
        },
    });

    const rowActionHandlers: ISubscriberActionHandlers = useMemo(
        () => ({
            onConfirm: async (subscriber: IAdminSubscriberRow) => {
                await confirmAction.mutateAsync(subscriber);
            },
            onDelete: async (subscriber: IAdminSubscriberRow) => {
                await deleteAction.mutateAsync(subscriber);
            },
        }),
        [confirmAction.mutateAsync, deleteAction.mutateAsync]
    );

    // =============================================================
    // Bulk Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - BulkActionsBar handles invalidation
    // =============================================================

    const bulkDeleteAction = useAction({
        action: async (_rows: IAdminSubscriberRow[], ids: string[]) => bulkDeleteSubscribers(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} subscribers deleted`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete subscribers');
        },
    });

    const bulkActionHandlers: ISubscriberBulkActionHandlers = useMemo(
        () => ({
            onBulkDelete: async (rows: IAdminSubscriberRow[], ids: string[]) => {
                await bulkDeleteAction.mutateAsync(rows, ids);
            },
        }),
        [bulkDeleteAction.mutateAsync]
    );

    // =============================================================
    // Table Config with Custom Cell Renderers
    // =============================================================

    const config = useMemo(() => {
        const baseConfig = createSubscribersTableConfig({
            rowActions: rowActionHandlers,
            bulkActions: bulkActionHandlers,
        });

        // Add custom cell renderers
        const columnsWithRenderers = baseConfig.columns.map((col) => {
            // Subscriber column - Icon + Email
            if (col.id === 'subscriber') {
                return {
                    ...col,
                    cell: (subscriber: IAdminSubscriberRow) => (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate font-medium">{subscriber.email}</p>
                                {subscriber.name && (
                                    <p className="text-sm text-muted-foreground">{subscriber.name}</p>
                                )}
                            </div>
                        </div>
                    ),
                };
            }

            // Name column
            if (col.id === 'name') {
                return {
                    ...col,
                    cell: (subscriber: IAdminSubscriberRow) => (
                        <span className="text-sm text-muted-foreground">
                            {subscriber.name ?? '-'}
                        </span>
                    ),
                };
            }

            // Status column - Custom badge
            if (col.id === 'status') {
                return {
                    ...col,
                    cell: (subscriber: IAdminSubscriberRow) => (
                        <SubscriberStatusBadge status={subscriber.status} />
                    ),
                };
            }

            // Subscribed date column - Formatted date
            if (col.id === 'subscribedAt') {
                return {
                    ...col,
                    cell: (subscriber: IAdminSubscriberRow) => (
                        <span className="text-sm text-muted-foreground">
                            {formatDate(subscriber.subscribedAt)}
                        </span>
                    ),
                };
            }

            // Created date column - Formatted date
            if (col.id === 'createdAt') {
                return {
                    ...col,
                    cell: (subscriber: IAdminSubscriberRow) => (
                        <span className="text-sm text-muted-foreground">
                            {formatDate(subscriber.createdAt)}
                        </span>
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

    return (
        <DataTable
            config={config}
            serverAction={getSubscribers}
            initialData={initialData}
            initialTotal={initialTotal}
        />
    );
}

export default SubscribersTable;
