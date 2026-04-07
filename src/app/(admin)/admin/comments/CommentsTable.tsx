'use client';

// =============================================================
// CommentsTable - Professional Server-Side Table for Comments
// Uses DataTable component with server-action-first architecture
// Uses useAction hook for TanStack Query mutation benefits
// Uses useDialog for viewing full comment details and admin replies
// =============================================================

import { MessageCircle, MessageSquareReply, ThumbsUp, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

import { DataTable } from '@/components/admin/table';
import { useDialog } from '@/hooks/ui/useDialog';
import { useSnackbar } from '@/hooks/form/useSnackbar';
import { useAction } from '@/hooks/server/useAction';
import { getAvatarById } from '@/lib/storage';
import { formatDate } from '@/lib/utils';
import type { IAdminCommentRow } from '@/server/new/admin/comments';
import {
    adminReplyToComment,
    approveComment,
    bulkApproveComments,
    bulkDeleteComments,
    deleteComment,
    getComments,
    rejectComment,
} from '@/server/new/admin/comments';

import {
    createCommentsTableConfig,
    type ICommentActionHandlers,
    type ICommentBulkActionHandlers,
} from './config';

// =============================================================
// Types
// =============================================================

interface ICommentsTableProps {
    /** Initial server-side data for hydration */
    initialData?: IAdminCommentRow[] | undefined;
    /** Initial total count for pagination */
    initialTotal?: number | undefined;
}

// =============================================================
// Reply Form Data Interface
// =============================================================

interface IReplyFormData {
    content: string;
    [key: string]: unknown;
}

// =============================================================
// Helper to resolve avatar ID to image path
// =============================================================

/**
 * Resolves an avatar value to an image URL.
 * - If it's an avatar ID (e.g., 'avatar-1'), looks up the image path from AVATAR_OPTIONS
 * - If it's already a URL (starts with http/https or /), returns as-is
 * - Returns null if no valid avatar found
 */
function resolveAvatarUrl(avatar: string | null): string | null {
    if (!avatar) return null;
    
    // If it's already a URL or absolute path, return as-is
    if (avatar.startsWith('http') || avatar.startsWith('/avatars/')) {
        return avatar;
    }
    
    // Try to resolve as avatar ID
    const avatarOption = getAvatarById(avatar);
    return avatarOption?.image ?? null;
}

// =============================================================
// Comment View Dialog Content Component
// =============================================================

function CommentViewContent({ comment }: { comment: IAdminCommentRow }): React.ReactElement {
    const avatarUrl = resolveAvatarUrl(comment.author.avatar);
    
    return (
        <div className="space-y-4">
            {/* Author Info */}
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={comment.author.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                            unoptimized
                        />
                    ) : (
                        <User className="h-5 w-5" />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-medium">{comment.author.name}</p>
                        {comment.author.isOwner && (
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                Owner
                            </span>
                        )}
                    </div>
                    <a
                        href={`mailto:${comment.author.email}`}
                        className="text-sm text-muted-foreground hover:text-primary hover:underline"
                    >
                        {comment.author.email}
                    </a>
                </div>
            </div>

            {/* Comment Body */}
            <div>
                <p className="text-sm font-medium text-muted-foreground">Comment</p>
                <div className="mt-1 rounded-md border bg-muted/50 p-3">
                    <p className="whitespace-pre-wrap text-sm">{comment.body}</p>
                </div>
            </div>

            {/* Parent Comment (if this is a reply) */}
            {comment.isReply && comment.parentPreview && (
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        In reply to {comment.parentAuthorName ?? 'Unknown'}
                    </p>
                    <div className="mt-1 rounded-md border border-dashed bg-muted/30 p-3">
                        <p className="text-sm italic text-muted-foreground">{comment.parentPreview}</p>
                    </div>
                </div>
            )}

            {/* Content Info */}
            {comment.contentTitle && (
                <div>
                    <p className="text-sm font-medium text-muted-foreground">On Content</p>
                    <div className="mt-1 flex items-center gap-2">
                        {comment.contentType && (
                            <span className="inline-flex items-center rounded bg-secondary px-2 py-0.5 text-xs font-medium capitalize">
                                {comment.contentType}
                            </span>
                        )}
                        <span className="text-sm">{comment.contentTitle}</span>
                    </div>
                </div>
            )}

            {/* Stats & Metadata */}
            <div className="grid grid-cols-3 gap-4 border-t pt-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            comment.moderationStatus === 'approved'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                    >
                        {comment.moderationStatus === 'approved' ? 'Approved' : 'Pending'}
                    </span>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Upvotes</p>
                    <p className="text-sm">{comment.upvotes}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Replies</p>
                    <p className="text-sm">{comment.replyCount}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="text-sm">{formatDate(comment.createdAt)}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Updated</p>
                    <p className="text-sm">{formatDate(comment.updatedAt)}</p>
                </div>
            </div>
        </div>
    );
}

// =============================================================
// CommentsTable Component
// =============================================================

export function CommentsTable({ initialData, initialTotal }: ICommentsTableProps): React.ReactElement {
    const { showSuccess, showError } = useSnackbar();
    const { openView, openForm, closeDialog } = useDialog();

    // =============================================================
    // Row Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - DataTableActions handles invalidation
    // =============================================================

    const approveAction = useAction({
        action: async (comment: IAdminCommentRow) => approveComment(comment.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Comment approved');
        },
        onError: (message) => {
            showError(message ?? 'Failed to approve comment');
        },
    });

    const rejectAction = useAction({
        action: async (comment: IAdminCommentRow) => rejectComment(comment.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Comment rejected');
        },
        onError: (message) => {
            showError(message ?? 'Failed to reject comment');
        },
    });

    const deleteAction = useAction({
        action: async (comment: IAdminCommentRow) => deleteComment(comment.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Comment deleted successfully');
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete comment');
        },
    });

    const replyAction = useAction({
        action: async ({ commentId, content }: { commentId: string; content: string }) =>
            adminReplyToComment({ commentId, content }),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Reply posted successfully');
            closeDialog();
        },
        onError: (message) => {
            showError(message ?? 'Failed to post reply');
        },
    });

    const rowActionHandlers: ICommentActionHandlers = useMemo(
        () => ({
            onView: (comment: IAdminCommentRow) => {
                openView({
                    title: 'Comment Details',
                    description: `By ${comment.author.name}`,
                    icon: MessageCircle,
                    content: <CommentViewContent comment={comment} />,
                    width: 'lg',
                    closeLabel: 'Close',
                });
            },
            onApprove: async (comment: IAdminCommentRow) => {
                await approveAction.mutateAsync(comment);
            },
            onReject: async (comment: IAdminCommentRow) => {
                await rejectAction.mutateAsync(comment);
            },
            onReply: (comment: IAdminCommentRow) => {
                openForm<IReplyFormData>({
                    title: 'Reply to Comment',
                    description: `Replying to ${comment.author.name}'s comment`,
                    width: 'lg',
                    fields: [
                        {
                            fieldtype: 'textArea',
                            name: 'content',
                            label: 'Your Reply',
                            placeholder: 'Write your reply...',
                            required: true,
                            rows: 5,
                            colsize: 'full',
                        },
                    ],
                    defaultValues: {
                        content: '',
                    },
                    submitLabel: 'Post Reply',
                    cancelLabel: 'Cancel',
                    onSubmit: async (data: IReplyFormData) => {
                        await replyAction.mutateAsync({
                            commentId: comment.id,
                            content: data.content,
                        });
                    },
                });
            },
            onDelete: async (comment: IAdminCommentRow) => {
                await deleteAction.mutateAsync(comment);
            },
        }),
        [
            openView,
            openForm,
            approveAction.mutateAsync,
            rejectAction.mutateAsync,
            deleteAction.mutateAsync,
            replyAction.mutateAsync,
        ],
    );

    // =============================================================
    // Bulk Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - BulkActionsBar handles invalidation
    // =============================================================

    const bulkApproveAction = useAction({
        action: async (_rows: IAdminCommentRow[], ids: string[]) => bulkApproveComments(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} comments approved`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to approve comments');
        },
    });

    const bulkDeleteAction = useAction({
        action: async (_rows: IAdminCommentRow[], ids: string[]) => bulkDeleteComments(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} comments deleted`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete comments');
        },
    });

    const bulkActionHandlers: ICommentBulkActionHandlers = useMemo(
        () => ({
            onBulkApprove: async (rows: IAdminCommentRow[], ids: string[]) => {
                await bulkApproveAction.mutateAsync(rows, ids);
            },
            onBulkDelete: async (rows: IAdminCommentRow[], ids: string[]) => {
                await bulkDeleteAction.mutateAsync(rows, ids);
            },
        }),
        [bulkApproveAction.mutateAsync, bulkDeleteAction.mutateAsync],
    );

    // =============================================================
    // Table Config with Custom Cell Renderers
    // =============================================================

    const config = useMemo(() => {
        const baseConfig = createCommentsTableConfig({
            rowActions: rowActionHandlers,
            bulkActions: bulkActionHandlers,
        });

        // Add custom cell renderers
        const columnsWithRenderers = baseConfig.columns.map((col) => {
            // Author column - Avatar + Name + Email + Owner Badge
            if (col.id === 'author') {
                return {
                    ...col,
                    cell: (comment: IAdminCommentRow) => {
                        const avatarUrl = resolveAvatarUrl(comment.author.avatar);
                        
                        return (
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                                    {avatarUrl ? (
                                        <Image
                                            src={avatarUrl}
                                            alt={comment.author.name}
                                            width={36}
                                            height={36}
                                            className="h-9 w-9 rounded-full object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <User className="h-4 w-4" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="truncate font-medium">{comment.author.name}</p>
                                        {comment.author.isOwner && (
                                            <span className="inline-flex shrink-0 items-center rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                                                Owner
                                            </span>
                                        )}
                                    </div>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {comment.author.email}
                                    </p>
                                </div>
                            </div>
                        );
                    },
                };
            }

            // Comment column - Preview + Parent preview if reply
            if (col.id === 'comment') {
                return {
                    ...col,
                    cell: (comment: IAdminCommentRow) => (
                        <div className="min-w-0 space-y-1">
                            <p className="line-clamp-2 text-sm">{comment.bodyPreview}</p>
                            {comment.isReply && comment.parentAuthorName && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MessageSquareReply className="h-3 w-3" />
                                    <span>Reply to {comment.parentAuthorName}</span>
                                </div>
                            )}
                        </div>
                    ),
                };
            }

            // Content column - Title + Type Badge + Link
            if (col.id === 'content') {
                return {
                    ...col,
                    cell: (comment: IAdminCommentRow) => {
                        if (!comment.contentTitle) {
                            return <span className="text-sm text-muted-foreground">Unknown</span>;
                        }

                        // Build admin edit URL based on content type
                        const getContentUrl = () => {
                            if (!comment.contentSlug || !comment.contentType) return null;
                            
                            switch (comment.contentType) {
                                case 'article':
                                    return `/admin/articles/${comment.contentSlug}/edit`;
                                case 'blog':
                                    return `/admin/blogs/${comment.contentSlug}/edit`;
                                case 'project':
                                    return `/admin/projects/${comment.contentSlug}/edit`;
                                default:
                                    return null;
                            }
                        };

                        const contentUrl = getContentUrl();

                        return (
                            <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                    {comment.contentType && (
                                        <span className="inline-flex shrink-0 items-center rounded bg-secondary px-1.5 py-0.5 text-xs font-medium capitalize">
                                            {comment.contentType}
                                        </span>
                                    )}
                                </div>
                                {contentUrl ? (
                                    <Link
                                        href={contentUrl}
                                        className="block truncate text-sm font-medium text-primary hover:underline"
                                    >
                                        {comment.contentTitle}
                                    </Link>
                                ) : (
                                    <p className="truncate text-sm font-medium">{comment.contentTitle}</p>
                                )}
                            </div>
                        );
                    },
                };
            }

            // Status column - Approved/Pending badge
            if (col.id === 'moderationStatus') {
                return {
                    ...col,
                    cell: (comment: IAdminCommentRow) => {
                        const isApproved = comment.moderationStatus === 'approved';

                        return (
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    isApproved
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}
                            >
                                {isApproved ? 'Approved' : 'Pending'}
                            </span>
                        );
                    },
                };
            }

            // Stats column - Upvotes + Replies
            if (col.id === 'stats') {
                return {
                    ...col,
                    cell: (comment: IAdminCommentRow) => (
                        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1" title="Upvotes">
                                <ThumbsUp className="h-3.5 w-3.5" />
                                {comment.upvotes}
                            </span>
                            <span className="flex items-center gap-1" title="Replies">
                                <MessageCircle className="h-3.5 w-3.5" />
                                {comment.replyCount}
                            </span>
                        </div>
                    ),
                };
            }

            // Date column - Formatted date
            if (col.id === 'createdAt') {
                return {
                    ...col,
                    cell: (comment: IAdminCommentRow) => (
                        <span className="text-sm text-muted-foreground">{formatDate(comment.createdAt)}</span>
                    ),
                };
            }

            return col;
        });

        return {
            ...baseConfig,
            columns: columnsWithRenderers,
        };
    }, [rowActionHandlers, bulkActionHandlers]);

    // =============================================================
    // Render
    // =============================================================

    return <DataTable config={config} serverAction={getComments} initialData={initialData} initialTotal={initialTotal} />;
}

export default CommentsTable;
