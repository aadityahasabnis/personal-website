'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useComments, usePostComment } from '@/hooks/useArticleData';
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

interface IArticleCommentsClientProps {
    slug: string;
    className?: string;
}

/**
 * ArticleCommentsClient - Professional comments section
 * 
 * Features:
 * - TanStack Query caching (5 mins)
 * - Auto-approved comments (instant feedback)
 * - Nested replies with visual threading
 * - Avatar selector
 * - Saved author info
 * - Professional card-based UI
 * - Lavender accent theme
 */
export function ArticleCommentsClient({ slug, className }: IArticleCommentsClientProps) {
    const { data: commentsData, isLoading, refetch } = useComments(slug);
    const postMutation = usePostComment(slug);

    const [showForm, setShowForm] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{id: string; name: string} | null>(null);

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
    const handleSubmit = useCallback(async (e: FormEvent) => {
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
    }, [name, email, content, selectedAvatar, replyingTo, postMutation, refetch]);

    const handleReply = (commentId: string, authorName: string) => {
        setReplyingTo({ id: commentId, name: authorName });
        setShowForm(true);
        setTimeout(() => {
            document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    return (
        <section className={cn('mt-16', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-[#9b87f5]/10 flex items-center justify-center">
                        <MessageSquare className="size-5 text-[#9b87f5]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--fg)]">
                            Comments
                        </h2>
                        {!isLoading && (
                            <p className="text-sm text-[var(--fg-muted)]">
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
                            'inline-flex items-center gap-2 px-5 py-2.5 rounded-full',
                            'bg-[#9b87f5] text-white',
                            'font-medium text-sm',
                            'hover:bg-[#8b77e5] transition-colors',
                            'shadow-lg shadow-[#9b87f5]/20'
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
                    className="mb-8 p-6 border-2 border-[#9b87f5]/20 rounded-2xl bg-gradient-to-br from-[#9b87f5]/5 to-transparent"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <User className="size-5 text-[#9b87f5]" />
                        <h3 className="text-lg font-semibold text-[var(--fg)]">
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
                        <div className="flex items-center gap-2 p-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                            <AlertCircle className="size-5 flex-shrink-0" />
                            <p className="text-sm">Failed to post comment. Please try again.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AvatarSelector 
                            selectedAvatar={selectedAvatar} 
                            onSelect={setSelectedAvatar} 
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                minLength={2}
                                maxLength={100}
                                placeholder="Your name"
                                className={cn(
                                    'px-4 py-3 rounded-xl border-2 border-[var(--border-color)]',
                                    'bg-[var(--bg)] text-[var(--fg)]',
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
                                    'px-4 py-3 rounded-xl border-2 border-[var(--border-color)]',
                                    'bg-[var(--bg)] text-[var(--fg)]',
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
                                'w-full px-4 py-3 rounded-xl border-2 border-[var(--border-color)]',
                                'bg-[var(--bg)] text-[var(--fg)]',
                                'placeholder:text-[var(--fg-subtle)]',
                                'focus:outline-none focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20',
                                'resize-none transition-all'
                            )}
                        />

                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <p className="text-xs text-[var(--fg-subtle)]">
                                ✨ By commenting, you'll be subscribed to our newsletter
                            </p>
                            <button
                                type="submit"
                                disabled={postMutation.isPending}
                                className={cn(
                                    'inline-flex items-center gap-2 px-6 py-3 rounded-full',
                                    'bg-[#9b87f5] text-white font-medium text-sm',
                                    'hover:bg-[#8b77e5] transition-all',
                                    'shadow-lg shadow-[#9b87f5]/30',
                                    'disabled:opacity-50 disabled:cursor-not-allowed',
                                    'focus:outline-none focus:ring-2 focus:ring-[#9b87f5] focus:ring-offset-2'
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
            <div className="space-y-4">
                {isLoading ? (
                    <CommentsSkeleton />
                ) : comments.length === 0 ? (
                    <div 
                        className="text-center py-16 border-2 border-dashed border-[var(--border-color)] rounded-2xl cursor-pointer hover:border-[#9b87f5]/50 transition-colors group"
                        onClick={() => setShowForm(true)}
                    >
                        <div className="size-16 mx-auto mb-4 rounded-full bg-[#9b87f5]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MessageSquare className="size-8 text-[#9b87f5]" />
                        </div>
                        <p className="text-[var(--fg-muted)] text-lg font-medium">No comments yet</p>
                        <p className="text-[var(--fg-subtle)] text-sm mt-1">Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <CommentCard 
                            key={comment._id} 
                            comment={comment} 
                            onReply={handleReply}
                        />
                    ))
                )}
            </div>
        </section>
    );
}

// Comment Card Component
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
    onReply: (commentId: string, authorName: string) => void;
    isReply?: boolean;
}

function CommentCard({ comment, onReply, isReply = false }: ICommentCardProps) {
    const avatar = getAvatarById(comment.author.avatar || 'avatar-1');

    return (
        <div className={cn('group', isReply && 'ml-8 sm:ml-12')}>
            <div className="p-5 border-2 border-[var(--border-color)] rounded-2xl bg-[var(--card-bg)] hover:border-[#9b87f5]/30 transition-all hover:shadow-lg hover:shadow-[#9b87f5]/5">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0 size-11 rounded-full bg-gradient-to-br from-[#9b87f5] to-[#7e69d6] flex items-center justify-center text-xl border-2 border-[#9b87f5]/30 shadow-sm">
                        {avatar?.emoji || '😊'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Author Info */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="font-semibold text-[var(--fg)]">
                                {comment.author.name}
                            </span>
                            {comment.author.isAuthor && (
                                <span 
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#9b87f5] text-white text-xs font-medium"
                                    title="Article Author"
                                >
                                    <Shield className="size-3" />
                                    Author
                                </span>
                            )}
                            <span className="text-sm text-[var(--fg-subtle)]">
                                • {formatDate(new Date(comment.createdAt))}
                            </span>
                        </div>

                        {/* Content */}
                        <p className="text-[var(--fg-muted)] whitespace-pre-wrap break-words leading-relaxed">
                            {comment.content}
                        </p>

                        {/* Actions */}
                        {!isReply && (
                            <button
                                type="button"
                                onClick={() => onReply(comment._id, comment.author.name)}
                                className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--fg-subtle)] hover:text-[#9b87f5] transition-colors"
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
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#9b87f5]/20" />
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

function CommentsSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 border-2 border-[var(--border-color)] rounded-2xl">
                    <div className="flex items-start gap-4">
                        <div className="size-11 rounded-full bg-[var(--surface)] animate-pulse" />
                        <div className="flex-1 space-y-3">
                            <div className="h-4 w-32 bg-[var(--surface)] animate-pulse rounded" />
                            <div className="h-20 w-full bg-[var(--surface)] animate-pulse rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
