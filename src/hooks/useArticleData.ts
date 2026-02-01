'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, QUERY_CONFIG } from '@/constants';
import { siteStorage } from '@/lib/storage';

// ===== TYPES =====

interface IPageStats {
    views: number;
    likes: number;
    userHasLiked: boolean;
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

interface ICommentsResponse {
    success: boolean;
    data: IComment[];
    metadata: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

// ===== API FUNCTIONS =====

async function fetchPageStats(slug: string): Promise<IPageStats> {
    try {
        const [viewsRes, likesRes] = await Promise.all([
            fetch(`/api/articles/${encodeURIComponent(slug)}/views`, {
                cache: 'no-store',
            }),
            fetch(`/api/articles/${encodeURIComponent(slug)}/likes`, {
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
        console.error('Error fetching page stats:', error);
        // Return defaults on error
        return {
            views: 0,
            likes: 0,
            userHasLiked: siteStorage.hasLiked(slug),
        };
    }
}

async function fetchComments(slug: string, limit = 20, offset = 0): Promise<ICommentsResponse> {
    try {
        const response = await fetch(
            `/api/articles/${encodeURIComponent(slug)}/comments?limit=${limit}&offset=${offset}`,
            { cache: 'no-store' }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch comments');
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching comments:', error);
        return {
            success: false,
            data: [],
            metadata: { total: 0, limit, offset, hasMore: false },
        };
    }
}

async function toggleLike(slug: string): Promise<{ likes: number; userHasLiked: boolean }> {
    // Check if already liked
    if (siteStorage.hasLiked(slug)) {
        throw new Error('Already liked');
    }

    const response = await fetch(`/api/articles/${encodeURIComponent(slug)}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' }),
    });

    if (!response.ok) {
        throw new Error('Failed to like');
    }

    const data = await response.json();
    
    // Update storage
    siteStorage.setLiked(slug);

    return {
        likes: data.data?.likes ?? 0,
        userHasLiked: true,
    };
}

async function postComment(
    slug: string,
    payload: {
        author: { name: string; email: string; avatar?: string };
        content: string;
        replyTo?: string;
    }
): Promise<{ success: boolean; message: string; data?: { _id: string } }> {
    const response = await fetch(`/api/articles/${encodeURIComponent(slug)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to post comment');
    }

    return data;
}

// ===== HOOKS =====

/**
 * Hook to fetch and cache page stats (views + likes)
 * 
 * Strategy:
 * - Caches for 30 seconds
 * - Always refetches on mount for fresh data
 * - Returns cached data while revalidating
 */
export function usePageStats(slug: string) {
    return useQuery({
        queryKey: QUERY_KEYS.STATS.page(slug),
        queryFn: () => fetchPageStats(slug),
        staleTime: QUERY_CONFIG.statsStaleTime, // 30s
        gcTime: QUERY_CONFIG.statsGcTime, // 2min
        refetchOnMount: 'always', // Always get fresh stats
        retry: 1,
    });
}

/**
 * Hook to fetch and cache comments
 * 
 * Strategy:
 * - Caches for 5 minutes
 * - Refetches on mount for fresh comments
 * - Invalidated when new comment posted
 */
export function useComments(slug: string, limit = 20, offset = 0) {
    return useQuery({
        queryKey: QUERY_KEYS.COMMENTS.list(slug, limit, offset),
        queryFn: () => fetchComments(slug, limit, offset),
        staleTime: QUERY_CONFIG.contentStaleTime, // 5min
        gcTime: QUERY_CONFIG.contentGcTime, // 10min
        refetchOnMount: 'always', // Always get fresh comments
        retry: 1,
    });
}

/**
 * Hook to toggle like with optimistic updates and proper error handling
 * 
 * Strategy:
 * - ONE-TIME LIKE ONLY (no unlike)
 * - Check localStorage before allowing like
 * - Optimistic update with rollback on error
 * - Update localStorage on success
 * - Prevent multiple simultaneous likes
 */
export function useLikeToggle(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => toggleLike(slug),
        
        // Optimistic update
        onMutate: async () => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: QUERY_KEYS.STATS.page(slug) });

            // Snapshot previous value
            const previousStats = queryClient.getQueryData<IPageStats>(
                QUERY_KEYS.STATS.page(slug)
            );

            // Optimistically update UI (increment like count)
            if (previousStats) {
                queryClient.setQueryData<IPageStats>(QUERY_KEYS.STATS.page(slug), {
                    ...previousStats,
                    likes: previousStats.likes + 1,
                    userHasLiked: true,
                });
            }

            return { previousStats };
        },

        // Revert on error
        onError: (_err, _variables, context) => {
            // Rollback to previous state
            if (context?.previousStats) {
                queryClient.setQueryData(
                    QUERY_KEYS.STATS.page(slug),
                    context.previousStats
                );
            }
            // Remove the like from storage since it failed
            siteStorage.removeLiked(slug);
        },

        // Update with server response
        onSuccess: (data) => {
            // Sync with server response (already set in toggleLike function)
            queryClient.setQueryData<IPageStats>(QUERY_KEYS.STATS.page(slug), (old) => ({
                views: old?.views ?? 0,
                likes: data.likes,
                userHasLiked: true,
            }));
        },
    });
}

/**
 * Hook to post a comment
 * 
 * Strategy:
 * - Invalidates comments cache on success
 * - Returns error message for display
 * - Saves author info to storage
 */
export function usePostComment(slug: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: Parameters<typeof postComment>[1]) =>
            postComment(slug, payload),

        onSuccess: () => {
            // Invalidate all comment queries for this slug
            queryClient.invalidateQueries({
                queryKey: ['comments', 'article', slug],
            });
        },
    });
}
