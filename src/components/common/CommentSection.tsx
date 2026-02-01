'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useComments, usePostComment, type ContentType } from '@/hooks/useContentData';
import {
    MessageSquare,
    Send,
    AlertCircle,
    Loader2,
    User,
    Reply as ReplyIcon,
    Shield,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { siteStorage, getAvatarById } from '@/lib/storage';
import { AvatarSelector } from '@/components/content/AvatarSelector';

interface ICommentSectionProps {
    slug: string;
    contentType: ContentType;
    className?: string;
}

interface IComment {
    _id: string;
    author: {
        name: string;
        avatar?: string;
        isAuthor?: boolean;
    };
    content: string;
    likes: number;
    replies?: IComment[];
    createdAt: string;
}

/**
 * CommentSection - Reusable, responsive comments component
 *
 * Features:
 * - TanStack Query caching (5 mins)
 * - Auto-approved comments (instant feedback)
 * - Nested replies with visual threading
 * - Avatar selector
 * - Saved author info
 * - Professional card-based UI
 * - Lavender accent theme
 * - Fully responsive (mobile, tablet, desktop)
 */
export function CommentSection({ slug, contentType, className }: ICommentSectionProps) {
    const { data: commentsData, isLoading, refetch } = useComments(slug, contentType);
    const postMutation = usePostComment(slug, contentType);

    const [showForm, setShowForm] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [content, setContent] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState<string>(() => {
        const saved = siteStorage.getCommentAuthor();
        return saved?.avatar || 'avatar-1';
    });

    // Load saved author info on mount
    useState(() => {
        const savedAuthor = siteStorage.getCommentAuthor();
        if (savedAuthor) {
            setName(savedAuthor.name);
            setEmail(savedAuthor.email);
            setSelectedAvatar(savedAuthor.avatar);
        }
    });

    const comments = commentsData?.data ?? [];
    const total = commentsData?.metadata?.total ?? 0;

    // Handle form submission
    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();

            postMutation.mutate(
                {
                    author: { name, email, avatar: selectedAvatar },
                    content,
                    replyTo: replyingTo?.id,
                },
                {
                    onSuccess: () => {
                        // Clear form
                        setContent('');
                        setReplyingTo(null);

                        // Save author info
                        siteStorage.setCommentAuthor({ name, email, avatar: selectedAvatar });

                        // Update profile
                        const userProfile = siteStorage.getUserProfile();
                        if (!userProfile?.subscribedAt) {
                            siteStorage.updateUserProfile({
                                name,
                                email,
                                avatar: selectedAvatar,
                                subscribedAt: new Date().toISOString(),
                            });
                        }

                        // Refetch to show new comment immediately
                        setTimeout(() => refetch(), 500);
                    },
                }
            );
        },
        [name, email, content, selectedAvatar, replyingTo, postMutation, refetch]
    );

    const handleReply = (commentId: string, authorName: string) => {
        setReplyingTo({ id: commentId, name: authorName });
        setShowForm(true);
        setTimeout(() => {
            document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    return (
        <section className={cn('mt-12 md:mt-16', className)}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-[#9b87f5]/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="size-5 text-[#9b87f5]" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-[var(--fg)]">Comments</h2>
                        {!isLoading && (
                            <p className="text-xs md:text-sm text-[var(--fg-muted)]">
                                {total} {total === 1 ? 'comment' : 'comments'}
                            </p>
                        )}
                    </div>
                </div>
                {!showForm && (
                    <button
                        type="button"
                        onClick={() => setShowForm(true)}
                        className={cn(
                            'inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full',
                            'bg-[#9b87f5] text-white',
                            'font-medium text-sm',
                            'hover:bg-[#8b77e5] transition-colors',
                            'shadow-lg shadow-[#9b87f5]/20',
                            'w-full sm:w-auto justify-center sm:justify-start'
                        )}
                    >
                        <MessageSquare className="size-4" />
                        Write a comment
                    </button>
                )}
            </div>

            {/* Comment Form */}
            {showForm && (
                <div
                    id="comment-form"
                    className="mb-6 md:mb-8 p-4 md:p-6 border-2 border-[#9b87f5]/20 rounded-2xl bg-gradient-to-br from-[#9b87f5]/5 to-transparent"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <User className="size-5 text-[#9b87f5]" />
                        <h3 className="text-base md:text-lg font-semibold text-[var(--fg)]">
                            {replyingTo ? `Reply to ${replyingTo.name}` : 'Share your thoughts'}
                        </h3>
                    </div>

                    {replyingTo && (
                        <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="mb-4 text-sm text-[var(--fg-muted)] hover:text-[#9b87f5] transition-colors"
                        >
                            ← Cancel reply
                        </button>
                    )}

                    {postMutation.isError && (
                        <div className="flex items-center gap-2 p-3 md:p-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                            <AlertCircle className="size-5 flex-shrink-0" />
                            <p className="text-sm">Failed to post comment. Please try again.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                        <AvatarSelector selectedAvatar={selectedAvatar} onSelect={setSelectedAvatar} />

                        <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                minLength={2}
                                maxLength={100}
                                placeholder="Your name"
                                className={cn(
                                    'px-3 md:px-4 py-2.5 md:py-3 rounded-xl border-2 border-[var(--border-color)]',
                                    'bg-[var(--bg)] text-[var(--fg)] text-sm md:text-base',
                                    'placeholder:text-[var(--fg-subtle)]',
                                    'focus:outline-none focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20',
                                    'transition-all'
                                )}
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="your@email.com"
                                className={cn(
                                    'px-3 md:px-4 py-2.5 md:py-3 rounded-xl border-2 border-[var(--border-color)]',
                                    'bg-[var(--bg)] text-[var(--fg)] text-sm md:text-base',
                                    'placeholder:text-[var(--fg-subtle)]',
                                    'focus:outline-none focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20',
                                    'transition-all'
                                )}
                            />
                        </div>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            minLength={10}
                            maxLength={5000}
                            rows={4}
                            placeholder="Share your thoughts..."
                            className={cn(
                                'w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border-2 border-[var(--border-color)]',
                                'bg-[var(--bg)] text-[var(--fg)] text-sm md:text-base',
                                'placeholder:text-[var(--fg-subtle)]',
                                'focus:outline-none focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20',
                                'resize-none transition-all'
                            )}
                        />

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
                            <p className="text-xs text-[var(--fg-subtle)]">
                                ✨ By commenting, you'll be subscribed to our newsletter
                            </p>
                            <button
                                type="submit"
                                disabled={postMutation.isPending}
                                className={cn(
                                    'inline-flex items-center justify-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full',
                                    'bg-[#9b87f5] text-white font-medium text-sm',
                                    'hover:bg-[#8b77e5] transition-all',
                                    'shadow-lg shadow-[#9b87f5]/30',
                                    'disabled:opacity-50 disabled:cursor-not-allowed',
                                    'focus:outline-none focus:ring-2 focus:ring-[#9b87f5] focus:ring-offset-2',
                                    'w-full sm:w-auto'
                                )}
                            >
                                {postMutation.isPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="size-4" />
                                        {replyingTo ? 'Post Reply' : 'Post Comment'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-3 md:space-y-4">
                {isLoading ? (
                    <CommentsSkeleton />
                ) : comments.length === 0 ? (
                    <div
                        className="text-center py-12 md:py-16 border-2 border-dashed border-[var(--border-color)] rounded-2xl cursor-pointer hover:border-[#9b87f5]/50 transition-colors group"
                        onClick={() => setShowForm(true)}
                    >
                        <div className="size-12 md:size-16 mx-auto mb-3 md:mb-4 rounded-full bg-[#9b87f5]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MessageSquare className="size-6 md:size-8 text-[#9b87f5]" />
                        </div>
                        <p className="text-[var(--fg-muted)] text-base md:text-lg font-medium">No comments yet</p>
                        <p className="text-[var(--fg-subtle)] text-sm mt-1">Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    comments.map((comment) => <CommentCard key={comment._id} comment={comment} onReply={handleReply} />)
                )}
            </div>
        </section>
    );
}

// Comment Card Component
interface ICommentCardProps {
    comment: IComment;
    onReply: (commentId: string, authorName: string) => void;
    isReply?: boolean;
}

function CommentCard({ comment, onReply, isReply = false }: ICommentCardProps) {
    const avatar = getAvatarById(comment.author.avatar || 'avatar-1');

    return (
        <div className={cn('group', isReply && 'ml-6 sm:ml-8 md:ml-12')}>
            <div className="p-4 md:p-5 border-2 border-[var(--border-color)] rounded-xl md:rounded-2xl bg-[var(--card-bg)] hover:border-[#9b87f5]/30 transition-all hover:shadow-lg hover:shadow-[#9b87f5]/5">
                <div className="flex items-start gap-3 md:gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0 size-10 md:size-11 rounded-full bg-gradient-to-br from-[#9b87f5] to-[#7e69d6] flex items-center justify-center text-lg md:text-xl border-2 border-[#9b87f5]/30 shadow-sm">
                        {avatar?.emoji || '😊'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Author Info */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="font-semibold text-[var(--fg)] text-sm md:text-base">{comment.author.name}</span>
                            {comment.author.isAuthor && (
                                <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#9b87f5] text-white text-xs font-medium"
                                    title="Content Author"
                                >
                                    <Shield className="size-3" />
                                    Author
                                </span>
                            )}
                            <span className="text-xs md:text-sm text-[var(--fg-subtle)]">
                                • {formatDate(new Date(comment.createdAt))}
                            </span>
                        </div>

                        {/* Content */}
                        <p className="text-[var(--fg-muted)] whitespace-pre-wrap break-words leading-relaxed text-sm md:text-base">
                            {comment.content}
                        </p>

                        {/* Actions */}
                        {!isReply && (
                            <button
                                type="button"
                                onClick={() => onReply(comment._id, comment.author.name)}
                                className="mt-3 inline-flex items-center gap-1.5 text-xs md:text-sm text-[var(--fg-subtle)] hover:text-[#9b87f5] transition-colors"
                            >
                                <ReplyIcon className="size-4" />
                                Reply
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 space-y-3 relative">
                    {/* Thread line */}
                    <div className="absolute left-3 md:left-4 top-0 bottom-0 w-0.5 bg-[#9b87f5]/20" />
                    {comment.replies.map((reply) => (
                        <CommentCard key={reply._id} comment={reply} onReply={onReply} isReply={true} />
                    ))}
                </div>
            )}
        </div>
    );
}

function CommentsSkeleton() {
    return (
        <div className="space-y-3 md:space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 md:p-6 border-2 border-[var(--border-color)] rounded-xl md:rounded-2xl">
                    <div className="flex items-start gap-3 md:gap-4">
                        <div className="size-10 md:size-11 rounded-full bg-[var(--surface)] animate-pulse flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                            <div className="h-4 w-24 md:w-32 bg-[var(--surface)] animate-pulse rounded" />
                            <div className="h-16 md:h-20 w-full bg-[var(--surface)] animate-pulse rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
