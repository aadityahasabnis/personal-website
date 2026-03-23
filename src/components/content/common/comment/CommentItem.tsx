'use client';

import { ChevronUp, Reply } from 'lucide-react';
import Image from 'next/image';

import { getAvatarById } from '@/lib/storage';
import { cn, formatDate } from '@/lib/utils';

import type { ICommentNode } from './types';

interface ICommentItemProps {
    comment: ICommentNode;
    onReply: (commentId: string) => void;
    onUpvote: (commentId: string) => void;
    hasUpvoted: (commentId: string) => boolean;
    pendingUpvoteId: string | null;
    isReply?: boolean;
}

export const CommentItem = ({ comment, onReply, onUpvote, hasUpvoted, pendingUpvoteId, isReply = false }: ICommentItemProps) => {
    const avatar = getAvatarById(comment.author.avatar ?? 'avatar-1');
    const liked = hasUpvoted(comment.id);
    const isPending = pendingUpvoteId === comment.id;

    return (
        <article className={cn('p-4 bg-card border border-border rounded-xl', isReply ? 'ml-8' : '')}>
            <div className='flex items-start gap-3'>
                <div className='size-10 rounded-full border border-border overflow-hidden'>
                    <Image src={avatar?.image ?? '/avatars/avatar-1.png'} alt={avatar?.label ?? 'User avatar'} width={40} height={40} className='w-full h-full object-cover' />
                </div>

                <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap'>
                        <p className='text-body font-medium text-foreground'>{comment.author.name}</p>
                        {comment.author.isOwner && <span className='px-2 py-0.5 text-label font-medium text-primary bg-primary/10 border border-primary/20 rounded-full'>Author</span>}
                        <time className='text-label text-muted-foreground' dateTime={comment.createdAt}>
                            {formatDate(comment.createdAt)}
                        </time>
                    </div>

                    <p className='mt-2 text-body text-foreground whitespace-pre-wrap'>{comment.content}</p>

                    <div className='flex items-center gap-3 mt-3'>
                        <button
                            type='button'
                            onClick={() => onUpvote(comment.id)}
                            disabled={liked || isPending}
                            className={cn(
                                'flex items-center gap-1 px-2.5 py-1 text-label font-medium bg-background border rounded-md transition-base',
                                liked ? 'text-primary border-primary/40' : 'text-muted-foreground border-border hover:text-primary hover:border-primary/40',
                                isPending ? 'opacity-70 cursor-wait' : '',
                            )}
                            aria-label={liked ? 'Comment already upvoted' : 'Upvote comment'}
                        >
                            <ChevronUp className='size-3.5' />
                            {comment.upvotes}
                        </button>

                        {!isReply && (
                            <button
                                type='button'
                                onClick={() => onReply(comment.id)}
                                className='flex items-center gap-1 px-2.5 py-1 text-label font-medium text-muted-foreground bg-background border border-border rounded-md transition-base hover:text-primary hover:border-primary/40'
                            >
                                <Reply className='size-3.5' />
                                Reply
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {comment.replies.length > 0 && (
                <div className='grid gap-3 mt-4'>
                    {comment.replies.map((reply) => (
                        <CommentItem key={reply.id} comment={reply} onReply={onReply} onUpvote={onUpvote} hasUpvoted={hasUpvoted} pendingUpvoteId={pendingUpvoteId} isReply />
                    ))}
                </div>
            )}
        </article>
    );
};
