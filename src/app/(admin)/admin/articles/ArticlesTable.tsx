'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Calendar, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAdminTable } from '@/hooks';
import type { IArticle, ITopic } from '@/interfaces/schema';
import {
    DataTable, TableSearch, BulkActionsBar, StatusBadge, DataTableActions,
    createEditAction, createDeleteAction, createTogglePublishedAction, createToggleFeaturedAction,
    createBulkDeleteActionNew, createBulkPublishAction, createBulkUnpublishAction,
    createBulkFeatureAction, createBulkUnfeatureAction,
    type IDataTableColumn, type IBulkActionNew, type ITableFilter,
} from '@/components/admin';
import { deleteArticle, toggleArticlePublished, toggleArticleFeatured } from '@/server/actions/articles';
import { Button } from '@/components/ui/button';

interface IArticlesTableProps {
    articles: IArticle[];
    topics: ITopic[];
}

export function ArticlesTable({ articles, topics }: IArticlesTableProps): React.ReactElement {
    const table = useAdminTable({
        data: articles,
        keyExtractor: (a) => a.slug,
        searchFn: (article, query) =>
            article.title.toLowerCase().includes(query) ||
            article.description?.toLowerCase().includes(query) ||
            article.tags?.some((tag) => tag.toLowerCase().includes(query)) || false,
    });

    // ===== FILTERS =====

    const tableFilters: ITableFilter[] = useMemo(() => [
        {
            id: 'topicSlug',
            label: 'Topic',
            type: 'select',
            options: [
                { label: 'All Topics', value: 'all' },
                ...topics.map((t) => ({ label: t.title, value: t.slug })),
            ],
        },
        {
            id: 'published',
            label: 'Status',
            type: 'select',
            options: [
                { label: 'All Statuses', value: 'all' },
                { label: 'Published', value: 'true' },
                { label: 'Draft', value: 'false' },
            ],
        },
        {
            id: 'featured',
            label: 'Featured',
            type: 'select',
            options: [
                { label: 'All', value: 'all' },
                { label: 'Featured Only', value: 'true' },
                { label: 'Not Featured', value: 'false' },
            ],
        },
    ], [topics]);

    // ===== ACTIONS =====

    const handleTogglePublished = useCallback((article: IArticle) =>
        table.optimisticUpdate(
            article.slug,
            (a) => ({ ...a, published: !a.published, publishedAt: !a.published ? new Date() : a.publishedAt }),
            () => toggleArticlePublished(article.topicSlug, article.slug)
        ), [table]);

    const handleToggleFeatured = useCallback((article: IArticle) =>
        table.optimisticUpdate(
            article.slug,
            (a) => ({ ...a, featured: !a.featured }),
            () => toggleArticleFeatured(article.topicSlug, article.slug)
        ), [table]);

    const handleDelete = useCallback((article: IArticle) =>
        table.optimisticDelete(article.slug, () => deleteArticle(article.topicSlug, article.slug)), [table]);

    // ===== ROW ACTIONS =====

    const getRowActions = useCallback((article: IArticle) => [
        createEditAction(`/admin/articles/${article.topicSlug}/${article.slug}/edit`),
        createTogglePublishedAction(article.published, () => handleTogglePublished(article)),
        createToggleFeaturedAction(article.featured || false, () => handleToggleFeatured(article)),
        createDeleteAction(() => handleDelete(article), `"${article.title}"`),
    ], [handleTogglePublished, handleToggleFeatured, handleDelete]);

    // ===== COLUMNS =====

    const columns: IDataTableColumn<IArticle>[] = useMemo(() => [
        {
            id: 'article',
            header: 'Article',
            accessor: (article) => (
                <div className="min-w-0 max-w-md">
                    <Link href={`/admin/articles/${article.topicSlug}/${article.slug}/edit`} className="font-medium hover:underline line-clamp-1 block">
                        {article.title}
                    </Link>
                    {article.description && <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{article.description}</p>}
                </div>
            ),
            width: '350px',
        },
        {
            id: 'topic',
            header: 'Topic',
            cell: (article) => {
                const topic = topics.find((t) => t.slug === article.topicSlug);
                return (
                    <span className="text-sm text-muted-foreground">
                        {topic?.title || article.topicSlug}
                        {article.subtopicSlug && <span className="text-xs"> / {article.subtopicSlug}</span>}
                    </span>
                );
            },
            width: '180px',
        },
        { id: 'published', header: 'Status', cell: (a) => <StatusBadge variant="published" value={a.published} />, align: 'center', width: '100px' },
        { id: 'featured', header: 'Featured', cell: (a) => <StatusBadge variant="featured" value={a.featured || false} />, align: 'center', width: '100px' },
        {
            id: 'readingTime',
            header: 'Read Time',
            cell: (a) => <span className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="h-3 w-3" />{a.readingTime || 0}m</span>,
            width: '100px',
        },
        {
            id: 'updated',
            header: 'Updated',
            cell: (a) => <span className="flex items-center gap-1 text-sm text-muted-foreground"><Calendar className="h-3 w-3" />{formatDate(a.updatedAt)}</span>,
            width: '140px',
        },
        { id: 'actions', header: '', cell: (a) => <DataTableActions actions={getRowActions(a)} itemName={`"${a.title}"`} />, align: 'right', width: '60px' },
    ], [topics, getRowActions]);

    // ===== BULK ACTIONS =====

    const handleBulkPublish = useCallback(async (ids: string[]) => {
        await table.optimisticBulkUpdate(
            ids,
            (a) => ({ ...a, published: true, publishedAt: a.publishedAt || new Date() }),
            async () => {
                for (const id of ids) {
                    const article = articles.find((a) => a.slug === id);
                    if (article && !article.published) await toggleArticlePublished(article.topicSlug, article.slug);
                }
            }
        );
    }, [table, articles]);

    const handleBulkUnpublish = useCallback(async (ids: string[]) => {
        await table.optimisticBulkUpdate(
            ids,
            (a) => ({ ...a, published: false }),
            async () => {
                for (const id of ids) {
                    const article = articles.find((a) => a.slug === id);
                    if (article && article.published) await toggleArticlePublished(article.topicSlug, article.slug);
                }
            }
        );
    }, [table, articles]);

    const handleBulkFeature = useCallback(async (ids: string[]) => {
        await table.optimisticBulkUpdate(
            ids,
            (a) => ({ ...a, featured: true }),
            async () => {
                for (const id of ids) {
                    const article = articles.find((a) => a.slug === id);
                    if (article && !article.featured) await toggleArticleFeatured(article.topicSlug, article.slug);
                }
            }
        );
    }, [table, articles]);

    const handleBulkUnfeature = useCallback(async (ids: string[]) => {
        await table.optimisticBulkUpdate(
            ids,
            (a) => ({ ...a, featured: false }),
            async () => {
                for (const id of ids) {
                    const article = articles.find((a) => a.slug === id);
                    if (article && article.featured) await toggleArticleFeatured(article.topicSlug, article.slug);
                }
            }
        );
    }, [table, articles]);

    const handleBulkDelete = useCallback(async (ids: string[]) => {
        for (const id of ids) {
            const article = articles.find((a) => a.slug === id);
            if (article) await table.optimisticDelete(id, () => deleteArticle(article.topicSlug, article.slug));
        }
    }, [table, articles]);

    const bulkActions: IBulkActionNew[] = useMemo(() => [
        createBulkPublishAction(handleBulkPublish),
        createBulkUnpublishAction(handleBulkUnpublish),
        createBulkFeatureAction(handleBulkFeature),
        createBulkUnfeatureAction(handleBulkUnfeature),
        createBulkDeleteActionNew(handleBulkDelete),
    ], [handleBulkPublish, handleBulkUnpublish, handleBulkFeature, handleBulkUnfeature, handleBulkDelete]);

    // ===== RENDER =====

    return (
        <div className="space-y-6">
            <TableSearch
                placeholder="Search articles..."
                onSearch={table.setSearchQuery}
                filters={tableFilters}
                onFilterChange={table.setFilters}
                activeFiltersCount={table.activeFiltersCount}
            />
            <DataTable
                data={table.displayedItems}
                columns={columns}
                keyExtractor={(a) => a.slug}
                selectable
                selectedIds={table.selectedIds}
                onSelectionChange={table.setSelectedIds}
                infiniteScroll
                hasMore={table.hasMore}
                onLoadMore={async () => table.loadMore()}
                isLoading={table.isPending}
                emptyState={
                    <div className="p-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No articles found</h3>
                        <p className="mt-2 text-muted-foreground">
                            {table.searchQuery || table.activeFiltersCount > 0 ? 'Try adjusting your search or filters' : 'Create your first article to get started'}
                        </p>
                        {!table.searchQuery && table.activeFiltersCount === 0 && (
                            <Link href="/admin/articles/new"><Button className="mt-6">Create Article</Button></Link>
                        )}
                    </div>
                }
            />
            <BulkActionsBar
                selectedCount={table.selectedIds.length}
                totalCount={table.displayedItems.length}
                actions={bulkActions}
                onClear={table.clearSelection}
                onAction={(action) => action.action(table.selectedIds)}
            />
        </div>
    );
}
