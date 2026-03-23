'use client';

import { Layers } from 'lucide-react';
import Link from 'next/link';

import {
    BulkActionsBar,
    DataTable,
    DataTableActions,
    StatusBadge,
    TableSearch,
    createBulkDeleteActionNew,
    createBulkFeatureAction,
    createBulkPublishAction,
    createBulkUnfeatureAction,
    createBulkUnpublishAction,
    createDeleteAction,
    createEditAction,
    createToggleFeaturedAction,
    createTogglePublishedAction,
    type IBulkActionNew,
    type IDataTableColumn,
    type ITableFilter,
} from '@/components/admin';
import { Button } from '@/components/ui/button';
import { useAdminTable } from '@/hooks';
import type { ITopic } from '@/interfaces/schema';
import { formatDate } from '@/lib/utils';
import { deleteTopic, reorderTopics, toggleTopicFeatured, toggleTopicPublished } from '@/server/actions/topics';

// ===== FILTERS CONFIG =====

const TABLE_FILTERS: ITableFilter[] = [
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
];

// ===== COMPONENT =====

interface ITopicsTableProps {
    topics: ITopic[];
}

export function TopicsTable({ topics }: ITopicsTableProps): React.ReactElement {
    const table = useAdminTable({
        tableKey: 'admin-topics',
        data: topics,
        keyExtractor: (topic) => topic.slug,
        searchFn: (topic, query) => topic.title.toLowerCase().includes(query) || topic.slug.toLowerCase().includes(query) || topic.description?.toLowerCase().includes(query) || false,
    });

    // ===== ROW ACTIONS =====

    const getRowActions = (topic: ITopic) => [
        createEditAction(`/admin/topics/${topic.slug}/edit`),
        createTogglePublishedAction(topic.published || false, () =>
            table.optimisticUpdate(
                topic.slug,
                (t) => ({ ...t, published: !t.published }),
                () => toggleTopicPublished(topic.slug),
            ),
        ),
        createToggleFeaturedAction(topic.featured || false, () =>
            table.optimisticUpdate(
                topic.slug,
                (t) => ({ ...t, featured: !t.featured }),
                () => toggleTopicFeatured(topic.slug),
            ),
        ),
        createDeleteAction(() => table.optimisticDelete(topic.slug, () => deleteTopic(topic.slug)), `"${topic.title}"`),
    ];

    // ===== COLUMNS =====

    const columns: IDataTableColumn<ITopic>[] = [
        {
            id: 'topic',
            header: 'Topic',
            accessor: (topic) => (
                <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0'>
                        <Layers className='h-5 w-5' />
                    </div>
                    <div className='min-w-0'>
                        <Link href={`/admin/topics/${topic.slug}/edit`} className='font-medium hover:underline hover:text-foreground line-clamp-1 block'>
                            {topic.title}
                        </Link>
                        <p className='text-sm text-muted-foreground'>/{topic.slug}</p>
                    </div>
                </div>
            ),
            width: '300px',
        },
        {
            id: 'articles',
            header: 'Articles',
            cell: (topic) => <span className='inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium'>{topic.metadata?.articleCount ?? 0}</span>,
            align: 'center',
            width: '100px',
        },
        {
            id: 'published',
            header: 'Status',
            cell: (topic) => <StatusBadge variant='published' value={topic.published || false} />,
            align: 'center',
            width: '120px',
        },
        {
            id: 'featured',
            header: 'Featured',
            cell: (topic) => <StatusBadge variant='featured' value={topic.featured || false} />,
            align: 'center',
            width: '100px',
        },
        {
            id: 'updated',
            header: 'Last Updated',
            cell: (topic) => <div className='text-sm text-muted-foreground'>{formatDate(topic.updatedAt)}</div>,
            width: '150px',
        },
        {
            id: 'actions',
            header: '',
            cell: (topic) => <DataTableActions actions={getRowActions(topic)} itemName={`"${topic.title}"`} />,
            align: 'right',
            width: '60px',
        },
    ];

    // ===== BULK ACTIONS =====

    const bulkActions: IBulkActionNew[] = [
        createBulkPublishAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (t) => ({ ...t, published: true }),
                async () => {
                    await Promise.all(ids.filter((id) => !table.items.find((t) => t.slug === id)?.published).map((id) => toggleTopicPublished(id)));
                },
            ),
        ),
        createBulkUnpublishAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (t) => ({ ...t, published: false }),
                async () => {
                    await Promise.all(ids.filter((id) => table.items.find((t) => t.slug === id)?.published).map((id) => toggleTopicPublished(id)));
                },
            ),
        ),
        createBulkFeatureAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (t) => ({ ...t, featured: true }),
                async () => {
                    await Promise.all(ids.filter((id) => !table.items.find((t) => t.slug === id)?.featured).map((id) => toggleTopicFeatured(id)));
                },
            ),
        ),
        createBulkUnfeatureAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (t) => ({ ...t, featured: false }),
                async () => {
                    await Promise.all(ids.filter((id) => table.items.find((t) => t.slug === id)?.featured).map((id) => toggleTopicFeatured(id)));
                },
            ),
        ),
        createBulkDeleteActionNew(async (ids) => {
            await Promise.all(ids.map((id) => table.optimisticDelete(id, () => deleteTopic(id))));
        }),
    ];

    // ===== REORDER HANDLER =====

    const handleReorder = async (newOrder: ITopic[]) => {
        const slugs = newOrder.map((t) => t.slug);
        table.startTransition(async () => {
            await reorderTopics(slugs);
            table.refresh();
        });
    };

    // ===== RENDER =====

    return (
        <div className='space-y-6'>
            <TableSearch
                placeholder='Search topics by title or slug...'
                onSearch={table.setSearchQuery}
                filters={TABLE_FILTERS}
                onFilterChange={table.setFilters}
                activeFiltersCount={table.activeFiltersCount}
            />

            <DataTable
                data={table.displayedItems}
                columns={columns}
                keyExtractor={(topic) => topic.slug}
                selectable
                selectedIds={table.selectedIds}
                onSelectionChange={table.setSelectedIds}
                draggable
                onReorder={handleReorder}
                infiniteScroll
                hasMore={table.hasMore}
                onLoadMore={async () => table.loadMore()}
                isLoading={table.isPending}
                emptyState={
                    <div className='p-12 text-center'>
                        <Layers className='mx-auto h-12 w-12 text-muted-foreground/50' />
                        <h3 className='mt-4 text-lg font-semibold'>No topics found</h3>
                        <p className='mt-2 text-muted-foreground'>
                            {table.searchQuery || table.activeFiltersCount > 0 ? 'Try adjusting your search or filters' : 'Create your first topic to get started'}
                        </p>
                        {!table.searchQuery && table.activeFiltersCount === 0 && (
                            <Link href='/admin/topics/new'>
                                <Button className='mt-6'>Create Topic</Button>
                            </Link>
                        )}
                    </div>
                }
            />

            <BulkActionsBar
                selectedCount={table.selectedIds.length}
                totalCount={table.displayedItems.length}
                actions={bulkActions}
                onClear={table.clearSelection}
                onAction={async (action) => action.action(table.selectedIds)}
            />
        </div>
    );
}
