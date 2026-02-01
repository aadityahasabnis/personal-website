'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteStorage } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { QUERY_KEYS, QUERY_CONFIG } from '@/constants';

interface IContentStatsProps {
    /** Content slug (e.g., "dsa/sliding-window" or "note-slug") */
    slug: string;
    /** Content type for API routes */
    contentType: 'articles' | 'notes' | 'projects';
    /** Initial values from SSR */
    initialViews: number;
    initialLikes: number;
    /** Additional className */
    className?: string;
}

/**
 * ContentStats - Reusable stats component for any content type
 * 
 * Features:
 * - Works with articles, notes, and projects
 * - TanStack Query caching (30s stale time)
 * - Optimistic UI updates
 * - One-time like per content (localStorage)
 * - 1-hour view deduplication
 * - Lavender theme
 * - Fully accessible
 * 
 * Usage:
 * ```tsx
 * <ContentStats 
 *   slug="my-article" 
 *   contentType="articles"
 *   initialViews={10}
 *   initialLikes={5}
 * />
 * ```
 */
export function ContentStats({
    slug,
    contentType,
    initialViews,
    initialLikes,
    className,
}: IContentStatsProps) {
    const queryClient = useQueryClient();
    const [hasIncrementedView, setHasIncrementedView] = useState(false);

    // Fetch stats
    const { data: stats, isLoading } = useQuery({
        queryKey: QUERY_KEYS.STATS.page(slug),
        queryFn: async () => {
            try {
                const [viewsRes, likesRes] = await Promise.all([
                    fetch(`/api/${contentType}/${encodeURIComponent(slug)}/views`, {
                        cache: 'no-store',
                    }),
                    fetch(`/api/${contentType}/${encodeURIComponent(slug)}/likes`, {
                        cache: 'no-store',
                    }),
                ]);

                if (!viewsRes.ok || !likesRes.ok) {
                    throw new Error('Failed to fetch stats');
                }

                const [viewsData, likesData] = await Promise.all([
                    viewsRes.json(),
                    likesRes.json(),
                ]);

                return {
                    views: viewsData.data?.views ?? 0,
                    likes: likesData.data?.likes ?? 0,
                    userHasLiked: likesData.data?.userHasLiked ?? siteStorage.hasLiked(slug),
                };
            } catch (error) {
                console.error('Error fetching stats:', error);
                return {
                    views: 0,
                    likes: 0,
                    userHasLiked: siteStorage.hasLiked(slug),
                };
            }
        },
        staleTime: QUERY_CONFIG.statsStaleTime,
        gcTime: QUERY_CONFIG.statsGcTime,
        refetchOnMount: 'always',
        retry: 1,
    });

    // Like mutation
    const likeMutation = useMutation({
        mutationFn: async () => {
            const currentlyLiked = siteStorage.hasLiked(slug);
            const action = currentlyLiked ? 'unlike' : 'like';

            const response = await fetch(`/api/${contentType}/${encodeURIComponent(slug)}/likes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (!response.ok) {
                throw new Error('Failed to toggle like');
            }

            const data = await response.json();
            
            // Update storage
            if (action === 'like') {
                siteStorage.setLiked(slug);
            } else {
                siteStorage.removeLiked(slug);
            }

            return {
                likes: data.data?.likes ?? 0,
                userHasLiked: action === 'like',
            };
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.STATS.page(slug) });

            const previousStats = queryClient.getQueryData(QUERY_KEYS.STATS.page(slug));
            const currentlyLiked = siteStorage.hasLiked(slug);

            if (previousStats) {
                queryClient.setQueryData(QUERY_KEYS.STATS.page(slug), {
                    ...(previousStats as any),
                    likes: currentlyLiked ? (previousStats as any).likes - 1 : (previousStats as any).likes + 1,
                    userHasLiked: !currentlyLiked,
                });
            }

            return { previousStats };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousStats) {
                queryClient.setQueryData(QUERY_KEYS.STATS.page(slug), context.previousStats);
            }
        },
        onSuccess: (data) => {
            queryClient.setQueryData(QUERY_KEYS.STATS.page(slug), (old: any) => ({
                views: old?.views ?? 0,
                likes: data.likes,
                userHasLiked: data.userHasLiked,
            }));
        },
    });

    // Increment views on mount
    useEffect(() => {
        if (hasIncrementedView) return;

        const incrementView = async () => {
            if (siteStorage.hasViewedRecently(slug, 1)) {
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
        if (likeMutation.isPending) return;
        likeMutation.mutate();
    };

    const views = stats?.views ?? initialViews;
    const likes = stats?.likes ?? initialLikes;
    const userHasLiked = stats?.userHasLiked ?? siteStorage.hasLiked(slug);

    if (isLoading) {
        return (
            <div className={cn('flex items-center gap-4', className)}>
                <div className="h-5 w-20 bg-[var(--surface)] animate-pulse rounded" />
                <div className="h-10 w-20 bg-[var(--surface)] animate-pulse rounded-full" />
            </div>
        );
    }

    return (
        <div className={cn('flex items-center gap-4', className)}>
            {/* Views */}
            <div 
                className="flex items-center gap-1.5 text-sm text-[var(--fg-muted)]"
                aria-live="polite"
            >
                <Eye className="size-4" />
                <span>{views.toLocaleString()} view{views !== 1 ? 's' : ''}</span>
            </div>

            {/* Like Button - Lavender Theme */}
            <button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                aria-label={userHasLiked ? `Unlike this ${contentType.slice(0, -1)}` : `Like this ${contentType.slice(0, -1)}`}
                aria-pressed={userHasLiked}
                className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-full',
                    'border-2 transition-all duration-300',
                    'hover:scale-105 active:scale-95',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                    'font-medium text-sm',
                    userHasLiked
                        ? 'bg-[#9b87f5] border-[#9b87f5] text-white hover:bg-[#8b77e5] hover:border-[#8b77e5] focus:ring-[#9b87f5] shadow-lg shadow-[#9b87f5]/30'
                        : 'bg-transparent border-[var(--border-color)] text-[var(--fg-muted)] hover:border-[#9b87f5] hover:text-[#9b87f5] hover:bg-[#9b87f5]/5 focus:ring-[#9b87f5]'
                )}
            >
                <Heart className={cn('size-4 transition-all duration-300', userHasLiked && 'fill-current scale-110')} />
                <span>{likes.toLocaleString()}</span>
            </button>
        </div>
    );
}
