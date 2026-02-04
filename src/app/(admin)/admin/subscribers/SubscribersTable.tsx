'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Calendar, Download } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { ISubscriber } from '@/interfaces';

import {
    DataTable,
    TableSearch,
    BulkActionsBar,
    StatusBadge,
    DataTableActions,
    createDeleteAction,
    createBulkDeleteActionNew,
    type IDataTableColumn,
    type IBulkActionNew,
    type ITableFilter,
} from '@/components/admin';
import {
    deleteSubscriber,
    confirmSubscriber,
    exportSubscribers,
} from '@/server/actions/subscribers';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 15;

// Serialized subscriber type (for passing from server to client)
type SerializedSubscriber = Omit<ISubscriber, '_id' | 'subscribedAt' | 'unsubscribedAt' | 'createdAt' | 'updatedAt'> & {
    _id?: string;
    subscribedAt: string;
    unsubscribedAt?: string;
    createdAt?: string;
    updatedAt?: string;
};

interface ISubscribersTableProps {
    subscribers: SerializedSubscriber[];
}

export function SubscribersTable({ subscribers: initialSubscribers }: ISubscribersTableProps): React.ReactElement {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

    // ===== FILTERING & SEARCHING =====

    const filteredSubscribers = useMemo(() => {
        let filtered = [...initialSubscribers];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (subscriber) =>
                    subscriber.email.toLowerCase().includes(query) ||
                    subscriber.name?.toLowerCase().includes(query)
            );
        }

        // Status Filter
        if (filters.status === 'confirmed') {
            filtered = filtered.filter((s) => s.confirmed && !s.unsubscribedAt);
        } else if (filters.status === 'pending') {
            filtered = filtered.filter((s) => !s.confirmed);
        } else if (filters.status === 'unsubscribed') {
            filtered = filtered.filter((s) => s.unsubscribedAt);
        }

        return filtered.sort((a, b) =>
            new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
        );
    }, [initialSubscribers, searchQuery, filters]);

    // Paginated data for infinite scroll
    const displayedSubscribers = useMemo(() => {
        return filteredSubscribers.slice(0, displayCount);
    }, [filteredSubscribers, displayCount]);

    const hasMore = displayedSubscribers.length < filteredSubscribers.length;

    // Load more handler
    const handleLoadMore = useCallback(async () => {
        setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
    }, []);

    // ===== FILTERS CONFIGURATION =====

    const tableFilters: ITableFilter[] = useMemo(
        () => [
            {
                id: 'status',
                label: 'Status',
                type: 'select',
                options: [
                    { label: 'All Subscribers', value: 'all' },
                    { label: 'Confirmed', value: 'confirmed' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Unsubscribed', value: 'unsubscribed' },
                ],
            },
        ],
        []
    );

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.status && filters.status !== 'all') count++;
        return count;
    }, [filters]);

    // ===== SERVER ACTIONS WRAPPERS =====

    const handleDelete = useCallback(async (id: string) => {
        await deleteSubscriber(id);
    }, []);

    const handleConfirm = useCallback(async (id: string) => {
        await confirmSubscriber(id);
    }, []);

    const handleExport = useCallback(async () => {
        const statusFilter = filters.status && filters.status !== 'all' ? filters.status : 'all';
        const result = await exportSubscribers(statusFilter);
        
        if (result.success && result.data) {
            // Create downloadable CSV file
            const blob = new Blob([result.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `subscribers-${statusFilter}-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }
    }, [filters.status]);

    // ===== ROW ACTIONS =====

    const getRowActions = useCallback((subscriber: SerializedSubscriber) => {
        const actions = [];

        // Confirm action for pending subscribers
        if (!subscriber.confirmed) {
            actions.push({
                label: 'Confirm Subscription',
                icon: 'Check',
                variant: 'default' as const,
                action: 'custom' as const,
                onClick: async () => {
                    startTransition(async () => {
                        await handleConfirm(subscriber._id!);
                        router.refresh();
                    });
                },
            });
        }

        // Delete action
        actions.push(
            createDeleteAction(async () => {
                startTransition(async () => {
                    await handleDelete(subscriber._id!);
                    router.refresh();
                });
            }, `${subscriber.email}`)
        );

        return actions;
    }, [handleDelete, handleConfirm, router]);

    // ===== TABLE COLUMNS =====

    const columns: IDataTableColumn<SerializedSubscriber>[] = useMemo(
        () => [
            {
                id: 'subscriber',
                header: 'Subscriber',
                accessor: (subscriber) => (
                    <div className="min-w-0 max-w-md">
                        <p className="font-medium line-clamp-1">{subscriber.email}</p>
                        {subscriber.name && (
                            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                                {subscriber.name}
                            </p>
                        )}
                    </div>
                ),
                width: '350px',
            },
            {
                id: 'status',
                header: 'Status',
                cell: (subscriber) => {
                    if (subscriber.unsubscribedAt) {
                        return <StatusBadge status="unsubscribed" />;
                    }
                    return subscriber.confirmed ? (
                        <StatusBadge status="confirmed" />
                    ) : (
                        <StatusBadge status="pending" />
                    );
                },
                align: 'center',
                width: '120px',
            },
            {
                id: 'subscribed',
                header: 'Subscribed',
                cell: (subscriber) => (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(new Date(subscriber.subscribedAt))}
                    </div>
                ),
                width: '150px',
            },
            {
                id: 'actions',
                header: '',
                cell: (subscriber) => (
                    <DataTableActions actions={getRowActions(subscriber)} itemName={subscriber.email} />
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
                await deleteSubscriber(id);
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [router]);

    const handleBulkConfirm = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                const subscriber = initialSubscribers.find((s) => s._id === id);
                if (subscriber && !subscriber.confirmed) {
                    await confirmSubscriber(id);
                }
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [initialSubscribers, router]);

    const bulkActions: IBulkActionNew[] = useMemo(
        () => [
            {
                id: 'confirm',
                label: 'Confirm Selected',
                icon: <Mail className="h-4 w-4" />,
                variant: 'default',
                action: handleBulkConfirm,
            },
            createBulkDeleteActionNew(handleBulkDelete),
        ],
        [handleBulkDelete, handleBulkConfirm]
    );

    // ===== RENDER =====

    return (
        <div className="space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <TableSearch
                        placeholder="Search subscribers by email or name..."
                        onSearch={setSearchQuery}
                        filters={tableFilters}
                        onFilterChange={setFilters}
                        activeFiltersCount={activeFiltersCount}
                    />
                </div>
                
                <Button
                    variant="outline"
                    size="default"
                    onClick={handleExport}
                    disabled={isPending || filteredSubscribers.length === 0}
                    className="shrink-0"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Subscribers Table with Infinite Scroll */}
            <DataTable
                data={displayedSubscribers}
                columns={columns}
                keyExtractor={(subscriber) => subscriber._id || subscriber.email}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                infiniteScroll={true}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                isLoading={isPending}
                emptyState={
                    <div className="p-12 text-center">
                        <Mail className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No subscribers found</h3>
                        <p className="mt-2 text-muted-foreground">
                            {searchQuery || activeFiltersCount > 0
                                ? 'Try adjusting your search or filters'
                                : 'Subscribers will appear here once they sign up'}
                        </p>
                    </div>
                }
            />

            {/* Bulk Actions Bar */}
            <BulkActionsBar
                selectedCount={selectedIds.length}
                totalCount={displayedSubscribers.length}
                actions={bulkActions}
                onClear={() => setSelectedIds([])}
                onAction={async (action) => {
                    await action.action(selectedIds);
                }}
            />
        </div>
    );
}
