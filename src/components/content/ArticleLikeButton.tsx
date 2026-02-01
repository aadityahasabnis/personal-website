'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteStorage } from '@/lib/storage';

interface IArticleLikeButtonProps {
    /** Full article slug (topicSlug/articleSlug) */
    slug: string;
    /** Initial like count */
    initialLikes?: number;
    /** Additional className */
    className?: string;
}

/**
 * ArticleLikeButton - Client component for liking articles
 * 
 * Features:
 * 1. Optimistic UI updates for instant feedback
 * 2. Structured storage (rc::s:likes) to prevent duplicate likes
 * 3. Graceful error handling with rollback
 * 4. Beautiful heart animation on like
 * 5. Accessible with proper aria attributes
 */
const ArticleLikeButton = ({
    slug,
    initialLikes = 0,
    className,
}: IArticleLikeButtonProps) => {
    const [likes, setLikes] = useState(initialLikes);
    const [hasLiked, setHasLiked] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check storage for previous like and fetch current count
    useEffect(() => {
        const wasLiked = siteStorage.hasLiked(slug);
        setHasLiked(wasLiked);

        // Fetch current like count
        const fetchLikes = async () => {
            try {
                const response = await fetch(`/api/articles/${encodeURIComponent(slug)}/likes`);
                if (response.ok) {
                    const data = await response.json();
                    setLikes(data.data?.likes ?? initialLikes);
                }
            } catch (error) {
                console.error('Failed to fetch likes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLikes();
    }, [slug, initialLikes]);

    const handleLike = useCallback(async () => {
        if (hasLiked || isPending) return;

        // Optimistic update
        setLikes((prev) => prev + 1);
        setHasLiked(true);
        setIsPending(true);

        try {
            const response = await fetch(`/api/articles/${encodeURIComponent(slug)}/likes`, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
                setLikes(data.data?.likes ?? likes + 1);
                siteStorage.setLiked(slug);
            } else {
                // Rollback on error
                setLikes((prev) => prev - 1);
                setHasLiked(false);
            }
        } catch (error) {
            // Rollback on error
            setLikes((prev) => prev - 1);
            setHasLiked(false);
            console.error('Failed to like:', error);
        } finally {
            setIsPending(false);
        }
    }, [hasLiked, isPending, slug, likes]);

    return (
        <button
            type="button"
            onClick={handleLike}
            disabled={hasLiked || isPending}
            aria-label={hasLiked ? 'You liked this article' : 'Like this article'}
            aria-pressed={hasLiked}
            className={cn(
                'group inline-flex items-center gap-2 rounded-full px-4 py-2',
                'border border-[var(--border-color)] bg-[var(--card-bg)]',
                'transition-all duration-200',
                'hover:border-[var(--border-hover)] hover:shadow-sm',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                'disabled:cursor-not-allowed',
                hasLiked && 'border-red-500/30 bg-red-500/5',
                className
            )}
        >
            <Heart
                className={cn(
                    'size-4 transition-all duration-200',
                    hasLiked
                        ? 'fill-red-500 text-red-500 scale-110'
                        : 'text-[var(--fg-muted)] group-hover:text-red-500'
                )}
            />
            <span
                className={cn(
                    'text-sm font-medium tabular-nums',
                    hasLiked ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'
                )}
            >
                {isLoading ? (
                    <span className="inline-block w-6 h-4 bg-[var(--surface)] animate-pulse rounded" />
                ) : (
                    likes.toLocaleString()
                )}
            </span>
        </button>
    );
};

export { ArticleLikeButton };
export type { IArticleLikeButtonProps };
