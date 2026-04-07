'use client';

// =============================================================
// TopicsTable - Professional Server-Side Table
// Uses DataTable component with server-action-first architecture
// Uses useAction hook for TanStack Query mutation benefits
// =============================================================

import { Layers } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { StatusBadge } from '@/components/admin';
import { DataTable } from '@/components/admin/table';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { useSnackbar } from '@/hooks/form/useSnackbar';
import { useAction } from '@/hooks/server/useAction';
import { formatDate } from '@/lib/utils';
import type { ITopicRow } from '@/server/new/admin/topic';
import {
    bulkDeleteTopics,
    bulkFeatureTopics,
    bulkPublishTopics,
    bulkUnfeatureTopics,
    bulkUnpublishTopics,
    deleteTopic,
    getTopics,
    reorderTopics,
    toggleTopicFeatured,
    toggleTopicPublished,
} from '@/server/new/admin/topic';

import {
    createTopicsTableConfig,
    type ITopicActionHandlers,
    type ITopicBulkActionHandlers,
} from './config';

// =============================================================
// Types
// =============================================================

interface ITopicsTableProps {
    /** Initial server-side data for hydration */
    initialData?: ITopicRow[] | undefined;
    /** Initial total count for pagination */
    initialTotal?: number | undefined;
}

// =============================================================
// TopicsTable Component
// =============================================================

