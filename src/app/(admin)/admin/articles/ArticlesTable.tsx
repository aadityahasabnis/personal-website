'use client';

// =============================================================
// ArticlesTable - Professional Server-Side Table
// Uses DataTable component with server-action-first architecture
// Uses useAction hook for TanStack Query mutation benefits
// =============================================================

import { FileText } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { StatusBadge } from '@/components/admin';
import { DataTable } from '@/components/admin/table';
import type { PublishStatusType } from '@/constants/schemaConstants';
import { useSnackbar } from '@/hooks/form/useSnackbar';
import { useAction } from '@/hooks/server/useAction';
import { formatDate } from '@/lib/utils';
import type { IArticleRow } from '@/server/new/admin/content/article';
import {
    bulkArchiveArticles,
    bulkDeleteArticles,
    bulkDraftArticles,
    bulkPublishArticles,
    deleteArticle,
    getArticles,
    setArticleStatus,
    toggleArticleFeatured,
} from '@/server/new/admin/content/article';

import {
    createArticlesTableConfig,
    type IArticleActionHandlers,
    type IArticleBulkActionHandlers,
} from './config';

// =============================================================
// Types
// =============================================================

interface IArticlesTableProps {
    /** Initial server-side data for hydration */
    initialData?: IArticleRow[] | undefined;
    /** Initial total count for pagination */
    initialTotal?: number | undefined;
}

// =============================================================
// ArticlesTable Component
// =============================================================

