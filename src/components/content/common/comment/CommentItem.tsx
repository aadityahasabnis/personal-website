'use client';

import { ArrowBigUp, CornerDownRight, Loader2, MessageSquareReply } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';

import { getAvatarById, siteStorage } from '@/lib/storage';
import { cn, formatDate } from '@/lib/utils';

import type { ICommentNode } from './types';

// =============================================================
// Types
// =============================================================

interface ICommentItemProps {
    comment: ICommentNode;
    onReply: (commentId: string) => void;
    onUpvote: (commentId: string) => void;
    hasUpvoted: (commentId: string) => boolean;
    pendingUpvoteId: string | null;
    depth?: number;
}

// =============================================================
// Component
// =============================================================

export const CommentItem = ({ comment, onReply, onUpvote, hasUpvoted, pendingUpvoteId, depth = 0 }: ICommentItemProps) => {
    const avatar = getAvatarById(comment.author.avatar ?? 'avatar-1');
    const serverUpvoted = hasUpvoted(comment.id);
    const isPending = pendingUpvoteId === comment.id;
    const isOwnComment = siteStorage.isOwnComment(comment.id);

    // Optimistic UI: while the upvote request is in-flight.
    const optimisticUpvoted = useMemo(() => isPending && !serverUpvoted, [isPending, serverUpvoted]);
    const isUpvoted = serverUpvoted || optimisticUpvoted;

    const handleUpvote = () => {
        if (isUpvoted || isPending || isOwnComment) return;
        onUpvote(comment.id);
    };

    const isReply = depth > 0;
    const canReply = depth < 2;
    // Only add +1 for optimistic UI while pending.
    const upvoteCount = optimisticUpvoted ? comment.upvotes + 1 : comment.upvotes;

    // Button base styles for consistency
    const actionButtonBase =
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-small font-medium rounded-md border transition-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0';

    return (
        <div className={cn('relative', isReply && 'ml-3 sm:ml-6 pl-3 sm:pl-6')}>
            {/* Thread guide for replies */}
            {isReply && <div aria-hidden className='absolute left-0 top-0 bottom-0 w-px bg-border/60' />}

            {/* Main comment card */}
            <div className={cn('group relative flex gap-3 p-4 rounded-xl border transition-fast', 'bg-card border-border shadow-sm', 'hover:border-foreground/15', isReply && 'bg-card/80')}>
                {/* Reply indicator */}
                {isReply && (
                    <div
                        className={cn('absolute left-0 top-7 -translate-x-1/2', 'flex items-center justify-center w-6 h-6 rounded-full', 'bg-background border border-border text-muted-foreground/70')}
                        aria-hidden
                    >
                        <CornerDownRight className='w-3.5 h-3.5' />
                    </div>
                )}

                {/* Avatar */}
                <div className='shrink-0'>
                    <div className={cn('w-10 h-10 rounded-full overflow-hidden border', comment.author.isOwner ? 'border-primary/70' : 'border-border')}>
                        <Image src={avatar?.image ?? '/avatars/avatar-1.png'} alt={avatar?.label ?? 'Avatar'} width={40} height={40} className='w-full h-full object-cover' />
                    </div>
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                    {/* Header */}
                    <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                        <span className='text-body font-semibold text-foreground truncate'>{comment.author.name}</span>
                        {comment.author.isOwner && (
                            <span className='px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10 border border-primary/20 rounded'>Author</span>
                        )}
                        {isOwnComment && !comment.author.isOwner && <span className='px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted/70 border border-border rounded'>You</span>}
                        <span className='text-small text-muted-foreground'>{formatDate(comment.createdAt)}</span>
                    </div>

                    {/* Body */}
                    <p className='mt-2 text-body text-foreground leading-relaxed whitespace-pre-wrap'>{comment.content}</p>

                    {/* Actions - Hidden for own comments */}
                    {!isOwnComment && (
                        <div className='flex flex-wrap items-center gap-2 mt-3'>
                            {/* Upvote button */}
                            <button
                                type='button'
                                onClick={handleUpvote}
                                disabled={isUpvoted || isPending}
                                title={isUpvoted ? 'Upvoted' : 'Upvote this comment'}
                                className={cn(
                                    actionButtonBase,
                                    isUpvoted
                                        ? 'text-primary bg-primary/10 border-primary/20'
                                        : 'text-muted-foreground bg-background border-border hover:text-primary hover:bg-primary/5 hover:border-primary/30',
                                    (isUpvoted || isPending) && 'cursor-default',
                                )}
                                aria-pressed={isUpvoted}
                            >
                                {isPending ? <Loader2 className='w-4 h-4 animate-spin' /> : <ArrowBigUp className={cn('w-4 h-4', isUpvoted && 'fill-current')} />}
                                <span>{upvoteCount}</span>
                            </button>

                            {/* Reply button */}
                            {canReply && (
                                <button
                                    type='button'
                                    onClick={() => onReply(comment.id)}
                                    className={cn(actionButtonBase, 'text-muted-foreground bg-background border-border hover:text-foreground hover:border-foreground/20 hover:bg-muted/40')}
                                >
                                    <MessageSquareReply className='w-4 h-4' />
                                    <span>Reply</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Own comment indicator (shows upvote count only) */}
                    {isOwnComment && upvoteCount > 0 && (
                        <div className='flex items-center gap-1.5 mt-3 text-small text-muted-foreground'>
                            <ArrowBigUp className='w-4 h-4' />
                            <span>
                                {upvoteCount} {upvoteCount === 1 ? 'upvote' : 'upvotes'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Nested replies */}
            {comment.replies.length > 0 && (
                <div className='mt-3 space-y-3'>
                    {comment.replies.map((reply) => (
                        <CommentItem key={reply.id} comment={reply} onReply={onReply} onUpvote={onUpvote} hasUpvoted={hasUpvoted} pendingUpvoteId={pendingUpvoteId} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};
