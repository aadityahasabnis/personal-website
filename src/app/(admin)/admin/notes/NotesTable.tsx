'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookText, Calendar } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { INote } from '@/interfaces';

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
import {
    deleteNote,
    toggleNotePublished,
    toggleNoteFeatured,
} from '@/server/actions/notes';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 15;

interface INotesTableProps {
    notes: INote[];
}

export function NotesTable({ notes: initialNotes }: INotesTableProps): React.ReactElement {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

    // ===== FILTERING & SEARCHING =====

    const filteredNotes = useMemo(() => {
        let filtered = [...initialNotes];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (note) =>
                    note.title.toLowerCase().includes(query) ||
                    note.description?.toLowerCase().includes(query) ||
                    note.tags?.some((tag) => tag.toLowerCase().includes(query))
            );
        }

        // Published Filter
        if (filters.published === 'true') {
            filtered = filtered.filter((note) => note.published);
        } else if (filters.published === 'false') {
            filtered = filtered.filter((note) => !note.published);
        }

        // Featured Filter
        if (filters.featured === 'true') {
            filtered = filtered.filter((note) => note.featured);
        } else if (filters.featured === 'false') {
            filtered = filtered.filter((note) => !note.featured);
        }

        return filtered;
    }, [initialNotes, searchQuery, filters]);

    // Paginated data for infinite scroll
    const displayedNotes = useMemo(() => {
        return filteredNotes.slice(0, displayCount);
    }, [filteredNotes, displayCount]);

    const hasMore = displayedNotes.length < filteredNotes.length;

    // Load more handler
    const handleLoadMore = useCallback(async () => {
        setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
    }, []);

    // ===== FILTERS CONFIGURATION =====

    const tableFilters: ITableFilter[] = useMemo(
        () => [
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
        ],
        []
    );

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.published && filters.published !== 'all') count++;
        if (filters.featured && filters.featured !== 'all') count++;
        return count;
    }, [filters]);

    // ===== SERVER ACTIONS WRAPPERS =====

    const handleDelete = useCallback(async (slug: string) => {
        await deleteNote(slug);
    }, []);

    const handleTogglePublished = useCallback(async (slug: string) => {
        await toggleNotePublished(slug);
    }, []);

    const handleToggleFeatured = useCallback(async (slug: string) => {
        await toggleNoteFeatured(slug);
    }, []);

    // ===== ROW ACTIONS =====

    const getRowActions = useCallback((note: INote) => {
        return [
            createEditAction(`/admin/notes/${note.slug}/edit`),
            createTogglePublishedAction(note.published || false, async () => {
                startTransition(async () => {
                    await handleTogglePublished(note.slug);
                    router.refresh();
                });
            }),
            createToggleFeaturedAction(note.featured || false, async () => {
                startTransition(async () => {
                    await handleToggleFeatured(note.slug);
                    router.refresh();
                });
            }),
            createDeleteAction(async () => {
                startTransition(async () => {
                    await handleDelete(note.slug);
                    router.refresh();
                });
            }, `"${note.title}"`),
        ];
    }, [handleDelete, handleTogglePublished, handleToggleFeatured, router]);

    // ===== TABLE COLUMNS =====

    const columns: IDataTableColumn<INote>[] = useMemo(
        () => [
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
                    note.tags && note.tags.length > 0 ? (
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
                                <span className="text-xs text-muted-foreground">
                                    +{note.tags.length - 3}
                                </span>
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
                cell: (note) => (
                    <DataTableActions actions={getRowActions(note)} itemName={`"${note.title}"`} />
                ),
                align: 'right',
                width: '60px',
            },
        ],
        [getRowActions]
    );

    // ===== BULK ACTIONS =====

    const handleBulkDelete = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                await deleteNote(id);
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [router]);

    const handleBulkPublish = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                const note = initialNotes.find((n) => n.slug === id);
                if (note && !note.published) {
                    await toggleNotePublished(id);
                }
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [initialNotes, router]);

    const handleBulkUnpublish = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                const note = initialNotes.find((n) => n.slug === id);
                if (note && note.published) {
                    await toggleNotePublished(id);
                }
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [initialNotes, router]);

    const handleBulkFeature = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                await toggleNoteFeatured(id);
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [router]);

    const bulkActions: IBulkActionNew[] = useMemo(
        () => [
            createBulkPublishAction(handleBulkPublish),
            createBulkUnpublishAction(handleBulkUnpublish),
            createBulkFeatureAction(handleBulkFeature),
            createBulkUnfeatureAction(handleBulkFeature),
            createBulkDeleteActionNew(handleBulkDelete),
        ],
        [handleBulkDelete, handleBulkPublish, handleBulkUnpublish, handleBulkFeature]
    );

    // ===== RENDER =====

    return (
        <div className="space-y-6">
            {/* Search & Filters */}
            <TableSearch
                placeholder="Search notes by title, description, or tags..."
                onSearch={setSearchQuery}
                filters={tableFilters}
                onFilterChange={setFilters}
                activeFiltersCount={activeFiltersCount}
            />

            {/* Notes Table with Infinite Scroll */}
            <DataTable
                data={displayedNotes}
                columns={columns}
                keyExtractor={(note) => note.slug}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                infiniteScroll={true}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                isLoading={isPending}
                emptyState={
                    <div className="p-12 text-center">
                        <BookText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No notes found</h3>
                        <p className="mt-2 text-muted-foreground">
                            {searchQuery || activeFiltersCount > 0
                                ? 'Try adjusting your search or filters'
                                : 'Create your first note to get started'}
                        </p>
                        {!searchQuery && activeFiltersCount === 0 && (
                            <Link href="/admin/notes/new">
                                <Button className="mt-6">Create Note</Button>
                            </Link>
                        )}
                    </div>
                }
            />

            {/* Bulk Actions Bar */}
            <BulkActionsBar
                selectedCount={selectedIds.length}
                totalCount={displayedNotes.length}
                actions={bulkActions}
                onClear={() => setSelectedIds([])}
                onAction={async (action) => {
                    await action.action(selectedIds);
                }}
            />
        </div>
    );
}
