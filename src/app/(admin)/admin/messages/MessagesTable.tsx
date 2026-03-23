'use client';

import { Archive, Calendar, Check, Eye, Mail, Trash2 } from 'lucide-react';
import { useState } from 'react';

import {
    BulkActionsBar,
    DataTable,
    DataTableActions,
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
import { cn, formatDate } from '@/lib/utils';
import { archiveMessage, deleteMessage, markMessageRead, markMessageUnread, unarchiveMessage, type IContactMessage } from '@/server/actions/contact';

// ===== FILTERS CONFIG =====

const TABLE_FILTERS: ITableFilter[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { label: 'All Messages', value: 'all' },
            { label: 'Unread', value: 'unread' },
            { label: 'Read', value: 'read' },
            { label: 'Archived', value: 'archived' },
        ],
    },
    {
        id: 'type',
        label: 'Type',
        type: 'select',
        options: [
            { label: 'All Types', value: 'all' },
            { label: 'General', value: 'general' },
            { label: 'Collaboration', value: 'collaboration' },
            { label: 'Hiring', value: 'hiring' },
            { label: 'Feedback', value: 'feedback' },
        ],
    },
];

// Serialized type
type SerializedMessage = Omit<IContactMessage, '_id' | 'createdAt'> & {
    _id: string;
    createdAt: string;
};

// ===== COMPONENT =====

interface IMessagesTableProps {
    messages: SerializedMessage[];
}

