'use client';

// =============================================================
// TopicsTable - Professional Config-Driven Table Component
// Server-Side with TanStack Query Caching
// =============================================================

import Link from 'next/link';
import { useCallback, useMemo } from 'react';
import { Layers } from 'lucide-react';

import { DataTable, StatusBadge } from '@/components/admin';
import type { IServerQueryParams } from '@/components/admin/table';
import { useSnackbar } from '@/hooks/form/useSnackbar';
import type { IPaginatedResponse } from '@/interfaces/actionHelper';
import type { ITopicRow } from '@/server/new/admin/topic';
import {
    bulkFeatureTopics,
    bulkPublishTopics,
    bulkUnfeatureTopics,
    bulkUnpublishTopics,
    bulkDeleteTopics,
    deleteTopic,
    reorderTopics,
    toggleTopicFeatured,
    toggleTopicPublished,
    getTopics,
} from '@/server/new/admin/topic';
import { formatDate } from '@/lib/utils';

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
}

// =============================================================
// TopicsTable Component
// =============================================================

export function TopicsTable({ initialData }: ITopicsTableProps): React.ReactElement {
    const { showSuccess, showError } = useSnackbar();

    // =============================================================
    // Server Query Function (with TanStack Query caching)
    // =============================================================

    const serverQueryFn = useCallback(async (params: IServerQueryParams): Promise<IPaginatedResponse<ITopicRow>> => {
        // Convert generic params to topic-specific query
        // Build query object conditionally to satisfy exactOptionalPropertyTypes
        const query: {
            query?: string;
            pagination?: { limit: number; offset: number };
            sort?: { sortBy: string; sortOrder: 'asc' | 'desc' };
            published?: boolean;
            featured?: boolean;
        } = {};

        // Only add optional fields if they are defined
        if (params.query !== undefined) {
            query.query = params.query;
        }
        if (params.pagination !== undefined) {
            query.pagination = params.pagination;
        }
        if (params.sort !== undefined) {
            query.sort = params.sort;
        }
        if (params.published !== undefined) {
            query.published = params.published as boolean;
        }
        if (params.featured !== undefined) {
            query.featured = params.featured as boolean;
        }

        const result = await getTopics(query);

        return result;
    }, []);

    // =============================================================
    // Row Action Handlers
    // =============================================================

    const rowActionHandlers: ITopicActionHandlers = useMemo(
        () => ({
            onTogglePublished: async (topic: ITopicRow) => {
                const result = await toggleTopicPublished(topic.id);
                if (result.success) {
                    showSuccess(result.message ?? (topic.published ? 'Topic unpublished' : 'Topic published'));
                } else {
                    showError(result.error ?? 'Failed to toggle publish state');
                }
            },

            onToggleFeatured: async (topic: ITopicRow) => {
                const result = await toggleTopicFeatured(topic.id);
                if (result.success) {
                    showSuccess(result.message ?? (topic.featured ? 'Topic unfeatured' : 'Topic featured'));
                } else {
                    showError(result.error ?? 'Failed to toggle featured state');
                }
            },

            onDelete: async (topic: ITopicRow) => {
                const result = await deleteTopic(topic.id, topic.contentCount > 0);
                if (result.success) {
                    showSuccess(result.message ?? 'Topic deleted successfully');
                } else {
                    showError(result.error ?? 'Failed to delete topic');
                }
            },
        }),
        [showSuccess, showError]
    );

    // =============================================================
    // Bulk Action Handlers
    // =============================================================

    const bulkActionHandlers: ITopicBulkActionHandlers = useMemo(
        () => ({
            onBulkPublish: async (_rows: ITopicRow[], ids: string[]) => {
                const result = await bulkPublishTopics(ids);
                if (result.success) {
                    showSuccess(result.message ?? `${ids.length} topics published`);
                } else {
                    showError(result.error ?? 'Failed to publish topics');
                }
            },

            onBulkUnpublish: async (_rows: ITopicRow[], ids: string[]) => {
                const result = await bulkUnpublishTopics(ids);
                if (result.success) {
                    showSuccess(result.message ?? `${ids.length} topics unpublished`);
                } else {
                    showError(result.error ?? 'Failed to unpublish topics');
                }
            },

            onBulkFeature: async (_rows: ITopicRow[], ids: string[]) => {
                const result = await bulkFeatureTopics(ids);
                if (result.success) {
                    showSuccess(result.message ?? `${ids.length} topics featured`);
                } else {
                    showError(result.error ?? 'Failed to feature topics');
                }
            },

            onBulkUnfeature: async (_rows: ITopicRow[], ids: string[]) => {
                const result = await bulkUnfeatureTopics(ids);
                if (result.success) {
                    showSuccess(result.message ?? `${ids.length} topics unfeatured`);
                } else {
                    showError(result.error ?? 'Failed to unfeature topics');
                }
            },

            onBulkDelete: async (_rows: ITopicRow[], ids: string[]) => {
                const result = await bulkDeleteTopics(ids, true);
                if (result.success) {
                    showSuccess(result.message ?? `${ids.length} topics deleted`);
                } else {
                    showError(result.error ?? 'Failed to delete topics');
                }
            },
        }),
        [showSuccess, showError]
    );

    // =============================================================
    // Reorder Handler
    // =============================================================

    const handleReorder = useCallback(
        async (_items: ITopicRow[], ids: string[]) => {
            const result = await reorderTopics(ids);
            if (result.success) {
                showSuccess(result.message ?? 'Topics reordered');
            } else {
                showError(result.error ?? 'Failed to reorder topics');
            }
            return result;
        },
        [showSuccess, showError]
    );

    // =============================================================
    // Table Configuration
    // =============================================================

    const tableConfig = useMemo(
        () =>
            createTopicsTableConfig({
                rowActions: rowActionHandlers,
                bulkActions: bulkActionHandlers,
                onReorder: handleReorder,
            }),
        [rowActionHandlers, bulkActionHandlers, handleReorder]
    );

    // =============================================================
    // Custom Column Renderers
    // Override default column rendering for complex cells
    // =============================================================

    const columnsWithRenderers = useMemo(() => {
        return tableConfig.columns.map((column) => {
            switch (column.id) {
                case 'topic':
                    return {
                        ...column,
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

                case 'contentCount':
                    return {
                        ...column,
                        cell: (topic: ITopicRow) => (
                            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium">
                                {topic.contentCount}
                            </span>
                        ),
                    };

                case 'published':
                    return {
                        ...column,
                        cell: (topic: ITopicRow) => (
                            <StatusBadge variant="published" value={topic.published} />
                        ),
                    };

                case 'featured':
                    return {
                        ...column,
                        cell: (topic: ITopicRow) => (
                            <StatusBadge variant="featured" value={topic.featured} />
                        ),
                    };

                case 'updatedAt':
                    return {
                        ...column,
                        cell: (topic: ITopicRow) => (
                            <span className="text-sm text-muted-foreground">
                                {formatDate(topic.updatedAt)}
                            </span>
                        ),
                    };

                default:
                    return column;
            }
        });
    }, [tableConfig.columns]);

    // Create final config with custom renderers
    const finalConfig = useMemo(
        () => ({
            ...tableConfig,
            columns: columnsWithRenderers,
        }),
        [tableConfig, columnsWithRenderers]
    );

    // =============================================================
    // Render
    // =============================================================

    return (
        <DataTable<ITopicRow>
            config={finalConfig}
            serverAction={serverQueryFn}
            initialData={initialData}
        />
    );
}

export default TopicsTable;
