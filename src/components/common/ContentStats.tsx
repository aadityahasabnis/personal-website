'use client';

import { usePageStats, useLikeToggle, type ContentType } from '@/hooks/useContentData';
import { Eye, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteStorage } from '@/lib/storage';
import { useEffect, useState } from 'react';

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

export const ContentStats = ({
    slug,
    contentType,
    initialViews,
    initialLikes,
    className,
}: IContentStatsProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Wire initialData so TanStack Query never fires an extra network call on mount
    const { data: stats } = usePageStats(slug, contentType, {
        enabled: mounted,
        initialData: {
            views: initialViews,
            likes: initialLikes,
            userHasLiked: false,
        },
    });

    const likeMutation = useLikeToggle(slug, contentType);

    // Sync liked state with localStorage — handles refresh correctly
    const [userHasLiked, setUserHasLiked] = useState(false);

    useEffect(() => {
        setUserHasLiked(siteStorage.hasLiked(slug));
    }, [slug]);

    useEffect(() => {
        if (likeMutation.isSuccess) setUserHasLiked(true);
    }, [likeMutation.isSuccess]);

    const handleLike = () => {
        if (siteStorage.hasLiked(slug) || likeMutation.isPending) return;
        likeMutation.mutate();
    };

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
                            'bg-[var(--accent)] border-[var(--accent)] text-white',
                            'cursor-not-allowed',
                            'shadow-lg shadow-[var(--glow-color)]',
                        ]
                        : [
                            'bg-transparent border-[var(--border-color)] text-[var(--fg-muted)]',
                            'hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5',
                            'hover:scale-105 active:scale-95',
                            'focus:ring-[var(--accent)]',
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
};