export function ArticlesTable({ initialData, initialTotal }: IArticlesTableProps): React.ReactElement {
    const { showSuccess, showError } = useSnackbar();

    // =============================================================
    // Row Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - DataTableActions handles invalidation
    // =============================================================

    const setStatusAction = useAction({
        action: async (article: IArticleRow, status: PublishStatusType) => 
            setArticleStatus(article.id, status),
        onSuccess: (_data, response, [, status]) => {
            const statusLabels = { draft: 'Draft', published: 'Published', archived: 'Archived' };
            showSuccess(response.message ?? `Article moved to ${statusLabels[status]}`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to change article status');
        },
    });

    const toggleFeaturedAction = useAction({
        action: async (article: IArticleRow) => toggleArticleFeatured(article.id),
        onSuccess: (_data, response, [article]) => {
            showSuccess(response.message ?? (article.featured ? 'Article unfeatured' : 'Article featured'));
        },
        onError: (message) => {
            showError(message ?? 'Failed to toggle featured state');
        },
    });

    const deleteAction = useAction({
        action: async (article: IArticleRow) => deleteArticle(article.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Article deleted successfully');
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete article');
        },
    });

    const rowActionHandlers: IArticleActionHandlers = useMemo(
        () => ({
            onSetStatus: async (article: IArticleRow, status: PublishStatusType) => {
                await setStatusAction.mutateAsync(article, status);
            },
            onToggleFeatured: async (article: IArticleRow) => {
                await toggleFeaturedAction.mutateAsync(article);
            },
            onDelete: async (article: IArticleRow) => {
                await deleteAction.mutateAsync(article);
            },
        }),
        [setStatusAction.mutateAsync, toggleFeaturedAction.mutateAsync, deleteAction.mutateAsync],
    );

    // =============================================================
    // Bulk Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - BulkActionsBar handles invalidation
    // =============================================================

    const bulkPublishAction = useAction({
        action: async (_rows: IArticleRow[], ids: string[]) => bulkPublishArticles(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} articles published`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to publish articles');
        },
    });

    const bulkDraftAction = useAction({
        action: async (_rows: IArticleRow[], ids: string[]) => bulkDraftArticles(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} articles moved to draft`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to move articles to draft');
        },
    });

    const bulkArchiveAction = useAction({
        action: async (_rows: IArticleRow[], ids: string[]) => bulkArchiveArticles(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} articles archived`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to archive articles');
        },
    });

    const bulkDeleteAction = useAction({
        action: async (_rows: IArticleRow[], ids: string[]) => bulkDeleteArticles(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} articles deleted`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete articles');
        },
    });

    const bulkActionHandlers: IArticleBulkActionHandlers = useMemo(
        () => ({
            onBulkPublish: async (rows: IArticleRow[], ids: string[]) => {
                await bulkPublishAction.mutateAsync(rows, ids);
            },
            onBulkDraft: async (rows: IArticleRow[], ids: string[]) => {
                await bulkDraftAction.mutateAsync(rows, ids);
            },
            onBulkArchive: async (rows: IArticleRow[], ids: string[]) => {
                await bulkArchiveAction.mutateAsync(rows, ids);
            },
            onBulkDelete: async (rows: IArticleRow[], ids: string[]) => {
                await bulkDeleteAction.mutateAsync(rows, ids);
            },
        }),
        [
            bulkPublishAction.mutateAsync,
            bulkDraftAction.mutateAsync,
            bulkArchiveAction.mutateAsync,
            bulkDeleteAction.mutateAsync,
        ],
    );

    // =============================================================
    // Table Config with Custom Cell Renderers
    // =============================================================

    const config = useMemo(() => {
        const baseConfig = createArticlesTableConfig({
            rowActions: rowActionHandlers,
            bulkActions: bulkActionHandlers,
        });

        // Add custom cell renderers
        const columnsWithRenderers = baseConfig.columns.map((col) => {
            // Article column - Icon + Title + Slug
            if (col.id === 'article') {
                return {
                    ...col,
                    cell: (article: IArticleRow) => (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <Link
                                    href={`/admin/articles/${article.id}/edit`}
                                    className="block truncate font-medium hover:text-foreground hover:underline"
                                >
                                    {article.title}
                                </Link>
                                <p className="text-sm text-muted-foreground">/{article.slug}</p>
                            </div>
                        </div>
                    ),
                };
            }

            // Topic column - Parent topic with link
            if (col.id === 'topic') {
                return {
                    ...col,
                    cell: (article: IArticleRow) => (
                        <Link
                            href={`/admin/topics/${article.topicId}/edit`}
                            className="block truncate text-sm hover:text-foreground hover:underline"
                        >
                            {article.topicTitle}
                        </Link>
                    ),
                };
            }

            // Subtopic column - Parent subtopic with link (nullable)
            if (col.id === 'subtopic') {
                return {
                    ...col,
                    cell: (article: IArticleRow) => {
                        if (!article.subtopicId || !article.subtopicTitle) {
                            return <span className="text-sm text-muted-foreground">—</span>;
                        }
                        return (
                            <Link
                                href={`/admin/subtopics/${article.subtopicId}/edit`}
                                className="block truncate text-sm hover:text-foreground hover:underline"
                            >
                                {article.subtopicTitle}
                            </Link>
                        );
                    },
                };
            }

            // Status column - 3-state badge (draft/published/archived)
            if (col.id === 'publishStatus') {
                return {
                    ...col,
                    cell: (article: IArticleRow) => {
                        const { publishStatus } = article;
                        
                        // Custom 3-state status badge for articles
                        const statusConfig = {
                            published: {
                                label: 'Published',
                                className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                            },
                            draft: {
                                label: 'Draft',
                                className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                            },
                            archived: {
                                label: 'Archived',
                                className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                            },
                        };
                        
                        const config = statusConfig[publishStatus];
                        
                        return (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
                                {config.label}
                            </span>
                        );
                    },
                };
            }

            // Featured column - StatusBadge
            if (col.id === 'featured') {
                return {
                    ...col,
                    cell: (article: IArticleRow) => <StatusBadge variant="featured" value={article.featured} />,
                };
            }

            // Reading time column - Minutes badge
            if (col.id === 'readingTime') {
                return {
                    ...col,
                    cell: (article: IArticleRow) => (
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium">
                            {article.readingTime} min
                        </span>
                    ),
                };
            }

            // Updated column - Formatted date
            if (col.id === 'updatedAt') {
                return {
                    ...col,
                    cell: (article: IArticleRow) => (
                        <span className="text-sm text-muted-foreground">{formatDate(article.updatedAt)}</span>
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

    return <DataTable config={config} serverAction={getArticles} initialData={initialData} initialTotal={initialTotal} />;
}

export default ArticlesTable;