export function MessagesTable({ messages }: IMessagesTableProps): React.ReactElement {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const table = useAdminTable({
        tableKey: 'admin-messages',
        data: messages,
        keyExtractor: (m) => m._id,
        searchFn: (m, query) => m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query) || m.subject.toLowerCase().includes(query) || m.message.toLowerCase().includes(query),
    });

    // Custom filtering for status
    const filteredByStatus = table.filteredItems.filter((m) => {
        const status = table.filters.status;
        const type = table.filters.type;

        let matchesStatus = true;
        if (status === 'unread') matchesStatus = !m.read && !m.archived;
        else if (status === 'read') matchesStatus = m.read && !m.archived;
        else if (status === 'archived') matchesStatus = m.archived;
        else if (status === 'all') matchesStatus = !m.archived; // Default excludes archived

        let matchesType = true;
        if (type && type !== 'all') matchesType = m.type === type;

        return matchesStatus && matchesType;
    });

    // ===== ROW ACTIONS =====

    const getRowActions = (msg: SerializedMessage): IDataTableAction[] => {
        const actions: IDataTableAction[] = [];

        // Read/Unread toggle
        actions.push({
            label: msg.read ? 'Mark as Unread' : 'Mark as Read',
            icon: msg.read ? 'EyeOff' : 'Eye',
            action: 'custom',
            onClick: async () => {
                await table.optimisticUpdate(
                    msg._id,
                    (m) => ({ ...m, read: !m.read }),
                    () => (msg.read ? markMessageUnread(msg._id) : markMessageRead(msg._id)),
                );
            },
        });

        // Archive/Unarchive
        actions.push({
            label: msg.archived ? 'Unarchive' : 'Archive',
            icon: 'Copy', // Using available icon
            action: 'custom',
            onClick: async () => {
                await table.optimisticUpdate(
                    msg._id,
                    (m) => ({ ...m, archived: !m.archived, read: !m.archived ? true : m.read }),
                    () => (msg.archived ? unarchiveMessage(msg._id) : archiveMessage(msg._id)),
                );
            },
        });

        // Delete
        actions.push(createDeleteAction(() => table.optimisticDelete(msg._id, () => deleteMessage(msg._id)), `message from ${msg.name}`));

        return actions;
    };

    // ===== TYPE BADGE =====

    const TypeBadge = ({ type }: { type: string }) => {
        const colors: Record<string, string> = {
            general: 'bg-gray-100 text-gray-700',
            collaboration: 'bg-blue-100 text-blue-700',
            hiring: 'bg-green-100 text-green-700',
            feedback: 'bg-yellow-100 text-yellow-700',
        };
        return <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', colors[type] || colors.general)}>{type}</span>;
    };

    // ===== COLUMNS =====

    const columns: IDataTableColumn<SerializedMessage>[] = [
        {
            id: 'sender',
            header: 'Sender',
            accessor: (msg) => (
                <div className='min-w-0'>
                    <p className={cn('font-medium line-clamp-1', !msg.read && !msg.archived && 'font-semibold')}>{msg.name}</p>
                    <p className='text-sm text-muted-foreground line-clamp-1'>{msg.email}</p>
                </div>
            ),
            width: '200px',
        },
        {
            id: 'subject',
            header: 'Subject',
            accessor: (msg) => (
                <button onClick={() => setExpandedId(expandedId === msg._id ? null : msg._id)} className='text-left min-w-0 w-full'>
                    <p className={cn('font-medium line-clamp-1 hover:underline', !msg.read && !msg.archived && 'font-semibold')}>{msg.subject}</p>
                    <p className='text-sm text-muted-foreground line-clamp-1'>{msg.message}</p>
                </button>
            ),
            width: '350px',
        },
        {
            id: 'type',
            header: 'Type',
            cell: (msg) => <TypeBadge type={msg.type} />,
            align: 'center',
            width: '120px',
        },
        {
            id: 'status',
            header: 'Status',
            cell: (msg) => (
                <div className='flex items-center gap-1.5'>
                    {msg.archived ? (
                        <span className='text-xs text-muted-foreground flex items-center gap-1'>
                            <Archive className='h-3 w-3' /> Archived
                        </span>
                    ) : msg.read ? (
                        <span className='text-xs text-muted-foreground flex items-center gap-1'>
                            <Check className='h-3 w-3' /> Read
                        </span>
                    ) : (
                        <span className='text-xs text-blue-600 font-medium flex items-center gap-1'>
                            <Mail className='h-3 w-3' /> New
                        </span>
                    )}
                </div>
            ),
            align: 'center',
            width: '100px',
        },
        {
            id: 'date',
            header: 'Date',
            cell: (msg) => (
                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                    <Calendar className='h-3 w-3' />
                    {formatDate(new Date(msg.createdAt))}
                </div>
            ),
            width: '130px',
        },
        {
            id: 'actions',
            header: '',
            cell: (msg) => <DataTableActions actions={getRowActions(msg)} itemName={`message from ${msg.name}`} />,
            align: 'right',
            width: '60px',
        },
    ];

    // ===== BULK ACTIONS =====

    const bulkActions: IBulkActionNew[] = [
        {
            id: 'markRead',
            label: 'Mark as Read',
            icon: <Eye className='h-4 w-4' />,
            variant: 'default',
            action: (ids) =>
                table.optimisticBulkUpdate(
                    ids,
                    (m) => ({ ...m, read: true }),
                    async () => {
                        await Promise.all(ids.map((id) => markMessageRead(id)));
                    },
                ),
        },
        {
            id: 'archive',
            label: 'Archive',
            icon: <Archive className='h-4 w-4' />,
            variant: 'secondary',
            action: (ids) =>
                table.optimisticBulkUpdate(
                    ids,
                    (m) => ({ ...m, archived: true, read: true }),
                    async () => {
                        await Promise.all(ids.map((id) => archiveMessage(id)));
                    },
                ),
        },
        createBulkDeleteActionNew(async (ids) => {
            await Promise.all(ids.map((id) => table.optimisticDelete(id, () => deleteMessage(id))));
        }),
    ];

    // Unread count
    const unreadCount = messages.filter((m) => !m.read && !m.archived).length;

    // ===== RENDER =====

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <TableSearch placeholder='Search messages...' onSearch={table.setSearchQuery} filters={TABLE_FILTERS} onFilterChange={table.setFilters} activeFiltersCount={table.activeFiltersCount} />
                {unreadCount > 0 && (
                    <span className='text-sm text-muted-foreground'>
                        {unreadCount} unread message{unreadCount !== 1 && 's'}
                    </span>
                )}
            </div>

            <DataTable
                data={filteredByStatus.slice(0, table.displayCount)}
                columns={columns}
                keyExtractor={(m) => m._id}
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
                        <h3 className='mt-4 text-lg font-semibold'>No messages found</h3>
                        <p className='mt-2 text-muted-foreground'>
                            {table.searchQuery || table.activeFiltersCount > 0 ? 'Try adjusting your search or filters' : 'Messages from visitors will appear here'}
                        </p>
                    </div>
                }
            />

            {/* Expanded Message */}
            {expandedId && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
                    <div className='bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-auto'>
                        {(() => {
                            const msg = messages.find((m) => m._id === expandedId);
                            if (!msg) return null;
                            return (
                                <div className='p-6 space-y-4'>
                                    <div className='flex items-start justify-between'>
                                        <div>
                                            <h2 className='text-xl font-semibold'>{msg.subject}</h2>
                                            <p className='text-sm text-muted-foreground mt-1'>
                                                From: {msg.name} ({msg.email})
                                            </p>
                                            <div className='flex items-center gap-2 mt-2'>
                                                <TypeBadge type={msg.type} />
                                                <span className='text-sm text-muted-foreground'>{formatDate(new Date(msg.createdAt))}</span>
                                            </div>
                                        </div>
                                        <Button variant='ghost' size='icon' onClick={() => setExpandedId(null)}>
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    </div>
                                    <hr />
                                    <div className='whitespace-pre-wrap text-sm'>{msg.message}</div>
                                    <div className='flex gap-2 pt-4'>
                                        <Button
                                            variant='outline'
                                            onClick={() => {
                                                window.location.href = `mailto:${msg.email}?subject=Re: ${msg.subject}`;
                                            }}
                                        >
                                            <Mail className='h-4 w-4 mr-2' />
                                            Reply
                                        </Button>
                                        <Button variant='ghost' onClick={() => setExpandedId(null)}>
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

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
