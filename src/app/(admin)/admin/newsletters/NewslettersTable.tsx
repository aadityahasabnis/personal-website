'use client';

// =============================================================
// NewslettersTable - Professional Server-Side Table for Newsletters
// Uses DataTable component with server-action-first architecture
// Uses useAction hook for TanStack Query mutation benefits
// Uses useDialog for viewing newsletter details and form dialogs
// =============================================================

import { CheckCircle, Mail, Send, User, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { DataTable } from '@/components/admin/table';
import { useDialog } from '@/hooks/ui/useDialog';
import { useSnackbar } from '@/hooks/form/useSnackbar';
import { useAction } from '@/hooks/server/useAction';
import { formatDate } from '@/lib/utils';
import type { IAdminNewsletterRow } from '@/server/new/admin/newsletter';
import {
    bulkDeleteNewsletters,
    deleteNewsletter,
    getNewsletters,
    sendNewsletter,
} from '@/server/new/admin/newsletter';

import {
    createNewslettersTableConfig,
    type INewsletterActionHandlers,
    type INewsletterBulkActionHandlers,
} from './config';

// =============================================================
// Types
// =============================================================

interface INewslettersTableProps {
    /** Initial server-side data for hydration */
    initialData?: IAdminNewsletterRow[] | undefined;
    /** Initial total count for pagination */
    initialTotal?: number | undefined;
}

// =============================================================
// Newsletter View Dialog Content Component
// =============================================================

function NewsletterViewContent({ newsletter }: { newsletter: IAdminNewsletterRow }): React.ReactElement {
    const isSent = newsletter.status === 'sent';

    return (
        <div className="space-y-4">
            {/* Subject */}
            <div>
                <p className="text-sm font-medium text-muted-foreground">Subject</p>
                <p className="mt-1 text-base font-semibold">{newsletter.subject}</p>
            </div>

            {/* Preview Text */}
            {newsletter.previewText && (
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Preview Text</p>
                    <p className="mt-1 text-sm italic text-muted-foreground">{newsletter.previewText}</p>
                </div>
            )}

            {/* Body Preview */}
            <div>
                <p className="text-sm font-medium text-muted-foreground">Content Preview</p>
                <div className="mt-1 max-h-48 overflow-y-auto rounded-md border bg-muted/50 p-3">
                    <p className="whitespace-pre-wrap text-sm">{newsletter.bodyPreview}</p>
                </div>
            </div>

            {/* Status & Delivery Stats */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <span
                        className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            isSent
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                    >
                        {isSent ? 'Sent' : 'Draft'}
                    </span>
                </div>
                {isSent && (
                    <>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Recipients</p>
                            <p className="mt-1 text-sm">{newsletter.recipientCount}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                            <p className="mt-1 flex items-center gap-1 text-sm">
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                {newsletter.successCount}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Failed</p>
                            <p className="mt-1 flex items-center gap-1 text-sm">
                                <XCircle className="h-3.5 w-3.5 text-red-500" />
                                {newsletter.failureCount}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Delivery Rate (only for sent) */}
            {isSent && (
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Delivery Rate</p>
                    <div className="mt-1 flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full bg-green-500 transition-all"
                                style={{ width: `${newsletter.deliveryRate}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium">{newsletter.deliveryRate}%</span>
                    </div>
                </div>
            )}

            {/* Author & Dates */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Created By</p>
                    {newsletter.createdBy ? (
                        <div className="mt-1 flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <User className="h-3 w-3" />
                            </div>
                            <span className="text-sm">{newsletter.createdBy.name}</span>
                        </div>
                    ) : (
                        <p className="mt-1 text-sm text-muted-foreground">Unknown</p>
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="mt-1 text-sm">{formatDate(newsletter.createdAt)}</p>
                </div>
                {isSent && newsletter.sentAt && (
                    <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Sent At</p>
                        <p className="mt-1 text-sm">{formatDate(newsletter.sentAt)}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// =============================================================
// NewslettersTable Component
// =============================================================

export function NewslettersTable({ initialData, initialTotal }: INewslettersTableProps): React.ReactElement {
    const router = useRouter();
    const { showSuccess, showError } = useSnackbar();
    const { openView } = useDialog();

    // =============================================================
    // Row Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - DataTableActions handles invalidation
    // =============================================================

    const sendAction = useAction({
        action: async (newsletter: IAdminNewsletterRow) => sendNewsletter(newsletter.id),
        onSuccess: (data, response) => {
            if (data) {
                showSuccess(
                    response.message ?? 'Newsletter sent successfully',
                    `Delivered to ${data.successCount} of ${data.recipientCount} subscribers (${data.deliveryRate}% delivery rate)`
                );
            } else {
                showSuccess(response.message ?? 'Newsletter sent successfully');
            }
        },
        onError: (message) => {
            showError(message ?? 'Failed to send newsletter');
        },
    });

    const deleteAction = useAction({
        action: async (newsletter: IAdminNewsletterRow) => deleteNewsletter(newsletter.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Newsletter deleted successfully');
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete newsletter');
        },
    });

    const rowActionHandlers: INewsletterActionHandlers = useMemo(
        () => ({
            onView: (newsletter: IAdminNewsletterRow) => {
                openView({
                    title: 'Newsletter Details',
                    description: newsletter.status === 'sent' ? 'Sent newsletter' : 'Draft newsletter',
                    icon: Mail,
                    content: <NewsletterViewContent newsletter={newsletter} />,
                    width: 'lg',
                    closeLabel: 'Close',
                });
            },
            onEdit: (newsletter: IAdminNewsletterRow) => {
                router.push(`/admin/newsletters/${newsletter.id}/edit`);
            },
            onSend: async (newsletter: IAdminNewsletterRow) => {
                await sendAction.mutateAsync(newsletter);
            },
            onDelete: async (newsletter: IAdminNewsletterRow) => {
                await deleteAction.mutateAsync(newsletter);
            },
        }),
        [openView, router, sendAction.mutateAsync, deleteAction.mutateAsync],
    );

    // =============================================================
    // Bulk Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - BulkActionsBar handles invalidation
    // =============================================================

    const bulkDeleteAction = useAction({
        action: async (_rows: IAdminNewsletterRow[], ids: string[]) => bulkDeleteNewsletters(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} newsletters deleted`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete newsletters');
        },
    });

    const bulkActionHandlers: INewsletterBulkActionHandlers = useMemo(
        () => ({
            onBulkDelete: async (rows: IAdminNewsletterRow[], ids: string[]) => {
                await bulkDeleteAction.mutateAsync(rows, ids);
            },
        }),
        [bulkDeleteAction.mutateAsync],
    );

    // =============================================================
    // Table Config with Custom Cell Renderers
    // =============================================================

    const config = useMemo(() => {
        const baseConfig = createNewslettersTableConfig({
            rowActions: rowActionHandlers,
            bulkActions: bulkActionHandlers,
        });

        // Add custom cell renderers
        const columnsWithRenderers = baseConfig.columns.map((col) => {
            // Subject column - Main identifier with icon
            if (col.id === 'subject') {
                return {
                    ...col,
                    cell: (newsletter: IAdminNewsletterRow) => (
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate font-medium">{newsletter.subject}</p>
                                {newsletter.previewText && (
                                    <p className="truncate text-sm text-muted-foreground">
                                        {newsletter.previewText}
                                    </p>
                                )}
                            </div>
                        </div>
                    ),
                };
            }

            // Preview column - Body preview text
            if (col.id === 'preview') {
                return {
                    ...col,
                    cell: (newsletter: IAdminNewsletterRow) => (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                            {newsletter.bodyPreview}
                        </p>
                    ),
                };
            }

            // Status column - Draft/Sent badge
            if (col.id === 'status') {
                return {
                    ...col,
                    cell: (newsletter: IAdminNewsletterRow) => {
                        const isSent = newsletter.status === 'sent';

                        return (
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    isSent
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}
                            >
                                {isSent ? (
                                    <>
                                        <Send className="h-3 w-3" />
                                        Sent
                                    </>
                                ) : (
                                    'Draft'
                                )}
                            </span>
                        );
                    },
                };
            }

            // Recipients column - Show success/total for sent
            if (col.id === 'recipientCount') {
                return {
                    ...col,
                    cell: (newsletter: IAdminNewsletterRow) => {
                        if (newsletter.status !== 'sent') {
                            return <span className="text-sm text-muted-foreground">—</span>;
                        }

                        return (
                            <div className="flex items-center justify-center gap-1 text-sm">
                                <span className="text-green-600 dark:text-green-400">
                                    {newsletter.successCount}
                                </span>
                                <span className="text-muted-foreground">/</span>
                                <span>{newsletter.recipientCount}</span>
                            </div>
                        );
                    },
                };
            }

            // Delivery Rate column - Percentage with visual indicator
            if (col.id === 'deliveryRate') {
                return {
                    ...col,
                    cell: (newsletter: IAdminNewsletterRow) => {
                        if (newsletter.status !== 'sent') {
                            return <span className="text-sm text-muted-foreground">—</span>;
                        }

                        const rate = parseFloat(newsletter.deliveryRate);
                        const colorClass =
                            rate >= 95
                                ? 'text-green-600 dark:text-green-400'
                                : rate >= 80
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-red-600 dark:text-red-400';

                        return (
                            <span className={`text-sm font-medium ${colorClass}`}>
                                {newsletter.deliveryRate}%
                            </span>
                        );
                    },
                };
            }

            // Sent At column - Formatted date or dash
            if (col.id === 'sentAt') {
                return {
                    ...col,
                    cell: (newsletter: IAdminNewsletterRow) => {
                        if (!newsletter.sentAt) {
                            return <span className="text-sm text-muted-foreground">—</span>;
                        }

                        return (
                            <span className="text-sm text-muted-foreground">
                                {formatDate(newsletter.sentAt)}
                            </span>
                        );
                    },
                };
            }

            // Created At column - Formatted date
            if (col.id === 'createdAt') {
                return {
                    ...col,
                    cell: (newsletter: IAdminNewsletterRow) => (
                        <span className="text-sm text-muted-foreground">
                            {formatDate(newsletter.createdAt)}
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
            serverAction={getNewsletters}
            initialData={initialData}
            initialTotal={initialTotal}
        />
    );
}

export default NewslettersTable;
