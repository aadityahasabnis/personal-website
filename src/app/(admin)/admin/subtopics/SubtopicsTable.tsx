'use client';

import Link from 'next/link';
import { Layers, Calendar } from 'lucide-react';

import { formatDate } from '@/lib/utils';
import type { ISubtopic, ITopic } from '@/interfaces/schema';
import { useAdminTable } from '@/hooks';
import {
    DataTable,
    TableSearch,
    BulkActionsBar,
    StatusBadge,
    DataTableActions,
    createEditAction,
    createDeleteAction,
    createTogglePublishedAction,
    createBulkDeleteActionNew,
    createBulkPublishAction,
    createBulkUnpublishAction,
    type IDataTableColumn,
    type IBulkActionNew,
    type ITableFilter,
} from '@/components/admin';
import { deleteSubtopic, toggleSubtopicPublished } from '@/server/actions/subtopics';
import { Button } from '@/components/ui/button';

// ===== COMPONENT =====

interface ISubtopicsTableProps {
    subtopics: ISubtopic[];
    topics: ITopic[];
}

// Helper to create unique key from topicSlug + slug
const getSubtopicKey = (subtopic: ISubtopic): string => `${subtopic.topicSlug}/${subtopic.slug}`;

export function SubtopicsTable({ subtopics, topics }: ISubtopicsTableProps): React.ReactElement {
    const table = useAdminTable({
        data: subtopics,
        keyExtractor: getSubtopicKey,
        searchFn: (subtopic, query) =>
            subtopic.title.toLowerCase().includes(query) ||
            subtopic.slug.toLowerCase().includes(query) ||
            subtopic.description?.toLowerCase().includes(query) || false,
    });

    // ===== FILTERS CONFIG =====

    const tableFilters: ITableFilter[] = [
        {
            id: 'topicSlug',
            label: 'Parent Topic',
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
    ];

    // ===== ROW ACTIONS =====

    const getRowActions = (subtopic: ISubtopic) => {
        const key = getSubtopicKey(subtopic);
        return [
            createEditAction(`/admin/subtopics/${subtopic.topicSlug}/${subtopic.slug}/edit`),
            createTogglePublishedAction(subtopic.published || false, () =>
                table.optimisticUpdate(
                    key,
                    (s) => ({ ...s, published: !s.published }),
                    () => toggleSubtopicPublished(subtopic.topicSlug, subtopic.slug)
                )
            ),
            createDeleteAction(
                () => table.optimisticDelete(key, () => deleteSubtopic(subtopic.topicSlug, subtopic.slug)),
                `"${subtopic.title}"`
            ),
        ];
    };

    // ===== COLUMNS =====

    const columns: IDataTableColumn<ISubtopic>[] = [
        {
            id: 'subtopic',
            header: 'Subtopic',
            accessor: (subtopic) => (
                <div className="min-w-0 max-w-md">
                    <Link
                        href={`/admin/subtopics/${subtopic.topicSlug}/${subtopic.slug}/edit`}
                        className="font-medium hover:underline hover:text-foreground line-clamp-1 block"
                    >
                        {subtopic.title}
                    </Link>
                    {subtopic.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{subtopic.description}</p>
                    )}
                </div>
            ),
            width: '300px',
        },
        {
            id: 'topic',
            header: 'Parent Topic',
            cell: (subtopic) => {
                const topic = topics.find((t) => t.slug === subtopic.topicSlug);
                return topic ? (
                    <Link
                        href={`/admin/topics/${topic.slug}/edit`}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {topic.title}
                    </Link>
                ) : (
                    <span className="text-sm text-muted-foreground">{subtopic.topicSlug}</span>
                );
            },
            width: '180px',
        },
        {
            id: 'published',
            header: 'Status',
            cell: (subtopic) => <StatusBadge variant="published" value={subtopic.published || false} />,
            align: 'center',
            width: '120px',
        },
        {
            id: 'articles',
            header: 'Articles',
            cell: (subtopic) => (
                <span className="text-sm text-center text-muted-foreground">
                    {subtopic.metadata?.articleCount || 0}
                </span>
            ),
            align: 'center',
            width: '100px',
        },
        {
            id: 'updated',
            header: 'Last Updated',
            cell: (subtopic) => (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(subtopic.updatedAt)}
                </div>
            ),
            width: '150px',
        },
        {
            id: 'actions',
            header: '',
            cell: (subtopic) => <DataTableActions actions={getRowActions(subtopic)} itemName={`"${subtopic.title}"`} />,
            align: 'right',
            width: '60px',
        },
    ];

    // ===== BULK ACTIONS =====

    const bulkActions: IBulkActionNew[] = [
        createBulkPublishAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (s) => ({ ...s, published: true }),
                async () => {
                    for (const id of ids) {
                        const subtopic = table.items.find((s) => getSubtopicKey(s) === id);
                        if (subtopic && !subtopic.published) await toggleSubtopicPublished(subtopic.topicSlug, subtopic.slug);
                    }
                }
            )
        ),
        createBulkUnpublishAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (s) => ({ ...s, published: false }),
                async () => {
                    for (const id of ids) {
                        const subtopic = table.items.find((s) => getSubtopicKey(s) === id);
                        if (subtopic?.published) await toggleSubtopicPublished(subtopic.topicSlug, subtopic.slug);
                    }
                }
            )
        ),
        createBulkDeleteActionNew(async (ids) => {
            for (const id of ids) {
                const subtopic = table.items.find((s) => getSubtopicKey(s) === id);
                if (subtopic) await table.optimisticDelete(id, () => deleteSubtopic(subtopic.topicSlug, subtopic.slug));
            }
        }),
    ];

    // ===== RENDER =====

    return (
        <div className="space-y-6">
            <TableSearch
                placeholder="Search subtopics by title or slug..."
                onSearch={table.setSearchQuery}
                filters={tableFilters}
                onFilterChange={table.setFilters}
                activeFiltersCount={table.activeFiltersCount}
            />

            <DataTable
                data={table.displayedItems}
                columns={columns}
                keyExtractor={getSubtopicKey}
                selectable
                selectedIds={table.selectedIds}
                onSelectionChange={table.setSelectedIds}
                infiniteScroll
                hasMore={table.hasMore}
                onLoadMore={async () => table.loadMore()}
                isLoading={table.isPending}
                emptyState={
                    <div className="p-12 text-center">
                        <Layers className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No subtopics found</h3>
                        <p className="mt-2 text-muted-foreground">
                            {table.searchQuery || table.activeFiltersCount > 0
                                ? 'Try adjusting your search or filters'
                                : 'Create your first subtopic to get started'}
                        </p>
                        {!table.searchQuery && table.activeFiltersCount === 0 && (
                            <Link href="/admin/subtopics/new">
                                <Button className="mt-6">Create Subtopic</Button>
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
