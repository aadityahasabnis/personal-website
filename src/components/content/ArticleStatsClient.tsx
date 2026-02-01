'use client';

import { usePageStats, useLikeToggle } from '@/hooks/useArticleData';
import { Eye, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteStorage } from '@/lib/storage';
import { useEffect, useState } from 'react';

interface IArticleStatsClientProps {
    slug: string;
    initialViews: number;
    initialLikes: number;
}

/**
 * ArticleStatsClient - Professional stats display with lavender theme
 * 
 * Features:
 * - TanStack Query caching (30s stale time)
 * - Optimistic UI updates
 * - One-time like per article (localStorage tracking)
 * - 1-hour view deduplication
 * - Lavender accent colors matching site theme
 * - Smooth animations
 */
export function ArticleStatsClient({
    slug,
    initialViews,
    initialLikes,
}: IArticleStatsClientProps) {
    const { data: stats, isLoading } = usePageStats(slug);
    const likeMutation = useLikeToggle(slug);
    const [hasIncrementedView, setHasIncrementedView] = useState(false);

    // Increment views on mount (with deduplication)
    useEffect(() => {
        if (hasIncrementedView) return;

        const incrementView = async () => {
            // Check if user viewed recently (1 hour dedup)
            if (siteStorage.hasViewedRecently(slug, 1)) {
                return;
            }

            try {
                await fetch(`/api/articles/${encodeURIComponent(slug)}/views`, {
                    method: 'POST',
                });
                siteStorage.setViewed(slug);
                setHasIncrementedView(true);
            } catch (error) {
                console.error('Failed to increment view:', error);
            }
        };

        incrementView();
    }, [slug, hasIncrementedView]);

    const handleLike = () => {
        // Prevent multiple clicks while loading
        if (likeMutation.isPending) return;
        
        // Prevent liking if already liked
        if (userHasLiked) return;

        likeMutation.mutate();
    };

    // Use cached data or initial values
    const views = stats?.views ?? initialViews;
    const likes = stats?.likes ?? initialLikes;
    const userHasLiked = stats?.userHasLiked ?? siteStorage.hasLiked(slug);

    if (isLoading) {
        return (
            <div className="flex items-center gap-4">
                <div className="h-5 w-20 bg-[var(--surface)] animate-pulse rounded" />
                <div className="h-10 w-20 bg-[var(--surface)] animate-pulse rounded-full" />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            {/* Views Counter */}
            <div 
                className="flex items-center gap-1.5 text-sm text-[var(--fg-muted)]"
                aria-live="polite"
            >
                <Eye className="size-4" />
                <span>
                    {views.toLocaleString()} view{views !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Like Button - Lavender Theme */}
            <button
                onClick={handleLike}
                disabled={likeMutation.isPending || userHasLiked}
                aria-label={userHasLiked ? 'You liked this article' : 'Like this article'}
                aria-pressed={userHasLiked}
                className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-full',
                    'border-2 transition-all duration-300',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2',
                    'font-medium text-sm',
                    userHasLiked
                        ? [
                            // Liked state - Lavender filled (disabled)
                            'bg-[#9b87f5] border-[#9b87f5] text-white',
                            'cursor-default',
                            'shadow-lg shadow-[#9b87f5]/30',
                        ]
                        : [
                            // Unliked state - Interactive
                            'bg-transparent border-[var(--border-color)] text-[var(--fg-muted)]',
                            'hover:border-[#9b87f5] hover:text-[#9b87f5] hover:bg-[#9b87f5]/5',
                            'hover:scale-105 active:scale-95',
                            'focus:ring-[#9b87f5]',
                            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                        ]
                )}
            >
                <Heart
                    className={cn(
                        'size-4 transition-all duration-300',
                        userHasLiked && 'fill-current scale-110'
                    )}
                />
                <span>{likes.toLocaleString()}</span>
            </button>
        </div>
    );
}
