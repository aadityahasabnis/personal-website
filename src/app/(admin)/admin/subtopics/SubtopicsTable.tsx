'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, Calendar } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { ISubtopic, ITopic } from '@/interfaces';

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
import {
    deleteSubtopic,
    toggleSubtopicPublished,
} from '@/server/actions/subtopics';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 15;

interface ISubtopicsTableProps {
    subtopics: ISubtopic[];
    topics: ITopic[];
}

export function SubtopicsTable({ subtopics: initialSubtopics, topics }: ISubtopicsTableProps): React.ReactElement {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

    // ===== FILTERING & SEARCHING =====

    const filteredSubtopics = useMemo(() => {
        let filtered = [...initialSubtopics];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (subtopic) =>
                    subtopic.title.toLowerCase().includes(query) ||
                    subtopic.slug.toLowerCase().includes(query) ||
                    subtopic.description?.toLowerCase().includes(query)
            );
        }

        // Topic Filter
        if (filters.topic && filters.topic !== 'all') {
            filtered = filtered.filter((subtopic) => subtopic.topicSlug === filters.topic);
        }

        // Published Filter
        if (filters.published === 'true') {
            filtered = filtered.filter((subtopic) => subtopic.published);
        } else if (filters.published === 'false') {
            filtered = filtered.filter((subtopic) => !subtopic.published);
        }

        return filtered;
    }, [initialSubtopics, searchQuery, filters]);

    // Paginated data for infinite scroll
    const displayedSubtopics = useMemo(() => {
        return filteredSubtopics.slice(0, displayCount);
    }, [filteredSubtopics, displayCount]);

    const hasMore = displayedSubtopics.length < filteredSubtopics.length;

    // Load more handler
    const handleLoadMore = useCallback(async () => {
        setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
    }, []);

    // ===== FILTERS CONFIGURATION =====

    const tableFilters: ITableFilter[] = useMemo(
        () => [
            {
                id: 'topic',
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
        ],
        [topics]
    );

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.topic && filters.topic !== 'all') count++;
        if (filters.published && filters.published !== 'all') count++;
        return count;
    }, [filters]);

    // ===== SERVER ACTIONS WRAPPERS =====

    const handleDelete = useCallback(async (topicSlug: string, slug: string) => {
        await deleteSubtopic(topicSlug, slug);
    }, []);

    const handleTogglePublished = useCallback(async (topicSlug: string, slug: string) => {
        await toggleSubtopicPublished(topicSlug, slug);
    }, []);

    // ===== ROW ACTIONS =====

    const getRowActions = useCallback((subtopic: ISubtopic) => {
        return [
            createEditAction(`/admin/subtopics/${subtopic.topicSlug}/${subtopic.slug}/edit`),
            createTogglePublishedAction(subtopic.published || false, async () => {
                startTransition(async () => {
                    await handleTogglePublished(subtopic.topicSlug, subtopic.slug);
                    router.refresh();
                });
            }),
            createDeleteAction(async () => {
                startTransition(async () => {
                    await handleDelete(subtopic.topicSlug, subtopic.slug);
                    router.refresh();
                });
            }, `"${subtopic.title}"`),
        ];
    }, [handleDelete, handleTogglePublished, router]);

    // ===== TABLE COLUMNS =====

    const columns: IDataTableColumn<ISubtopic>[] = useMemo(
        () => [
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
                            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                                {subtopic.description}
                            </p>
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
                cell: (subtopic) => (
                    <DataTableActions actions={getRowActions(subtopic)} itemName={`"${subtopic.title}"`} />
                ),
                align: 'right',
                width: '60px',
            },
        ],
        [getRowActions, topics]
    );

    // ===== BULK ACTIONS =====

    const handleBulkDelete = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                const subtopic = initialSubtopics.find((s) => s.slug === id);
                if (subtopic) {
                    await deleteSubtopic(subtopic.topicSlug, subtopic.slug);
                }
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [initialSubtopics, router]);

    const handleBulkPublish = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                const subtopic = initialSubtopics.find((s) => s.slug === id);
                if (subtopic && !subtopic.published) {
                    await toggleSubtopicPublished(subtopic.topicSlug, id);
                }
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [initialSubtopics, router]);

    const handleBulkUnpublish = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                const subtopic = initialSubtopics.find((s) => s.slug === id);
                if (subtopic && subtopic.published) {
                    await toggleSubtopicPublished(subtopic.topicSlug, id);
                }
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [initialSubtopics, router]);

    const bulkActions: IBulkActionNew[] = useMemo(
        () => [
            createBulkPublishAction(handleBulkPublish),
            createBulkUnpublishAction(handleBulkUnpublish),
            createBulkDeleteActionNew(handleBulkDelete),
        ],
        [handleBulkDelete, handleBulkPublish, handleBulkUnpublish]
    );

    // ===== RENDER =====

    return (
        <div className="space-y-6">
            {/* Search & Filters */}
            <TableSearch
                placeholder="Search subtopics by title or slug..."
                onSearch={setSearchQuery}
                filters={tableFilters}
                onFilterChange={setFilters}
                activeFiltersCount={activeFiltersCount}
            />

            {/* Subtopics Table with Infinite Scroll */}
            <DataTable
                data={displayedSubtopics}
                columns={columns}
                keyExtractor={(subtopic) => subtopic.slug}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                infiniteScroll={true}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                isLoading={isPending}
                emptyState={
                    <div className="p-12 text-center">
                        <Layers className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No subtopics found</h3>
                        <p className="mt-2 text-muted-foreground">
                            {searchQuery || activeFiltersCount > 0
                                ? 'Try adjusting your search or filters'
                                : 'Create your first subtopic to get started'}
                        </p>
                        {!searchQuery && activeFiltersCount === 0 && (
                            <Link href="/admin/subtopics/new">
                                <Button className="mt-6">Create Subtopic</Button>
                            </Link>
                        )}
                    </div>
                }
            />

            {/* Bulk Actions Bar */}
            <BulkActionsBar
                selectedCount={selectedIds.length}
                totalCount={displayedSubtopics.length}
                actions={bulkActions}
                onClear={() => setSelectedIds([])}
                onAction={async (action) => {
                    await action.action(selectedIds);
                }}
            />
        </div>
    );
}
