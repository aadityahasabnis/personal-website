'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Calendar, Clock } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { IArticle, ITopic } from '@/interfaces';

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
    deleteArticle,
    toggleArticlePublished,
    toggleArticleFeatured,
} from '@/server/actions/articles';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 15;

interface IArticlesTableProps {
    articles: IArticle[];
    topics: ITopic[];
}

export function ArticlesTable({ articles: initialArticles, topics }: IArticlesTableProps): React.ReactElement {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

    // ===== FILTERING & SEARCHING =====

    const filteredArticles = useMemo(() => {
        let filtered = [...initialArticles];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (article) =>
                    article.title.toLowerCase().includes(query) ||
                    article.description?.toLowerCase().includes(query) ||
                    article.tags?.some((tag) => tag.toLowerCase().includes(query))
            );
        }

        // Topic Filter
        if (filters.topic && filters.topic !== 'all') {
            filtered = filtered.filter((article) => article.topicSlug === filters.topic);
        }

        // Subtopic Filter
        if (filters.subtopic && filters.subtopic !== 'all') {
            filtered = filtered.filter((article) => article.subtopicSlug === filters.subtopic);
        }

        // Published Filter
        if (filters.published === 'true') {
            filtered = filtered.filter((article) => article.published);
        } else if (filters.published === 'false') {
            filtered = filtered.filter((article) => !article.published);
        }

        // Featured Filter
        if (filters.featured === 'true') {
            filtered = filtered.filter((article) => article.featured);
        } else if (filters.featured === 'false') {
            filtered = filtered.filter((article) => !article.featured);
        }

        return filtered;
    }, [initialArticles, searchQuery, filters]);

    // Paginated data for infinite scroll
    const displayedArticles = useMemo(() => {
        return filteredArticles.slice(0, displayCount);
    }, [filteredArticles, displayCount]);

    const hasMore = displayedArticles.length < filteredArticles.length;

    // Load more handler
    const handleLoadMore = useCallback(async () => {
        setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
    }, []);

    // ===== FILTERS CONFIGURATION =====

    const tableFilters: ITableFilter[] = useMemo(
        () => [
            {
                id: 'topic',
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
        ],
        [topics]
    );

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.topic && filters.topic !== 'all') count++;
        if (filters.published && filters.published !== 'all') count++;
        if (filters.featured && filters.featured !== 'all') count++;
        return count;
    }, [filters]);

    // ===== SERVER ACTIONS WRAPPERS =====

    const handleDelete = useCallback(async (topicSlug: string, slug: string) => {
        await deleteArticle(topicSlug, slug);
    }, []);

    const handleTogglePublished = useCallback(async (topicSlug: string, slug: string) => {
        await toggleArticlePublished(topicSlug, slug);
    }, []);

    const handleToggleFeatured = useCallback(async (topicSlug: string, slug: string) => {
        await toggleArticleFeatured(topicSlug, slug);
    }, []);

    // ===== ROW ACTIONS =====

    const getRowActions = useCallback((article: IArticle) => {
        return [
            createEditAction(`/admin/articles/${article.topicSlug}/${article.slug}/edit`),
            createTogglePublishedAction(article.published || false, async () => {
                startTransition(async () => {
                    await handleTogglePublished(article.topicSlug, article.slug);
                    router.refresh();
                });
            }),
            createToggleFeaturedAction(article.featured || false, async () => {
                startTransition(async () => {
                    await handleToggleFeatured(article.topicSlug, article.slug);
                    router.refresh();
                });
            }),
            createDeleteAction(async () => {
                startTransition(async () => {
                    await handleDelete(article.topicSlug, article.slug);
                    router.refresh();
                });
            }, `"${article.title}"`),
        ];
    }, [handleDelete, handleTogglePublished, handleToggleFeatured, router]);

    // ===== TABLE COLUMNS =====

    const columns: IDataTableColumn<IArticle>[] = useMemo(
        () => [
            {
                id: 'article',
                header: 'Article',
                accessor: (article) => (
                    <div className="min-w-0 max-w-md">
                        <Link
                            href={`/admin/articles/${article.topicSlug}/${article.slug}/edit`}
                            className="font-medium hover:underline hover:text-foreground line-clamp-1 block"
                        >
                            {article.title}
                        </Link>
                        {article.description && (
                            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                                {article.description}
                            </p>
                        )}
                    </div>
                ),
                width: '350px',
            },
            {
                id: 'topic',
                header: 'Topic / Subtopic',
                cell: (article) => {
                    const topic = topics.find((t) => t.slug === article.topicSlug);
                    return (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">
                                {topic ? topic.title : article.topicSlug}
                            </span>
                            {article.subtopicSlug && (
                                <>
                                    <span className="text-muted-foreground">/</span>
                                    <span className="text-xs text-muted-foreground">
                                        {article.subtopicSlug}
                                    </span>
                                </>
                            )}
                        </div>
                    );
                },
                width: '200px',
            },
            {
                id: 'published',
                header: 'Status',
                cell: (article) => <StatusBadge variant="published" value={article.published || false} />,
                align: 'center',
                width: '120px',
            },
            {
                id: 'featured',
                header: 'Featured',
                cell: (article) => <StatusBadge variant="featured" value={article.featured || false} />,
                align: 'center',
                width: '100px',
            },
            {
                id: 'readingTime',
                header: 'Reading Time',
                cell: (article) => (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {article.readingTime || 0} min
                    </div>
                ),
                width: '120px',
            },
            {
                id: 'updated',
                header: 'Last Updated',
                cell: (article) => (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(article.updatedAt)}
                    </div>
                ),
                width: '150px',
            },
            {
                id: 'actions',
                header: '',
                cell: (article) => (
                    <DataTableActions actions={getRowActions(article)} itemName={`"${article.title}"`} />
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
                const article = initialArticles.find((a) => a.slug === id);
                if (article) {
                    await deleteArticle(article.topicSlug, article.slug);
                }
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [initialArticles, router]);

    const handleBulkPublish = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                const article = initialArticles.find((a) => a.slug === id);
                if (article && !article.published) {
                    await toggleArticlePublished(article.topicSlug, article.slug);
                }
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [initialArticles, router]);

    const handleBulkUnpublish = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                const article = initialArticles.find((a) => a.slug === id);
                if (article && article.published) {
                    await toggleArticlePublished(article.topicSlug, article.slug);
                }
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [initialArticles, router]);

    const handleBulkFeature = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                const article = initialArticles.find((a) => a.slug === id);
                if (article) {
                    await toggleArticleFeatured(article.topicSlug, article.slug);
                }
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [initialArticles, router]);

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
                placeholder="Search articles by title, description, or tags..."
                onSearch={setSearchQuery}
                filters={tableFilters}
                onFilterChange={setFilters}
                activeFiltersCount={activeFiltersCount}
            />

            {/* Articles Table with Infinite Scroll */}
            <DataTable
                data={displayedArticles}
                columns={columns}
                keyExtractor={(article) => article.slug}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                infiniteScroll={true}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                isLoading={isPending}
                emptyState={
                    <div className="p-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No articles found</h3>
                        <p className="mt-2 text-muted-foreground">
                            {searchQuery || activeFiltersCount > 0
                                ? 'Try adjusting your search or filters'
                                : 'Create your first article to get started'}
                        </p>
                        {!searchQuery && activeFiltersCount === 0 && (
                            <Link href="/admin/articles/new">
                                <Button className="mt-6">Create Article</Button>
                            </Link>
                        )}
                    </div>
                }
            />

            {/* Bulk Actions Bar */}
            <BulkActionsBar
                selectedCount={selectedIds.length}
                totalCount={displayedArticles.length}
                actions={bulkActions}
                onClear={() => setSelectedIds([])}
                onAction={async (action) => {
                    await action.action(selectedIds);
                }}
            />
        </div>
    );
}
