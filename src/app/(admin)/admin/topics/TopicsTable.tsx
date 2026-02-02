'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, GripVertical } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { ITopic } from '@/interfaces';

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
    deleteTopic,
    toggleTopicPublished,
    toggleTopicFeatured,
    reorderTopics,
} from '@/server/actions/topics';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 15;

interface ITopicsTableProps {
    topics: ITopic[];
}

export function TopicsTable({ topics: initialTopics }: ITopicsTableProps): React.ReactElement {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    // State
    const [topics, setTopics] = useState(initialTopics);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

    // ===== FILTERING & SEARCHING =====

    const filteredTopics = useMemo(() => {
        let filtered = [...topics];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (topic) =>
                    topic.title.toLowerCase().includes(query) ||
                    topic.slug.toLowerCase().includes(query) ||
                    topic.description?.toLowerCase().includes(query)
            );
        }

        // Published Filter
        if (filters.published === 'true') {
            filtered = filtered.filter((topic) => topic.published);
        } else if (filters.published === 'false') {
            filtered = filtered.filter((topic) => !topic.published);
        }

        // Featured Filter
        if (filters.featured === 'true') {
            filtered = filtered.filter((topic) => topic.featured);
        } else if (filters.featured === 'false') {
            filtered = filtered.filter((topic) => !topic.featured);
        }

        return filtered;
    }, [topics, searchQuery, filters]);

    // Paginated data for infinite scroll
    const displayedTopics = useMemo(() => {
        return filteredTopics.slice(0, displayCount);
    }, [filteredTopics, displayCount]);

    const hasMore = displayedTopics.length < filteredTopics.length;

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
        await deleteTopic(slug);
    }, []);

    const handleTogglePublished = useCallback(async (slug: string) => {
        await toggleTopicPublished(slug);
    }, []);

    const handleToggleFeatured = useCallback(async (slug: string) => {
        await toggleTopicFeatured(slug);
    }, []);

    // ===== ROW ACTIONS =====

    const getRowActions = useCallback((topic: ITopic) => {
        return [
            createEditAction(`/admin/topics/${topic.slug}/edit`),
            createTogglePublishedAction(topic.published || false, async () => {
                startTransition(async () => {
                    await handleTogglePublished(topic.slug);
                    router.refresh();
                });
            }),
            createToggleFeaturedAction(topic.featured || false, async () => {
                startTransition(async () => {
                    await handleToggleFeatured(topic.slug);
                    router.refresh();
                });
            }),
            createDeleteAction(async () => {
                startTransition(async () => {
                    await handleDelete(topic.slug);
                    router.refresh();
                });
            }, `"${topic.title}"`),
        ];
    }, [handleDelete, handleTogglePublished, handleToggleFeatured, router]);

    // ===== TABLE COLUMNS =====

    const columns: IDataTableColumn<ITopic>[] = useMemo(
        () => [
            {
                id: 'topic',
                header: 'Topic',
                accessor: (topic) => (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <Link
                                href={`/admin/topics/${topic.slug}/edit`}
                                className="font-medium hover:underline hover:text-foreground line-clamp-1 block"
                            >
                                {topic.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">/{topic.slug}</p>
                        </div>
                    </div>
                ),
                width: '300px',
            },
            {
                id: 'articles',
                header: 'Articles',
                cell: (topic) => (
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium">
                        {topic.metadata?.articleCount ?? 0}
                    </span>
                ),
                align: 'center',
                width: '100px',
            },
            {
                id: 'published',
                header: 'Status',
                cell: (topic) => <StatusBadge variant="published" value={topic.published || false} />,
                align: 'center',
                width: '120px',
            },
            {
                id: 'featured',
                header: 'Featured',
                cell: (topic) => <StatusBadge variant="featured" value={topic.featured || false} />,
                align: 'center',
                width: '100px',
            },
            {
                id: 'updated',
                header: 'Last Updated',
                cell: (topic) => (
                    <div className="text-sm text-muted-foreground">
                        {formatDate(topic.updatedAt)}
                    </div>
                ),
                width: '150px',
            },
            {
                id: 'actions',
                header: '',
                cell: (topic) => (
                    <DataTableActions actions={getRowActions(topic)} itemName={`"${topic.title}"`} />
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
                await deleteTopic(id);
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [router]);

    const handleBulkPublish = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                const topic = topics.find((t) => t.slug === id);
                if (topic && !topic.published) {
                    await toggleTopicPublished(id);
                }
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [topics, router]);

    const handleBulkUnpublish = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                const topic = topics.find((t) => t.slug === id);
                if (topic && topic.published) {
                    await toggleTopicPublished(id);
                }
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [topics, router]);

    const handleBulkFeature = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                await toggleTopicFeatured(id);
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

    // ===== DRAG & DROP REORDER =====

    const handleReorder = useCallback(async (newOrder: ITopic[]) => {
        setTopics(newOrder);
        const slugs = newOrder.map((t) => t.slug);
        
        startTransition(async () => {
            await reorderTopics(slugs);
            router.refresh();
        });
    }, [router]);

    // ===== RENDER =====

    return (
        <div className="space-y-6">
            {/* Search & Filters */}
            <TableSearch
                placeholder="Search topics by title or slug..."
                onSearch={setSearchQuery}
                filters={tableFilters}
                onFilterChange={setFilters}
                activeFiltersCount={activeFiltersCount}
            />

            {/* Topics Table with Infinite Scroll & Drag-Drop */}
            <DataTable
                data={displayedTopics}
                columns={columns}
                keyExtractor={(topic) => topic.slug}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                draggable
                onReorder={handleReorder}
                infiniteScroll={true}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                isLoading={isPending}
                emptyState={
                    <div className="p-12 text-center">
                        <Layers className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No topics found</h3>
                        <p className="mt-2 text-muted-foreground">
                            {searchQuery || activeFiltersCount > 0
                                ? 'Try adjusting your search or filters'
                                : 'Create your first topic to get started'}
                        </p>
                        {!searchQuery && activeFiltersCount === 0 && (
                            <Link href="/admin/topics/new">
                                <Button className="mt-6">Create Topic</Button>
                            </Link>
                        )}
                    </div>
                }
            />

            {/* Bulk Actions Bar */}
            <BulkActionsBar
                selectedCount={selectedIds.length}
                totalCount={displayedTopics.length}
                actions={bulkActions}
                onClear={() => setSelectedIds([])}
                onAction={async (action) => {
                    await action.action(selectedIds);
                }}
            />
        </div>
    );
}
