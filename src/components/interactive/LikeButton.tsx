'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { likePost } from '@/server/actions/like';

interface ILikeButtonProps {
    slug: string;
    initialLikes: number;
    className?: string;
}

/**
 * LikeButton - Client component with optimistic updates
 *
 * Features:
 * 1. Optimistic UI update (instant feedback)
 * 2. Uses server action for atomic increment
 * 3. Graceful error handling with rollback
 * 4. Accessible button with aria attributes
 * 5. Visual feedback (heart fill animation)
 */
const LikeButton = ({ slug, initialLikes, className }: ILikeButtonProps) => {
    const [likes, setLikes] = useState(initialLikes);
    const [hasLiked, setHasLiked] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleLike = () => {
        if (hasLiked || isPending) return;

        // Optimistic update
        setLikes((prev) => prev + 1);
        setHasLiked(true);

        startTransition(async () => {
            const result = await likePost(slug);

            if (!result.success) {
                // Rollback on error
                setLikes((prev) => prev - 1);
                setHasLiked(false);
                console.error('Failed to like:', result.error);
            } else if (result.data !== undefined) {
                // Sync with server value
                setLikes(result.data);
            }
        });
    };

    return (
        <button
            type="button"
            onClick={handleLike}
            disabled={hasLiked || isPending}
            aria-label={hasLiked ? 'You liked this post' : 'Like this post'}
            aria-pressed={hasLiked}
            className={cn(
                'group inline-flex items-center gap-2 rounded-full px-4 py-2',
                'border border-border bg-background',
                'transition-all duration-200',
                'hover:border-primary/50 hover:bg-primary/5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:cursor-not-allowed',
                hasLiked && 'border-primary/30 bg-primary/10',
                className
            )}
        >
            <Heart
                className={cn(
                    'h-4 w-4 transition-all duration-200',
                    hasLiked
                        ? 'fill-red-500 text-red-500 scale-110'
                        : 'text-muted-foreground group-hover:text-red-500'
                )}
            />
            <span
                className={cn(
                    'text-sm font-medium tabular-nums',
                    hasLiked ? 'text-foreground' : 'text-muted-foreground'
                )}
            >
                {likes.toLocaleString()}
            </span>
        </button>
    );
};

export { LikeButton };
export type { ILikeButtonProps };
