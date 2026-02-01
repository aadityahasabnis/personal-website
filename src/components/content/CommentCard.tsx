'use client';

import { Reply, Shield } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getAvatarById } from '@/lib/storage';

interface ICommentCardProps {
    comment: {
        _id: string;
        author: {
            name: string;
            avatar?: string;
            isAuthor?: boolean;
        };
        content: string;
        likes: number;
        replies?: ICommentCardProps['comment'][];
        createdAt: string;
    };
    onReply: (commentId: string) => void;
    isReply?: boolean;
}

/**
 * CommentCard - Display a single comment with avatar and metadata
 * 
 * Features:
 * - Emoji avatar display
 * - Author badge for site owner replies
 * - Reply button
 * - Nested replies support
 * - Formatted timestamps
 */
export function CommentCard({ comment, onReply, isReply = false }: ICommentCardProps) {
    const avatar = getAvatarById(comment.author.avatar || 'avatar-1');

    return (
        <div className={isReply ? 'ml-12 mt-4' : ''}>
            <div className="p-6 border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] hover:border-[var(--accent)]/30 transition-colors">
                {/* Comment Header */}
                <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0 size-10 rounded-full bg-[var(--accent-subtle)] border-2 border-[var(--accent)] flex items-center justify-center text-xl">
                        {avatar?.emoji || '😊'}
                    </div>

                    {/* Author Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-[var(--fg)]">
                                {comment.author.name}
                            </span>
                            {comment.author.isAuthor && (
                                <span 
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-medium"
                                    title="Article Author"
                                >
                                    <Shield className="size-3" />
                                    Author
                                </span>
                            )}
                            <span className="text-sm text-[var(--fg-subtle)]">
                                {formatDate(new Date(comment.createdAt))}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Comment Content */}
                <div className="mb-4 text-[var(--fg)] whitespace-pre-wrap break-words">
                    {comment.content}
                </div>

                {/* Comment Actions */}
                {!isReply && (
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => onReply(comment._id)}
                            className="inline-flex items-center gap-1.5 text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors"
                        >
                            <Reply className="size-4" />
                            Reply
                        </button>
                    </div>
                )}
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="space-y-4 mt-4">
                    {comment.replies.map((reply) => (
                        <CommentCard
                            key={reply._id}
                            comment={reply}
                            onReply={onReply}
                            isReply={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
