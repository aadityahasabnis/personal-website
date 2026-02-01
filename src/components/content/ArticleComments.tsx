'use client';

import { useState, useEffect, useCallback, type FormEvent, useRef } from 'react';
import { 
    MessageSquare, 
    Send, 
    Clock, 
    AlertCircle, 
    CheckCircle, 
    Reply,
    ChevronLeft,
    ChevronRight,
    Shield,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { siteStorage, AVATAR_OPTIONS, getAvatarById, getRandomAvatar, type ICommentAuthor } from '@/lib/storage';

// ===== INTERFACES =====

interface ICommentAuthorData {
    name: string;
    email?: string;
    avatar?: string;
    isAuthor?: boolean;
}

interface ICommentReply {
    _id: string;
    author: ICommentAuthorData;
    content: string;
    likes: number;
    createdAt: string;
}

interface IComment {
    _id: string;
    author: ICommentAuthorData;
    content: string;
    likes: number;
    replies?: ICommentReply[];
    createdAt: string;
}

interface IArticleCommentsProps {
    /** Full article slug (topicSlug/articleSlug) */
    slug: string;
    /** Additional className */
    className?: string;
}

// ===== AVATAR SELECTOR COMPONENT =====

interface IAvatarSelectorProps {
    selectedAvatar: string;
    onSelect: (avatarId: string) => void;
}

function AvatarSelector({ selectedAvatar, onSelect }: IAvatarSelectorProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollButtons = useCallback(() => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }, []);

    useEffect(() => {
        const ref = scrollRef.current;
        if (ref) {
            ref.addEventListener('scroll', updateScrollButtons);
            updateScrollButtons();
        }
        return () => ref?.removeEventListener('scroll', updateScrollButtons);
    }, [updateScrollButtons]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 200;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    // Center selected avatar on mount
    useEffect(() => {
        if (!scrollRef.current) return;
        const selectedIndex = AVATAR_OPTIONS.findIndex(a => a.id === selectedAvatar);
        if (selectedIndex > -1) {
            const itemWidth = 64; // approximate width of each item
            const scrollPosition = (selectedIndex * itemWidth) - (scrollRef.current.clientWidth / 2) + (itemWidth / 2);
            scrollRef.current.scrollLeft = Math.max(0, scrollPosition);
        }
    }, [selectedAvatar]);

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-[var(--fg-muted)] mb-2">
                Choose your avatar
            </label>
            
            <div className="relative flex items-center">
                {/* Left scroll button */}
                {canScrollLeft && (
                    <button
                        type="button"
                        onClick={() => scroll('left')}
                        className="absolute left-0 z-10 p-1.5 rounded-full bg-[var(--bg)]/90 border border-[var(--border-color)] shadow-sm hover:bg-[var(--surface)] transition-colors"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                )}

                {/* Avatar list */}
                <div
                    ref={scrollRef}
                    className="flex gap-2 overflow-x-auto scrollbar-hide px-8 py-2 snap-x snap-mandatory"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {AVATAR_OPTIONS.map((avatar) => (
                        <button
                            key={avatar.id}
                            type="button"
                            onClick={() => onSelect(avatar.id)}
                            className={cn(
                                'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl',
                                'border-2 transition-all duration-200 snap-center',
                                'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]',
                                selectedAvatar === avatar.id
                                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 scale-110'
                                    : 'border-[var(--border-color)] bg-[var(--surface)] hover:border-[var(--border-hover)]'
                            )}
                            title={avatar.label}
                        >
                            {avatar.emoji}
                        </button>
                    ))}
                </div>

                {/* Right scroll button */}
                {canScrollRight && (
                    <button
                        type="button"
                        onClick={() => scroll('right')}
                        className="absolute right-0 z-10 p-1.5 rounded-full bg-[var(--bg)]/90 border border-[var(--border-color)] shadow-sm hover:bg-[var(--surface)] transition-colors"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

// ===== COMMENT CARD COMPONENT =====

interface ICommentCardProps {
    comment: IComment;
    onReply?: (commentId: string) => void;
}

function CommentCard({ comment, onReply }: ICommentCardProps) {
    const avatar = comment.author.avatar ? getAvatarById(comment.author.avatar) : null;

    return (
        <div className="flex gap-4">
            {/* Avatar */}
            <div className="shrink-0">
                <div className={cn(
                    'size-10 rounded-full flex items-center justify-center text-lg',
                    'bg-[var(--accent-subtle)]'
                )}>
                    {avatar?.emoji || '😊'}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-[var(--fg)]">{comment.author.name}</span>
                    {comment.author.isAuthor && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)]">
                            <Shield className="size-3" />
                            Author
                        </span>
                    )}
                    <span className="text-xs text-[var(--fg-subtle)] flex items-center gap-1">
                        <Clock className="size-3" />
                        {formatDate(comment.createdAt)}
                    </span>
                </div>
                <p className="text-[var(--fg-muted)] text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                </p>

                {/* Reply button */}
                {onReply && (
                    <button
                        type="button"
                        onClick={() => onReply(comment._id)}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--fg-subtle)] hover:text-[var(--accent)] transition-colors"
                    >
                        <Reply className="size-3" />
                        Reply
                    </button>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-[var(--border-color)] space-y-4">
                        {comment.replies.map((reply) => {
                            const replyAvatar = reply.author.avatar ? getAvatarById(reply.author.avatar) : null;
                            return (
                                <div key={reply._id} className="flex gap-3">
                                    <div className="size-8 rounded-full flex items-center justify-center text-sm bg-[var(--surface)]">
                                        {replyAvatar?.emoji || '😊'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-medium text-sm text-[var(--fg)]">
                                                {reply.author.name}
                                            </span>
                                            {reply.author.isAuthor && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--accent)]/10 text-[var(--accent)]">
                                                    <Shield className="size-2.5" />
                                                    Author
                                                </span>
                                            )}
                                            <span className="text-xs text-[var(--fg-subtle)]">
                                                {formatDate(reply.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-[var(--fg-muted)] text-sm">{reply.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ===== COMMENTS SKELETON =====

function CommentsSkeleton() {
    return (
        <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                    <div className="size-10 rounded-full bg-[var(--surface)]" />
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-24 bg-[var(--surface)] rounded" />
                            <div className="h-3 w-16 bg-[var(--surface)] rounded" />
                        </div>
                        <div className="h-4 w-full bg-[var(--surface)] rounded" />
                        <div className="h-4 w-3/4 bg-[var(--surface)] rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ===== MAIN COMPONENT =====

/**
 * ArticleComments - Professional comments section
 * 
 * Features:
 * 1. Avatar selection with horizontal scroll picker
 * 2. Stored user profile for repeat commenters
 * 3. Author badge for admin replies
 * 4. Reply functionality
 * 5. Sorted by newest first
 * 6. Moderation support
 */
const ArticleComments = ({ slug, className }: IArticleCommentsProps) => {
    const [comments, setComments] = useState<IComment[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [content, setContent] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState<string>(getRandomAvatar().id);

    // Load saved author info on mount
    useEffect(() => {
        const savedAuthor = siteStorage.getCommentAuthor();
        if (savedAuthor) {
            setName(savedAuthor.name);
            setEmail(savedAuthor.email);
            setSelectedAvatar(savedAuthor.avatar);
        }
    }, []);

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch(`/api/articles/${encodeURIComponent(slug)}/comments`);
                if (response.ok) {
                    const data = await response.json();
                    // Sort by newest first
                    const sortedComments = (data.data ?? []).sort(
                        (a: IComment, b: IComment) => 
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    setComments(sortedComments);
                    setTotal(data.metadata?.total ?? 0);
                }
            } catch (error) {
                console.error('Failed to fetch comments:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchComments();
    }, [slug]);

    // Handle comment click - show form if no saved author
    const handleCommentClick = () => {
        setShowForm(true);
    };

    // Handle reply click
    const handleReply = (commentId: string) => {
        setReplyingTo(commentId);
        setShowForm(true);
        // Scroll form into view
        setTimeout(() => {
            document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Handle form submission
    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setError(null);

        try {
            const response = await fetch(`/api/articles/${encodeURIComponent(slug)}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    author: { name, email, avatar: selectedAvatar },
                    content,
                    replyTo: replyingTo,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitStatus('success');
                setContent('');
                setReplyingTo(null);
                
                // Save author info for future comments
                siteStorage.setCommentAuthor({ name, email, avatar: selectedAvatar });

                // Check if user is subscribed, if not - they're now in newsletter
                const userProfile = siteStorage.getUserProfile();
                if (!userProfile?.subscribedAt) {
                    siteStorage.updateUserProfile({
                        name,
                        email,
                        avatar: selectedAvatar,
                        subscribedAt: new Date().toISOString(),
                    });
                }
            } else {
                setSubmitStatus('error');
                setError(data.error || 'Failed to submit comment');
            }
        } catch (err) {
            setSubmitStatus('error');
            setError('Failed to submit comment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [slug, name, email, content, selectedAvatar, replyingTo]);

    return (
        <section className={cn('mt-16', className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <MessageSquare className="size-5 text-[var(--accent)]" />
                    <h2 className="text-xl font-semibold text-[var(--fg)]">
                        Comments {!isLoading && `(${total})`}
                    </h2>
                </div>
                {!showForm && (
                    <button
                        type="button"
                        onClick={handleCommentClick}
                        className={cn(
                            'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
                            'bg-[var(--accent)] text-[var(--accent-fg)]',
                            'font-medium text-sm hover:opacity-90 transition-opacity'
                        )}
                    >
                        <MessageSquare className="size-4" />
                        Leave a comment
                    </button>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-6 mb-12">
                {isLoading ? (
                    <CommentsSkeleton />
                ) : comments.length === 0 ? (
                    <div 
                        className="text-center py-12 border border-dashed border-[var(--border-color)] rounded-xl cursor-pointer hover:border-[var(--accent)]/50 transition-colors"
                        onClick={handleCommentClick}
                    >
                        <MessageSquare className="size-8 mx-auto text-[var(--fg-subtle)] mb-3" />
                        <p className="text-[var(--fg-muted)]">No comments yet. Be the first to share your thoughts!</p>
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

            {/* Comment Form */}
            {showForm && (
                <div 
                    id="comment-form"
                    className="border border-[var(--border-color)] rounded-xl p-6 bg-[var(--card-bg)]"
                >
                    <h3 className="text-lg font-medium text-[var(--fg)] mb-4">
                        {replyingTo ? 'Reply to comment' : 'Leave a comment'}
                    </h3>

                    {replyingTo && (
                        <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="mb-4 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
                        >
                            ← Cancel reply
                        </button>
                    )}

                    {submitStatus === 'success' && (
                        <div className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                            <CheckCircle className="size-5" />
                            <p className="text-sm">Your comment has been submitted for moderation. It will appear once approved.</p>
                        </div>
                    )}

                    {submitStatus === 'error' && error && (
                        <div className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                            <AlertCircle className="size-5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Avatar Selector */}
                        <AvatarSelector 
                            selectedAvatar={selectedAvatar} 
                            onSelect={setSelectedAvatar} 
                        />

                        {/* Name & Email */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-[var(--fg-muted)] mb-1.5">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-lg border border-[var(--border-color)]',
                                        'bg-[var(--bg)] text-[var(--fg)]',
                                        'placeholder:text-[var(--fg-subtle)]',
                                        'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent',
                                        'transition-colors'
                                    )}
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[var(--fg-muted)] mb-1.5">
                                    Email * <span className="text-[var(--fg-subtle)]">(for newsletter)</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={cn(
                                        'w-full px-4 py-2.5 rounded-lg border border-[var(--border-color)]',
                                        'bg-[var(--bg)] text-[var(--fg)]',
                                        'placeholder:text-[var(--fg-subtle)]',
                                        'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent',
                                        'transition-colors'
                                    )}
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        {/* Comment content */}
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-[var(--fg-muted)] mb-1.5">
                                Comment *
                            </label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                                minLength={10}
                                maxLength={5000}
                                rows={4}
                                className={cn(
                                    'w-full px-4 py-2.5 rounded-lg border border-[var(--border-color)]',
                                    'bg-[var(--bg)] text-[var(--fg)]',
                                    'placeholder:text-[var(--fg-subtle)]',
                                    'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent',
                                    'resize-none transition-colors'
                                )}
                                placeholder="Share your thoughts..."
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-[var(--fg-subtle)]">
                                By commenting, you agree to join our newsletter.
                            </p>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={cn(
                                    'inline-flex items-center gap-2 px-6 py-2.5 rounded-lg',
                                    'bg-[var(--accent)] text-[var(--accent-fg)]',
                                    'font-medium text-sm',
                                    'hover:opacity-90 transition-opacity',
                                    'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2',
                                    'disabled:opacity-50 disabled:cursor-not-allowed'
                                )}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="size-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="size-4" />
                                        {replyingTo ? 'Reply' : 'Submit Comment'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </section>
    );
};

export { ArticleComments, CommentsSkeleton };
export type { IArticleCommentsProps };