export function TopicsTable({ initialData, initialTotal }: ITopicsTableProps): React.ReactElement {
    const { showSuccess, showError } = useSnackbar();

    // =============================================================
    // Row Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - DataTableActions handles invalidation
    // =============================================================

    const togglePublishedAction = useAction({
        action: async (topic: ITopicRow) => toggleTopicPublished(topic.id),
        onSuccess: (_data, response, [topic]) => {
            showSuccess(response.message ?? (topic.published ? 'Topic unpublished' : 'Topic published'));
        },
        onError: (message) => {
            showError(message ?? 'Failed to toggle publish state');
        },
    });

    const toggleFeaturedAction = useAction({
        action: async (topic: ITopicRow) => toggleTopicFeatured(topic.id),
        onSuccess: (_data, response, [topic]) => {
            showSuccess(response.message ?? (topic.featured ? 'Topic unfeatured' : 'Topic featured'));
        },
        onError: (message) => {
            showError(message ?? 'Failed to toggle featured state');
        },
    });

    const deleteAction = useAction({
        action: async (topic: ITopicRow) => deleteTopic(topic.id, topic.contentCount > 0),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Topic deleted successfully');
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete topic');
        },
    });

    const rowActionHandlers: ITopicActionHandlers = useMemo(
        () => ({
            onTogglePublished: async (topic: ITopicRow) => {
                await togglePublishedAction.mutateAsync(topic);
            },
            onToggleFeatured: async (topic: ITopicRow) => {
                await toggleFeaturedAction.mutateAsync(topic);
            },
            onDelete: async (topic: ITopicRow) => {
                await deleteAction.mutateAsync(topic);
            },
        }),
        [togglePublishedAction.mutateAsync, toggleFeaturedAction.mutateAsync, deleteAction.mutateAsync],
    );

    // =============================================================
    // Bulk Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - BulkActionsBar handles invalidation
    // =============================================================

    const bulkPublishAction = useAction({
        action: async (_rows: ITopicRow[], ids: string[]) => bulkPublishTopics(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} topics published`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to publish topics');
        },
    });

    const bulkUnpublishAction = useAction({
        action: async (_rows: ITopicRow[], ids: string[]) => bulkUnpublishTopics(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} topics unpublished`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to unpublish topics');
        },
    });

    const bulkFeatureAction = useAction({
        action: async (_rows: ITopicRow[], ids: string[]) => bulkFeatureTopics(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} topics featured`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to feature topics');
        },
    });

    const bulkUnfeatureAction = useAction({
        action: async (_rows: ITopicRow[], ids: string[]) => bulkUnfeatureTopics(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} topics unfeatured`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to unfeature topics');
        },
    });

    const bulkDeleteAction = useAction({
        action: async (_rows: ITopicRow[], ids: string[]) => bulkDeleteTopics(ids, false),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} topics deleted`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete topics');
        },
    });

    const bulkActionHandlers: ITopicBulkActionHandlers = useMemo(
        () => ({
            onBulkPublish: async (rows: ITopicRow[], ids: string[]) => {
                await bulkPublishAction.mutateAsync(rows, ids);
            },
            onBulkUnpublish: async (rows: ITopicRow[], ids: string[]) => {
                await bulkUnpublishAction.mutateAsync(rows, ids);
            },
            onBulkFeature: async (rows: ITopicRow[], ids: string[]) => {
                await bulkFeatureAction.mutateAsync(rows, ids);
            },
            onBulkUnfeature: async (rows: ITopicRow[], ids: string[]) => {
                await bulkUnfeatureAction.mutateAsync(rows, ids);
            },
            onBulkDelete: async (rows: ITopicRow[], ids: string[]) => {
                await bulkDeleteAction.mutateAsync(rows, ids);
            },
        }),
        [
            bulkPublishAction.mutateAsync,
            bulkUnpublishAction.mutateAsync,
            bulkFeatureAction.mutateAsync,
            bulkUnfeatureAction.mutateAsync,
            bulkDeleteAction.mutateAsync,
        ],
    );

    // =============================================================
    // Reorder Mutation (using useAction for TanStack Query benefits)
    // =============================================================

    const reorderAction = useAction({
        action: async (_items: ITopicRow[], ids: string[]) => reorderTopics(ids),
        onSuccess: () => {
            showSuccess('Topics reordered successfully');
        },
        onError: (message) => {
            showError(message ?? 'Failed to reorder topics');
        },
    });

    // Wrapper to return IApiResponse for reorder config compatibility
    const handleReorder = async (_items: ITopicRow[], ids: string[]): Promise<IApiResponse<boolean>> => {
        return reorderAction.mutateAsync(_items, ids);
    };

    // =============================================================
    // Table Config with Custom Cell Renderers
    // =============================================================

    const config = useMemo(() => {
        const baseConfig = createTopicsTableConfig({
            rowActions: rowActionHandlers,
            bulkActions: bulkActionHandlers,
            onReorder: handleReorder,
        });

        // Add custom cell renderers
        const columnsWithRenderers = baseConfig.columns.map((col) => {
            // Topic column - Icon + Title + Slug
            if (col.id === 'topic') {
                return {
                    ...col,
                    cell: (topic: ITopicRow) => (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Layers className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <Link
                                    href={`/admin/topics/${topic.id}/edit`}
                                    className="block truncate font-medium hover:text-foreground hover:underline"
                                >
                                    {topic.title}
                                </Link>
                                <p className="text-sm text-muted-foreground">/{topic.slug}</p>
                            </div>
                        </div>
                    ),
                };
            }

            // Articles count column - Badge with count
            if (col.id === 'contentCount') {
                return {
                    ...col,
                    cell: (topic: ITopicRow) => (
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium">
                            {topic.contentCount}
                        </span>
                    ),
                };
            }

            // Published column - StatusBadge
            if (col.id === 'published') {
                return {
                    ...col,
                    cell: (topic: ITopicRow) => <StatusBadge variant="published" value={topic.published} />,
                };
            }

            // Featured column - StatusBadge
            if (col.id === 'featured') {
                return {
                    ...col,
                    cell: (topic: ITopicRow) => <StatusBadge variant="featured" value={topic.featured} />,
                };
            }

            // Updated column - Formatted date
            if (col.id === 'updatedAt') {
                return {
                    ...col,
                    cell: (topic: ITopicRow) => (
                        <span className="text-sm text-muted-foreground">{formatDate(topic.updatedAt)}</span>
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

    return <DataTable config={config} serverAction={getTopics} initialData={initialData} initialTotal={initialTotal} />;
}

export default TopicsTable;
