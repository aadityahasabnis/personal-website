'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquare, Calendar, ThumbsUp, MessageCircle, Flag, Check, X, Reply } from 'lucide-react';

import { formatDate } from '@/lib/utils';
import { useAdminTable } from '@/hooks';
import {
    DataTable,
    TableSearch,
    BulkActionsBar,
    DataTableActions,
    createDeleteAction,
    createBulkDeleteActionNew,
    type IDataTableColumn,
    type IDataTableAction,
    type IBulkActionNew,
    type ITableFilter,
} from '@/components/admin';
import {
    approveComment,
    rejectComment,
    deleteComment,
    clearReportedFlag,
    type IAdminComment,
} from '@/server/actions/comments';
import { adminReplyToComment } from '@/server/admin/comments';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ===== FILTERS CONFIG =====

const TABLE_FILTERS: ITableFilter[] = [
    {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { label: 'All Comments', value: 'all' },
            { label: 'Approved', value: 'approved' },
            { label: 'Pending', value: 'pending' },
            { label: 'Reported', value: 'reported' },
        ],
    },
];

// ===== COMPONENT =====

interface ICommentsTableProps {
    comments: IAdminComment[];
}

export function CommentsTable({ comments }: ICommentsTableProps): React.ReactElement {
    const router = useRouter();
    const [replyDialog, setReplyDialog] = useState<{ comment: IAdminComment; content: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const table = useAdminTable({
        data: comments,
        keyExtractor: (c) => c._id,
        searchFn: (c, query) =>
            c.author.name.toLowerCase().includes(query) ||
            c.author.email.toLowerCase().includes(query) ||
            c.content.toLowerCase().includes(query) ||
            c.articleSlug.toLowerCase().includes(query),
    });

    // Custom filtering for status
    const filteredByStatus = table.filteredItems.filter((c) => {
        const status = table.filters.status;
        if (!status || status === 'all') return true;
        if (status === 'approved') return c.approved && !c.reported;
        if (status === 'pending') return !c.approved;
        if (status === 'reported') return c.reported;
        return true;
    });

    // ===== STATUS BADGE =====

    const StatusBadge = ({ comment }: { comment: IAdminComment }) => {
        if (comment.reported) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <Flag className="h-3 w-3" /> Reported
                </span>
            );
        }
        if (comment.approved) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <Check className="h-3 w-3" /> Approved
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                Pending
            </span>
        );
    };

    // ===== ROW ACTIONS =====

    const getRowActions = (comment: IAdminComment): IDataTableAction[] => {
        const actions: IDataTableAction[] = [];

        // Reply action - first for quick access
        actions.push({
            label: 'Reply',
            icon: 'MessageSquare',
            action: 'custom',
            onClick: () => {
                setReplyDialog({ comment, content: '' });
            },
        });

        if (!comment.approved) {
            actions.push({
                label: 'Approve',
                icon: 'CheckCircle2',
                action: 'custom',
                onClick: async () => {
                    await table.optimisticUpdate(
                        comment._id,
                        (c) => ({ ...c, approved: true }),
                        () => approveComment(comment._id)
                    );
                },
            });
        } else {
            actions.push({
                label: 'Reject',
                icon: 'Pause',
                action: 'custom',
                onClick: async () => {
                    await table.optimisticUpdate(
                        comment._id,
                        (c) => ({ ...c, approved: false }),
                        () => rejectComment(comment._id)
                    );
                },
            });
        }

        if (comment.reported) {
            actions.push({
                label: 'Clear Report',
                icon: 'CheckCircle2',
                action: 'custom',
                onClick: async () => {
                    await table.optimisticUpdate(
                        comment._id,
                        (c) => ({ ...c, reported: false }),
                        () => clearReportedFlag(comment._id)
                    );
                },
            });
        }

        actions.push(
            createDeleteAction(
                () => table.optimisticDelete(comment._id, () => deleteComment(comment._id)),
                `comment by ${comment.author.name}`
            )
        );

        return actions;
    };

    // ===== COLUMNS =====

    const columns: IDataTableColumn<IAdminComment>[] = [
        {
            id: 'author',
            header: 'Author',
            accessor: (comment) => (
                <div className="min-w-0">
                    <p className="font-medium line-clamp-1">{comment.author.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{comment.author.email}</p>
                </div>
            ),
            width: '180px',
        },
        {
            id: 'content',
            header: 'Content',
            accessor: (comment) => (
                <div className="min-w-0">
                    <p className="text-sm line-clamp-2">{comment.content}</p>
                    <Link
                        href={`/articles/${comment.articleSlug}`}
                        className="text-xs text-muted-foreground hover:text-foreground mt-1 inline-block"
                    >
                        {comment.articleSlug}
                    </Link>
                </div>
            ),
            width: '350px',
        },
        {
            id: 'status',
            header: 'Status',
            cell: (comment) => <StatusBadge comment={comment} />,
            align: 'center',
            width: '120px',
        },
        {
            id: 'stats',
            header: 'Stats',
            cell: (comment) => (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> {comment.upvotes}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> {comment.replyCount}
                    </span>
                </div>
            ),
            align: 'center',
            width: '100px',
        },
        {
            id: 'date',
            header: 'Date',
            cell: (comment) => (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(new Date(comment.createdAt))}
                </div>
            ),
            width: '130px',
        },
        {
            id: 'actions',
            header: '',
            cell: (comment) => <DataTableActions actions={getRowActions(comment)} itemName={`comment by ${comment.author.name}`} />,
            align: 'right',
            width: '60px',
        },
    ];

    // ===== BULK ACTIONS =====

    const bulkActions: IBulkActionNew[] = [
        {
            id: 'approve',
            label: 'Approve',
            icon: <Check className="h-4 w-4" />,
            variant: 'default',
            action: (ids) => table.optimisticBulkUpdate(
                ids,
                (c) => ({ ...c, approved: true }),
                async () => { await Promise.all(ids.map((id) => approveComment(id))); }
            ),
        },
        {
            id: 'reject',
            label: 'Reject',
            icon: <X className="h-4 w-4" />,
            variant: 'secondary',
            action: (ids) => table.optimisticBulkUpdate(
                ids,
                (c) => ({ ...c, approved: false }),
                async () => { await Promise.all(ids.map((id) => rejectComment(id))); }
            ),
        },
        createBulkDeleteActionNew(async (ids) => {
            await Promise.all(ids.map((id) => table.optimisticDelete(id, () => deleteComment(id))));
        }),
    ];

    // Stats
    const pendingCount = comments.filter((c) => !c.approved).length;
    const reportedCount = comments.filter((c) => c.reported).length;

    // ===== REPLY HANDLER =====
    
    const handleSubmitReply = async () => {
        if (!replyDialog || !replyDialog.content.trim()) return;
        
        setIsSubmitting(true);
        try {
            const result = await adminReplyToComment({
                commentId: replyDialog.comment._id,
                content: replyDialog.content.trim(),
            });
            
            if (result.success) {
                setReplyDialog(null);
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to submit reply:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ===== RENDER =====

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <TableSearch
                    placeholder="Search comments..."
                    onSearch={table.setSearchQuery}
                    filters={TABLE_FILTERS}
                    onFilterChange={table.setFilters}
                    activeFiltersCount={table.activeFiltersCount}
                />
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {pendingCount > 0 && <span>{pendingCount} pending</span>}
                    {reportedCount > 0 && <span className="text-red-600">{reportedCount} reported</span>}
                </div>
            </div>

            <DataTable
                data={filteredByStatus.slice(0, table.displayCount)}
                columns={columns}
                keyExtractor={(c) => c._id}
                selectable
                selectedIds={table.selectedIds}
                onSelectionChange={table.setSelectedIds}
                infiniteScroll
                hasMore={filteredByStatus.length > table.displayCount}
                onLoadMore={async () => table.loadMore()}
                isLoading={table.isPending}
                emptyState={
                    <div className="p-12 text-center">
                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No comments found</h3>
                        <p className="mt-2 text-muted-foreground">
                            {table.searchQuery || table.activeFiltersCount > 0
                                ? 'Try adjusting your search or filters'
                                : 'Comments will appear here when readers engage'}
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

            {/* Reply Dialog */}
            <Dialog open={!!replyDialog} onOpenChange={(open) => !open && setReplyDialog(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Reply className="h-5 w-5" />
                            Reply to Comment
                        </DialogTitle>
                        <DialogDescription>
                            Replying to {replyDialog?.comment.author.name}&apos;s comment
                        </DialogDescription>
                    </DialogHeader>
                    
                    {replyDialog && (
                        <div className="space-y-4">
                            {/* Original Comment Preview */}
                            <div className="p-3 rounded-lg bg-muted/50 border text-sm">
                                <p className="text-muted-foreground italic line-clamp-3">
                                    &quot;{replyDialog.comment.content}&quot;
                                </p>
                            </div>
                            
                            {/* Reply Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Your Reply</label>
                                <textarea
                                    value={replyDialog.content}
                                    onChange={(e) => setReplyDialog({ ...replyDialog, content: e.target.value })}
                                    placeholder="Write your reply..."
                                    className={cn(
                                        'w-full min-h-[120px] px-3 py-2 rounded-lg border bg-background',
                                        'focus:outline-none focus:ring-2 focus:ring-ring resize-y text-sm'
                                    )}
                                    maxLength={2000}
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {replyDialog.content.length}/2000
                                </p>
                            </div>

                            {/* Owner Badge Notice */}
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Check className="h-3 w-3 text-green-600" />
                                This reply will display with an &quot;Author&quot; badge
                            </p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setReplyDialog(null)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitReply}
                            disabled={isSubmitting || !replyDialog?.content.trim()}
                        >
                            {isSubmitting ? 'Posting...' : 'Post Reply'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
