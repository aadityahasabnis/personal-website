'use client';

import { usePageStats, useLikeToggle, type ContentType } from '@/hooks/useContentData';
import { Eye, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteStorage } from '@/lib/storage';
import { useEffect, useState, useMemo } from 'react';

interface IContentStatsProps {
    /** Content slug (e.g., "dsa/sliding-window" or "note-slug") */
    slug: string;
    /** Content type for API routes */
    contentType: ContentType;
    /** Initial values from SSR */
    initialViews: number;
    initialLikes: number;
    /** Additional className */
    className?: string;
}

/**
 * ContentStats - Fixed like button bug
 * 
 * BUG FIXES:
 * - Like button now shows colored state on refresh
 * - localStorage is ALWAYS checked (not just on initial mount)
 * - Button properly disabled if already liked
 * - No more accidental multiple likes
 */
export function ContentStats({
    slug,
    contentType,
    initialViews,
    initialLikes,
    className,
}: IContentStatsProps) {
    const [hasIncrementedView, setHasIncrementedView] = useState(false);

    // Fetch stats from API (with caching)
    const { data: stats } = usePageStats(slug, contentType);
    const likeMutation = useLikeToggle(slug, contentType);

    // CRITICAL FIX: Use useState with effect to sync with localStorage
    // This ensures the button shows correct state on refresh AND reacts to changes
    const [userHasLiked, setUserHasLiked] = useState(false);
    
    // Sync with localStorage on mount and when slug changes
    useEffect(() => {
        setUserHasLiked(siteStorage.hasLiked(slug));
    }, [slug]);
    
    // Update when like mutation succeeds
    useEffect(() => {
        if (likeMutation.isSuccess) {
            setUserHasLiked(true);
        }
    }, [likeMutation.isSuccess]);

    // Increment views on mount (with deduplication)
    useEffect(() => {
        if (hasIncrementedView) return;

        const incrementView = async () => {
            // Check if user viewed recently (1 hour dedup)
            if (siteStorage.hasViewedRecently(slug, 1)) {
                setHasIncrementedView(true);
                return;
            }

            try {
                await fetch(`/api/${contentType}/${encodeURIComponent(slug)}/views`, {
                    method: 'POST',
                });
                siteStorage.setViewed(slug);
                setHasIncrementedView(true);
            } catch (error) {
                console.error('Failed to increment view:', error);
            }
        };

        incrementView();
    }, [slug, contentType, hasIncrementedView]);

    const handleLike = () => {
        // CRITICAL: Check localStorage BEFORE mutation
        const alreadyLiked = siteStorage.hasLiked(slug);
        
        if (alreadyLiked) {
            console.log('❌ Already liked (localStorage check)');
            return;
        }

        // Prevent multiple clicks while loading
        if (likeMutation.isPending) {
            console.log('⏳ Like pending, please wait');
            return;
        }

        console.log('✅ Liking content...');
        likeMutation.mutate();
    };

    // Use API data if available, otherwise use initial values
    const views = stats?.views ?? initialViews;
    const likes = stats?.likes ?? initialLikes;

    return (
        <div className={cn('flex items-center gap-3 md:gap-4', className)}>
            {/* Views Counter */}
            <div 
                className="flex items-center gap-1.5 text-sm text-[var(--fg-muted)]"
                aria-live="polite"
            >
                <Eye className="size-4" />
                <span>{views.toLocaleString()} view{views !== 1 ? 's' : ''}</span>
            </div>

            {/* Like Button - ONE-TIME ONLY */}
            <button
                onClick={handleLike}
                disabled={likeMutation.isPending || userHasLiked}
                aria-label={userHasLiked ? 'You liked this content' : 'Like this content'}
                aria-pressed={userHasLiked}
                className={cn(
                    'inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full',
                    'border-2 transition-all duration-300',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2',
                    'font-medium text-sm',
                    userHasLiked
                        ? [
                            // Liked state - Lavender filled (DISABLED)
                            'bg-[#9b87f5] border-[#9b87f5] text-white',
                            'cursor-not-allowed',
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
