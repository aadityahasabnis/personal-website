'use client';

import { ArrowBigUp, CornerDownRight, Loader2, MessageSquareReply } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

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
    failedUpvoteId: string | null;
    depth?: number;
}

// =============================================================
// Component
// =============================================================

export const CommentItem = ({ comment, onReply, onUpvote, hasUpvoted, pendingUpvoteId, failedUpvoteId, depth = 0 }: ICommentItemProps) => {
    const avatar = getAvatarById(comment.author.avatar ?? 'avatar-1');
    const serverUpvoted = hasUpvoted(comment.id);
    const isPending = pendingUpvoteId === comment.id;
    const isOwnComment = siteStorage.isOwnComment(comment.id);

    // Optimistic UI
    const [optimisticUpvoted, setOptimisticUpvoted] = useState(false);
    const lastKnownUpvotes = useRef(comment.upvotes);

    // Reset optimistic state when server data changes (upvotes increased)
    useEffect(() => {
        if (comment.upvotes !== lastKnownUpvotes.current) {
            setOptimisticUpvoted(false);
            lastKnownUpvotes.current = comment.upvotes;
        }
    }, [comment.upvotes]);

    // Reset optimistic state if upvote failed
    useEffect(() => {
        if (failedUpvoteId === comment.id) {
            setOptimisticUpvoted(false);
        }
    }, [failedUpvoteId, comment.id]);

    const isUpvoted = serverUpvoted || optimisticUpvoted;

    const handleUpvote = () => {
        if (isUpvoted || isPending || isOwnComment) return;
        setOptimisticUpvoted(true);
        onUpvote(comment.id);
    };

    const isReply = depth > 0;
    const canReply = depth < 2;
    // Only add +1 for optimistic UI when server hasn't confirmed yet
    const upvoteCount = optimisticUpvoted && !serverUpvoted ? comment.upvotes + 1 : comment.upvotes;

    // Button base styles for consistency
    const actionButtonBase = 'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-small font-medium rounded-md border transition-fast';

    return (
        <div className={cn(isReply && 'pl-6 sm:pl-10 border-l-2 border-border/50')}>
            {/* Main comment card */}
            <div className='relative flex gap-3 p-4 bg-card border border-border rounded-lg transition-fast'>
                {/* Reply indicator */}
                {isReply && (
                    <div className='absolute -left-6 sm:-left-10 top-6 flex items-center justify-center w-6 sm:w-10 text-muted-foreground/50'>
                        <CornerDownRight className='w-4 h-4 sm:w-5 sm:h-5' />
                    </div>
                )}

                {/* Avatar */}
                <div className='shrink-0'>
                    <div className={cn(
                        'w-10 h-10 rounded-full overflow-hidden border-2',
                        comment.author.isOwner ? 'border-primary' : 'border-border',
                    )}>
                        <Image
                            src={avatar?.image ?? '/avatars/avatar-1.png'}
                            alt={avatar?.label ?? 'Avatar'}
                            width={40}
                            height={40}
                            className='w-full h-full object-cover'
                        />
                    </div>
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                    {/* Header */}
                    <div className='flex flex-wrap items-center gap-x-2 gap-y-0.5'>
                        <span className='text-body font-semibold text-foreground'>{comment.author.name}</span>
                        {comment.author.isOwner && (
                            <span className='px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground bg-primary rounded'>
                                Author
                            </span>
                        )}
                        {isOwnComment && !comment.author.isOwner && (
                            <span className='px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded'>
                                You
                            </span>
                        )}
                        <span className='text-small text-muted-foreground'>
                            {formatDate(comment.createdAt)}
                        </span>
                    </div>

                    {/* Body */}
                    <p className='mt-2 text-body text-foreground leading-relaxed whitespace-pre-wrap'>
                        {comment.content}
                    </p>

                    {/* Actions - Hidden for own comments */}
                    {!isOwnComment && (
                        <div className='flex items-center gap-2 mt-3'>
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
                                        : 'text-muted-foreground bg-muted border-border hover:text-primary hover:bg-primary/5 hover:border-primary/30',
                                    (isUpvoted || isPending) && 'cursor-default',
                                )}
                            >
                                {isPending ? (
                                    <Loader2 className='w-4 h-4 animate-spin' />
                                ) : (
                                    <ArrowBigUp className={cn('w-4 h-4', isUpvoted && 'fill-current')} />
                                )}
                                <span>{upvoteCount}</span>
                            </button>

                            {/* Reply button */}
                            {canReply && (
                                <button
                                    type='button'
                                    onClick={() => onReply(comment.id)}
                                    className={cn(
                                        actionButtonBase,
                                        'text-muted-foreground bg-muted border-border hover:text-foreground hover:border-foreground/20',
                                    )}
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
                            <span>{upvoteCount} {upvoteCount === 1 ? 'upvote' : 'upvotes'}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Nested replies */}
            {comment.replies.length > 0 && (
                <div className='mt-3 space-y-3'>
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                            onUpvote={onUpvote}
                            hasUpvoted={hasUpvoted}
                            pendingUpvoteId={pendingUpvoteId}
                            failedUpvoteId={failedUpvoteId}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
