'use client';

// =============================================================
// SubtopicsTable - Professional Server-Side Table
// Uses DataTable component with server-action-first architecture
// Uses useAction hook for TanStack Query mutation benefits
// =============================================================

import { ListTree } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { StatusBadge } from '@/components/admin';
import { DataTable } from '@/components/admin/table';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { useSnackbar } from '@/hooks/form/useSnackbar';
import { useAction } from '@/hooks/server/useAction';
import { formatDate } from '@/lib/utils';
import type { ISubtopicRow } from '@/server/new/admin/subtopic';
import {
    bulkDeleteSubtopics,
    bulkPublishSubtopics,
    bulkUnpublishSubtopics,
    deleteSubtopic,
    getSubtopics,
    reorderSubtopics,
    toggleSubtopicPublished,
} from '@/server/new/admin/subtopic';

import {
    createSubtopicsTableConfig,
    type ISubtopicActionHandlers,
    type ISubtopicBulkActionHandlers,
} from './config';

// =============================================================
// Types
// =============================================================

interface ISubtopicsTableProps {
    /** Initial server-side data for hydration */
    initialData?: ISubtopicRow[] | undefined;
    /** Initial total count for pagination */
    initialTotal?: number | undefined;
}

// =============================================================
// SubtopicsTable Component
// =============================================================

export function SubtopicsTable({ initialData, initialTotal }: ISubtopicsTableProps): React.ReactElement {
    const { showSuccess, showError } = useSnackbar();

    // =============================================================
    // Row Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - DataTableActions handles invalidation
    // =============================================================

    const togglePublishedAction = useAction({
        action: async (subtopic: ISubtopicRow) => toggleSubtopicPublished(subtopic.id),
        onSuccess: (_data, response, [subtopic]) => {
            showSuccess(response.message ?? (subtopic.published ? 'Subtopic unpublished' : 'Subtopic published'));
        },
        onError: (message) => {
            showError(message ?? 'Failed to toggle publish state');
        },
    });

    const deleteAction = useAction({
        action: async (subtopic: ISubtopicRow) => deleteSubtopic(subtopic.id, subtopic.contentCount > 0),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Subtopic deleted successfully');
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete subtopic');
        },
    });

    const rowActionHandlers: ISubtopicActionHandlers = useMemo(
        () => ({
            onTogglePublished: async (subtopic: ISubtopicRow) => {
                await togglePublishedAction.mutateAsync(subtopic);
            },
            onDelete: async (subtopic: ISubtopicRow) => {
                await deleteAction.mutateAsync(subtopic);
            },
        }),
        [togglePublishedAction.mutateAsync, deleteAction.mutateAsync],
    );

    // =============================================================
    // Bulk Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - BulkActionsBar handles invalidation
    // =============================================================

    const bulkPublishAction = useAction({
        action: async (_rows: ISubtopicRow[], ids: string[]) => bulkPublishSubtopics(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} subtopics published`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to publish subtopics');
        },
    });

    const bulkUnpublishAction = useAction({
        action: async (_rows: ISubtopicRow[], ids: string[]) => bulkUnpublishSubtopics(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} subtopics unpublished`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to unpublish subtopics');
        },
    });

    const bulkDeleteAction = useAction({
        action: async (_rows: ISubtopicRow[], ids: string[]) => bulkDeleteSubtopics(ids, false),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} subtopics deleted`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete subtopics');
        },
    });

    const bulkActionHandlers: ISubtopicBulkActionHandlers = useMemo(
        () => ({
            onBulkPublish: async (rows: ISubtopicRow[], ids: string[]) => {
                await bulkPublishAction.mutateAsync(rows, ids);
            },
            onBulkUnpublish: async (rows: ISubtopicRow[], ids: string[]) => {
                await bulkUnpublishAction.mutateAsync(rows, ids);
            },
            onBulkDelete: async (rows: ISubtopicRow[], ids: string[]) => {
                await bulkDeleteAction.mutateAsync(rows, ids);
            },
        }),
        [
            bulkPublishAction.mutateAsync,
            bulkUnpublishAction.mutateAsync,
            bulkDeleteAction.mutateAsync,
        ],
    );

    // =============================================================
    // Reorder Mutation (using useAction for TanStack Query benefits)
    // CRITICAL: reorderSubtopics requires topicId from first item
    // =============================================================

    const reorderAction = useAction({
        action: async (_items: ISubtopicRow[], topicId: string, ids: string[]) => reorderSubtopics(topicId, ids),
        onSuccess: () => {
            showSuccess('Subtopics reordered successfully');
        },
        onError: (message) => {
            showError(message ?? 'Failed to reorder subtopics');
        },
    });

    // Wrapper to extract topicId and return IApiResponse for reorder config compatibility
    const handleReorder = async (items: ISubtopicRow[], ids: string[]): Promise<IApiResponse<boolean>> => {
        if (items.length === 0) {
            return {
                success: false,
                status: 400,
                error: 'No items to reorder',
            };
        }
        // Extract topicId from first subtopic (all subtopics in table share same topicId)
        const topicId = items[0].topicId;
        return reorderAction.mutateAsync(items, topicId, ids);
    };

    // =============================================================
    // Table Config with Custom Cell Renderers
    // =============================================================

    const config = useMemo(() => {
        const baseConfig = createSubtopicsTableConfig({
            rowActions: rowActionHandlers,
            bulkActions: bulkActionHandlers,
            onReorder: handleReorder,
        });

        // Add custom cell renderers
        const columnsWithRenderers = baseConfig.columns.map((col) => {
            // Subtopic column - Icon + Title + Slug
            if (col.id === 'subtopic') {
                return {
                    ...col,
                    cell: (subtopic: ISubtopicRow) => (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <ListTree className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <Link
                                    href={`/admin/subtopics/${subtopic.id}/edit`}
                                    className="block truncate font-medium hover:text-foreground hover:underline"
                                >
                                    {subtopic.title}
                                </Link>
                                <p className="text-sm text-muted-foreground">/{subtopic.slug}</p>
                            </div>
                        </div>
                    ),
                };
            }

            // Topic column - Parent topic name (link to topic edit)
            if (col.id === 'topic') {
                return {
                    ...col,
                    cell: (subtopic: ISubtopicRow) => (
                        <Link
                            href={`/admin/topics/${subtopic.topicId}/edit`}
                            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                        >
                            {subtopic.topicTitle}
                        </Link>
                    ),
                };
            }

            // Articles count column - Badge with count
            if (col.id === 'contentCount') {
                return {
                    ...col,
                    cell: (subtopic: ISubtopicRow) => (
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium">
                            {subtopic.contentCount}
                        </span>
                    ),
                };
            }

            // Published column - StatusBadge
            if (col.id === 'published') {
                return {
                    ...col,
                    cell: (subtopic: ISubtopicRow) => <StatusBadge variant="published" value={subtopic.published} />,
                };
            }

            // Updated column - Formatted date
            if (col.id === 'updatedAt') {
                return {
                    ...col,
                    cell: (subtopic: ISubtopicRow) => (
                        <span className="text-sm text-muted-foreground">{formatDate(subtopic.updatedAt)}</span>
                    ),
                };
            }

            return col;
        });

        return {
            ...baseConfig,
            columns: columnsWithRenderers,
        };
    }, [rowActionHandlers, bulkActionHandlers, handleReorder]);

    // =============================================================
    // Render
    // =============================================================

    return <DataTable config={config} serverAction={getSubtopics} initialData={initialData} initialTotal={initialTotal} />;
}

export default SubtopicsTable;
