'use client';

import Link from 'next/link';
import { BookText, Calendar } from 'lucide-react';

import { formatDate } from '@/lib/utils';
import type { INote } from '@/interfaces';
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
    createToggleFeaturedAction,
    createBulkDeleteActionNew,
    createBulkPublishAction,
    createBulkUnpublishAction,
    createBulkFeatureAction,
    createBulkUnfeatureAction,
    type IDataTableColumn,
    type IBulkActionNew,
    type ITableFilter,
} from '@/components/admin';
import { deleteNote, toggleNotePublished, toggleNoteFeatured } from '@/server/actions/notes';
import { Button } from '@/components/ui/button';

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

interface INotesTableProps {
    notes: INote[];
}

export function NotesTable({ notes }: INotesTableProps): React.ReactElement {
    const table = useAdminTable({
        data: notes,
        keyExtractor: (note) => note.slug,
        searchFn: (note, query) =>
            note.title.toLowerCase().includes(query) ||
            note.description?.toLowerCase().includes(query) ||
            note.tags?.some((tag) => tag.toLowerCase().includes(query)) || false,
    });

    // ===== ROW ACTIONS =====

    const getRowActions = (note: INote) => [
        createEditAction(`/admin/notes/${note.slug}/edit`),
        createTogglePublishedAction(note.published || false, () =>
            table.optimisticUpdate(
                note.slug,
                (n) => ({ ...n, published: !n.published }),
                () => toggleNotePublished(note.slug)
            )
        ),
        createToggleFeaturedAction(note.featured || false, () =>
            table.optimisticUpdate(
                note.slug,
                (n) => ({ ...n, featured: !n.featured }),
                () => toggleNoteFeatured(note.slug)
            )
        ),
        createDeleteAction(
            () => table.optimisticDelete(note.slug, () => deleteNote(note.slug)),
            `"${note.title}"`
        ),
    ];

    // ===== COLUMNS =====

    const columns: IDataTableColumn<INote>[] = [
        {
            id: 'note',
            header: 'Note',
            accessor: (note) => (
                <div className="min-w-0 max-w-md">
                    <Link
                        href={`/admin/notes/${note.slug}/edit`}
                        className="font-medium hover:underline hover:text-foreground line-clamp-1 block"
                    >
                        {note.title}
                    </Link>
                    {note.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                            {note.description}
                        </p>
                    )}
                </div>
            ),
            width: '350px',
        },
        {
            id: 'published',
            header: 'Status',
            cell: (note) => <StatusBadge variant="published" value={note.published || false} />,
            align: 'center',
            width: '120px',
        },
        {
            id: 'featured',
            header: 'Featured',
            cell: (note) => <StatusBadge variant="featured" value={note.featured || false} />,
            align: 'center',
            width: '100px',
        },
        {
            id: 'tags',
            header: 'Tags',
            cell: (note) =>
                note.tags?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                        {note.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                            >
                                {tag}
                            </span>
                        ))}
                        {note.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{note.tags.length - 3}</span>
                        )}
                    </div>
                ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                ),
            width: '250px',
        },
        {
            id: 'updated',
            header: 'Last Updated',
            cell: (note) => (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(note.updatedAt)}
                </div>
            ),
            width: '150px',
        },
        {
            id: 'actions',
            header: '',
            cell: (note) => <DataTableActions actions={getRowActions(note)} itemName={`"${note.title}"`} />,
            align: 'right',
            width: '60px',
        },
    ];

    // ===== BULK ACTIONS =====

    const bulkActions: IBulkActionNew[] = [
        createBulkPublishAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (n) => ({ ...n, published: true }),
                async () => { await Promise.all(ids.filter((id) => !table.items.find((n) => n.slug === id)?.published).map((id) => toggleNotePublished(id))); }
            )
        ),
        createBulkUnpublishAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (n) => ({ ...n, published: false }),
                async () => { await Promise.all(ids.filter((id) => table.items.find((n) => n.slug === id)?.published).map((id) => toggleNotePublished(id))); }
            )
        ),
        createBulkFeatureAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (n) => ({ ...n, featured: true }),
                async () => { await Promise.all(ids.filter((id) => !table.items.find((n) => n.slug === id)?.featured).map((id) => toggleNoteFeatured(id))); }
            )
        ),
        createBulkUnfeatureAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (n) => ({ ...n, featured: false }),
                async () => { await Promise.all(ids.filter((id) => table.items.find((n) => n.slug === id)?.featured).map((id) => toggleNoteFeatured(id))); }
            )
        ),
        createBulkDeleteActionNew(async (ids) => {
            await Promise.all(ids.map((id) => table.optimisticDelete(id, () => deleteNote(id))));
        }),
    ];

    // ===== RENDER =====

    return (
        <div className="space-y-6">
            <TableSearch
                placeholder="Search notes by title, description, or tags..."
                onSearch={table.setSearchQuery}
                filters={TABLE_FILTERS}
                onFilterChange={table.setFilters}
                activeFiltersCount={table.activeFiltersCount}
            />

            <DataTable
                data={table.displayedItems}
                columns={columns}
                keyExtractor={(note) => note.slug}
                selectable
                selectedIds={table.selectedIds}
                onSelectionChange={table.setSelectedIds}
                infiniteScroll
                hasMore={table.hasMore}
                onLoadMore={async () => table.loadMore()}
                isLoading={table.isPending}
                emptyState={
                    <div className="p-12 text-center">
                        <BookText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No notes found</h3>
                        <p className="mt-2 text-muted-foreground">
                            {table.searchQuery || table.activeFiltersCount > 0
                                ? 'Try adjusting your search or filters'
                                : 'Create your first note to get started'}
                        </p>
                        {!table.searchQuery && table.activeFiltersCount === 0 && (
                            <Link href="/admin/notes/new">
                                <Button className="mt-6">Create Note</Button>
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
