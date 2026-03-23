'use client';

import { Calendar, Download, Mail } from 'lucide-react';
import { useCallback } from 'react';

import {
    BulkActionsBar,
    DataTable,
    DataTableActions,
    StatusBadge,
    TableSearch,
    createBulkDeleteActionNew,
    createDeleteAction,
    type IBulkActionNew,
    type IDataTableAction,
    type IDataTableColumn,
    type ITableFilter,
} from '@/components/admin';
import { Button } from '@/components/ui/button';
import { useAdminTable } from '@/hooks';
import type { ISubscriber } from '@/interfaces/schema';
import { formatDate } from '@/lib/utils';
import { confirmSubscriber, deleteSubscriber, exportSubscribers } from '@/server/actions/subscribers';

// ===== FILTERS CONFIG =====

const TABLE_FILTERS: ITableFilter[] = [
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
];

// Serialized subscriber type
type SerializedSubscriber = Omit<ISubscriber, '_id' | 'subscribedAt' | 'unsubscribedAt' | 'createdAt' | 'updatedAt'> & {
    _id?: string;
    subscribedAt: string;
    unsubscribedAt?: string;
    createdAt?: string;
    updatedAt?: string;
};

// ===== COMPONENT =====

interface ISubscribersTableProps {
    subscribers: SerializedSubscriber[];
}

export function SubscribersTable({ subscribers }: ISubscribersTableProps): React.ReactElement {
    const table = useAdminTable({
        tableKey: 'admin-subscribers',
        data: subscribers,
        keyExtractor: (s) => s._id || s.email,
        searchFn: (subscriber, query) => subscriber.email.toLowerCase().includes(query) || subscriber.name?.toLowerCase().includes(query) || false,
    });

    // Custom filter logic for subscriber status
    const filteredByStatus = table.filteredItems
        .filter((s) => {
            const status = table.filters.status;
            if (!status || status === 'all') return true;
            if (status === 'confirmed') return s.confirmed && !s.unsubscribedAt;
            if (status === 'pending') return !s.confirmed;
            if (status === 'unsubscribed') return !!s.unsubscribedAt;
            return true;
        })
        .sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());

    // ===== EXPORT HANDLER =====

    const handleExport = useCallback(async () => {
        const statusFilter = table.filters.status as 'all' | 'confirmed' | 'pending' | 'unsubscribed' | undefined;
        const result = await exportSubscribers(statusFilter && statusFilter !== 'all' ? statusFilter : 'all');

        if (result.success && result.data) {
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
    }, [table.filters.status]);

    // ===== ROW ACTIONS =====

    const getRowActions = (subscriber: SerializedSubscriber): IDataTableAction[] => {
        const actions: IDataTableAction[] = [];

        if (!subscriber.confirmed) {
            actions.push({
                label: 'Confirm',
                icon: 'CheckCircle2',
                action: 'custom',
                onClick: async () => {
                    await table.optimisticUpdate(
                        subscriber._id || subscriber.email,
                        (s) => ({ ...s, confirmed: true }),
                        () => confirmSubscriber(subscriber._id!),
                    );
                },
            });
        }

        actions.push(createDeleteAction(() => table.optimisticDelete(subscriber._id || subscriber.email, () => deleteSubscriber(subscriber._id!)), subscriber.email));

        return actions;
    };

    // ===== COLUMNS =====

    const columns: IDataTableColumn<SerializedSubscriber>[] = [
        {
            id: 'subscriber',
            header: 'Subscriber',
            accessor: (subscriber) => (
                <div className='min-w-0 max-w-md'>
                    <p className='font-medium line-clamp-1'>{subscriber.email}</p>
                    {subscriber.name && <p className='mt-0.5 text-sm text-muted-foreground line-clamp-1'>{subscriber.name}</p>}
                </div>
            ),
            width: '350px',
        },
        {
            id: 'status',
            header: 'Status',
            cell: (subscriber) => {
                if (subscriber.unsubscribedAt) return <StatusBadge status='unsubscribed' />;
                return subscriber.confirmed ? <StatusBadge status='confirmed' /> : <StatusBadge status='pending' />;
            },
            align: 'center',
            width: '120px',
        },
        {
            id: 'subscribed',
            header: 'Subscribed',
            cell: (subscriber) => (
                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                    <Calendar className='h-3 w-3' />
                    {formatDate(new Date(subscriber.subscribedAt))}
                </div>
            ),
            width: '150px',
        },
        {
            id: 'actions',
            header: '',
            cell: (subscriber) => <DataTableActions actions={getRowActions(subscriber)} itemName={subscriber.email} />,
            align: 'right',
            width: '60px',
        },
    ];

    // ===== BULK ACTIONS =====

    const bulkActions: IBulkActionNew[] = [
        {
            id: 'confirm',
            label: 'Confirm Selected',
            icon: <Mail className='h-4 w-4' />,
            variant: 'default',
            action: (ids) =>
                table.optimisticBulkUpdate(
                    ids,
                    (s) => ({ ...s, confirmed: true }),
                    async () => {
                        const toConfirm = ids.map((id) => table.items.find((s) => (s._id || s.email) === id)).filter((s) => s && !s.confirmed);
                        await Promise.all(toConfirm.map((s) => confirmSubscriber(s!._id!)));
                    },
                ),
        },
        createBulkDeleteActionNew(async (ids) => {
            await Promise.all(ids.map((id) => table.optimisticDelete(id, () => deleteSubscriber(id))));
        }),
    ];

    // ===== RENDER =====

    return (
        <div className='space-y-6'>
            <div className='flex flex-col sm:flex-row gap-4'>
                <div className='flex-1'>
                    <TableSearch
                        placeholder='Search subscribers by email or name...'
                        onSearch={table.setSearchQuery}
                        filters={TABLE_FILTERS}
                        onFilterChange={table.setFilters}
                        activeFiltersCount={table.activeFiltersCount}
                    />
                </div>
                <Button variant='outline' onClick={handleExport} disabled={table.isPending || filteredByStatus.length === 0} className='shrink-0'>
                    <Download className='h-4 w-4 mr-2' />
                    Export CSV
                </Button>
            </div>

            <DataTable
                data={filteredByStatus.slice(0, table.displayCount)}
                columns={columns}
                keyExtractor={(s) => s._id || s.email}
                selectable
                selectedIds={table.selectedIds}
                onSelectionChange={table.setSelectedIds}
                infiniteScroll
                hasMore={filteredByStatus.length > table.displayCount}
                onLoadMore={async () => table.loadMore()}
                isLoading={table.isPending}
                emptyState={
                    <div className='p-12 text-center'>
                        <Mail className='mx-auto h-12 w-12 text-muted-foreground/50' />
                        <h3 className='mt-4 text-lg font-semibold'>No subscribers found</h3>
                        <p className='mt-2 text-muted-foreground'>
                            {table.searchQuery || table.activeFiltersCount > 0 ? 'Try adjusting your search or filters' : 'Subscribers will appear here once they sign up'}
                        </p>
                    </div>
                }
            />

            <BulkActionsBar
                selectedCount={table.selectedIds.length}
                totalCount={filteredByStatus.length}
                actions={bulkActions}
                onClear={table.clearSelection}
                onAction={async (action) => action.action(table.selectedIds)}
            />
        </div>
    );
}
