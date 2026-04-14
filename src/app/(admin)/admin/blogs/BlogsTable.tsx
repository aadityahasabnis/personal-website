'use client';

// =============================================================
// BlogsTable - Professional Server-Side Table
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
import type { IBlogRow } from '@/server/new/admin/content/blog';
import { bulkArchiveBlogs, bulkDeleteBlogs, bulkDraftBlogs, bulkPublishBlogs, deleteBlog, getBlogs, setBlogStatus, toggleBlogFeatured } from '@/server/new/admin/content/blog';

import { createBlogsTableConfig, type IBlogActionHandlers, type IBlogBulkActionHandlers } from './config';

// =============================================================
// Types
// =============================================================

interface IBlogsTableProps {
    /** Initial server-side data for hydration */
    initialData?: IBlogRow[] | undefined;
    /** Initial total count for pagination */
    initialTotal?: number | undefined;
}

// =============================================================
// BlogsTable Component
// =============================================================

export function BlogsTable({ initialData, initialTotal }: IBlogsTableProps): React.ReactElement {
    const { showSuccess, showError } = useSnackbar();

    // =============================================================
    // Row Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - DataTableActions handles invalidation
    // =============================================================

    const setStatusAction = useAction({
        action: async (blog: IBlogRow, status: PublishStatusType) => setBlogStatus(blog.id, status),
        onSuccess: (_data, response, [, status]) => {
            const statusLabels = { draft: 'Draft', published: 'Published', archived: 'Archived' };
            showSuccess(response.message ?? `Blog moved to ${statusLabels[status]}`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to change blog status');
        },
    });

    const toggleFeaturedAction = useAction({
        action: async (blog: IBlogRow) => toggleBlogFeatured(blog.id),
        onSuccess: (_data, response, [blog]) => {
            showSuccess(response.message ?? (blog.featured ? 'Blog unfeatured' : 'Blog featured'));
        },
        onError: (message) => {
            showError(message ?? 'Failed to toggle featured state');
        },
    });

    const deleteAction = useAction({
        action: async (blog: IBlogRow) => deleteBlog(blog.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Blog deleted successfully');
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete blog');
        },
    });

    const rowActionHandlers: IBlogActionHandlers = useMemo(
        () => ({
            onSetStatus: async (blog: IBlogRow, status: PublishStatusType) => {
                await setStatusAction.mutateAsync(blog, status);
            },
            onToggleFeatured: async (blog: IBlogRow) => {
                await toggleFeaturedAction.mutateAsync(blog);
            },
            onDelete: async (blog: IBlogRow) => {
                await deleteAction.mutateAsync(blog);
            },
        }),
        [setStatusAction.mutateAsync, toggleFeaturedAction.mutateAsync, deleteAction.mutateAsync],
    );

    // =============================================================
    // Bulk Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - BulkActionsBar handles invalidation
    // =============================================================

    const bulkPublishAction = useAction({
        action: async (_rows: IBlogRow[], ids: string[]) => bulkPublishBlogs(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} blogs published`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to publish blogs');
        },
    });

    const bulkDraftAction = useAction({
        action: async (_rows: IBlogRow[], ids: string[]) => bulkDraftBlogs(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} blogs moved to draft`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to move blogs to draft');
        },
    });

    const bulkArchiveAction = useAction({
        action: async (_rows: IBlogRow[], ids: string[]) => bulkArchiveBlogs(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} blogs archived`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to archive blogs');
        },
    });

    const bulkDeleteAction = useAction({
        action: async (_rows: IBlogRow[], ids: string[]) => bulkDeleteBlogs(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} blogs deleted`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete blogs');
        },
    });

    const bulkActionHandlers: IBlogBulkActionHandlers = useMemo(
        () => ({
            onBulkPublish: async (rows: IBlogRow[], ids: string[]) => {
                await bulkPublishAction.mutateAsync(rows, ids);
            },
            onBulkDraft: async (rows: IBlogRow[], ids: string[]) => {
                await bulkDraftAction.mutateAsync(rows, ids);
            },
            onBulkArchive: async (rows: IBlogRow[], ids: string[]) => {
                await bulkArchiveAction.mutateAsync(rows, ids);
            },
            onBulkDelete: async (rows: IBlogRow[], ids: string[]) => {
                await bulkDeleteAction.mutateAsync(rows, ids);
            },
        }),
        [bulkPublishAction.mutateAsync, bulkDraftAction.mutateAsync, bulkArchiveAction.mutateAsync, bulkDeleteAction.mutateAsync],
    );

    // =============================================================
    // Table Config with Custom Cell Renderers
    // =============================================================

    const config = useMemo(() => {
        const baseConfig = createBlogsTableConfig({
            rowActions: rowActionHandlers,
            bulkActions: bulkActionHandlers,
        });

        // Add custom cell renderers
        const columnsWithRenderers = baseConfig.columns.map((col) => {
            // Blog column - Icon + Title + Slug
            if (col.id === 'blog') {
                return {
                    ...col,
                    cell: (blog: IBlogRow) => (
                        <div className='flex items-center gap-3'>
                            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                                <FileText className='h-5 w-5' />
                            </div>
                            <div className='min-w-0'>
                                <Link href={`/admin/blogs/${blog.id}/edit`} className='block truncate font-medium hover:text-foreground hover:underline'>
                                    {blog.title}
                                </Link>
                                <p className='text-sm text-muted-foreground'>/{blog.slug}</p>
                            </div>
                        </div>
                    ),
                };
            }

            // Status column - 3-state badge (draft/published/archived)
            if (col.id === 'publishStatus') {
                return {
                    ...col,
                    cell: (blog: IBlogRow) => {
                        const { publishStatus } = blog;

                        // Custom 3-state status badge for blogs
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

                        return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>{config.label}</span>;
                    },
                };
            }

            // Featured column - StatusBadge
            if (col.id === 'featured') {
                return {
                    ...col,
                    cell: (blog: IBlogRow) => <StatusBadge variant='featured' value={blog.featured} />,
                };
            }

            // Reading time column - Minutes badge
            if (col.id === 'readingTime') {
                return {
                    ...col,
                    cell: (blog: IBlogRow) => <span className='inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium'>{blog.readingTime} min</span>,
                };
            }

            // Updated column - Formatted date
            if (col.id === 'updatedAt') {
                return {
                    ...col,
                    cell: (blog: IBlogRow) => <span className='text-sm text-muted-foreground'>{formatDate(blog.updatedAt)}</span>,
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

    return <DataTable config={config} serverAction={getBlogs} initialData={initialData} initialTotal={initialTotal} />;
}

export default BlogsTable;
