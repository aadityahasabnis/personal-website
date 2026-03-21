'use client';

import { siteStorage } from '@/lib/storage';
import type { ICommentsResult } from '@/server/actions/comments';
import { getComments, postComment, upvoteComment } from '@/server/actions/comments';
import { likePost } from '@/server/actions/like';
import { getContentStats } from '@/server/actions/stats';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ===== TYPES =====

export interface IPageStats {
    views: number;
    likes: number;
    userHasLiked: boolean;
}

export type ContentType = 'articles' | 'notes' | 'projects';

// Re-export for convenience
export type { ICommentsResult };

// ===== HOOKS =====

/**
 * Hook to fetch and cache page stats (views + likes)
 *
 * Strategy:
 * - initialData from SSR provides instant display (no layout shift)
 * - Always refetch on mount to get fresh data (ISR pages have stale initialData)
 * - Short staleTime so tabs that stay open still get fresh counts
 */
export const usePageStats = (
    slug: string,
    contentType: ContentType,
    options?: { enabled?: boolean; initialData?: IPageStats }
) => {
    return useQuery<IPageStats>({
        queryKey: ['stats', contentType, slug],
        queryFn: async () => {
            const stats = await getContentStats(slug);
            return {
                views: stats.views,
                likes: stats.likes,
                userHasLiked: siteStorage.hasLiked(slug, contentType),
            };
        },
        // Treat initialData as stale immediately so we refetch fresh counts
        staleTime: 0,
        gcTime: 30 * 60 * 1000,
        // Always refetch on mount — ISR pages have stale initialData baked in
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
        retry: 1,
        enabled: options?.enabled ?? true,
        initialData: options?.initialData,
    });
};

/**
 * Hook to fetch and cache comments
 *
 * Strategy:
 * - initialData from SSR means no network call on first render
 * - staleTime: 2 min before background refetch
 */
export const useComments = (
    slug: string,
    contentType: ContentType,
    limit = 20,
    offset = 0,
    options?: { initialData?: ICommentsResult }
) => {
    return useQuery<ICommentsResult>({
        queryKey: ['comments', contentType, slug, limit, offset],
        queryFn: () => getComments(slug, limit, offset),
        staleTime: options?.initialData ? 2 * 60 * 1000 : 0,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: !options?.initialData,
        refetchOnWindowFocus: false,
        retry: 1,
        initialData: options?.initialData,
    });
};

/**
 * Hook to toggle like with optimistic updates
 *
 * Strategy:
 * - ONE-TIME LIKE ONLY (no unlike)
 * - Checks localStorage before allowing like
 * - Optimistic update with rollback on error
 */
export const useLikeToggle = (slug: string, contentType: ContentType) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<{ likes: number; userHasLiked: boolean }> => {
            if (siteStorage.hasLiked(slug, contentType)) throw new Error('Already liked');
            const result = await likePost(slug);
            if (!result.success) throw new Error('Failed to like');
            siteStorage.setLiked(slug, contentType);
            return { likes: result.data ?? 0, userHasLiked: true };
        },

        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['stats', contentType, slug] });
            const previousStats = queryClient.getQueryData<IPageStats>(['stats', contentType, slug]);
            if (previousStats) {
                queryClient.setQueryData<IPageStats>(['stats', contentType, slug], {
                    ...previousStats,
                    likes: previousStats.likes + 1,
                    userHasLiked: true,
                });
            }
            return { previousStats };
        },

        onError: (_err, _vars, context) => {
            if (context?.previousStats) {
                queryClient.setQueryData(['stats', contentType, slug], context.previousStats);
            }
            siteStorage.removeLiked(slug, contentType);
        },

        onSuccess: (data) => {
            queryClient.setQueryData<IPageStats>(['stats', contentType, slug], (old) => ({
                views: old?.views ?? 0,
                likes: data.likes,
                userHasLiked: true,
            }));
        },
    });
};

/**
 * Hook to post a comment — invalidates comment cache on success
 */
export const usePostComment = (slug: string, contentType: ContentType) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: Parameters<typeof postComment>[1]) =>
            postComment(slug, payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', contentType, slug] });
        },
    });
};

/**
 * Hook to upvote a comment — optimistic update + invalidate on success
 */
export const useUpvoteComment = (slug: string, contentType: ContentType) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId: string) => upvoteComment(slug, commentId),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', contentType, slug] });
        },
    });
};
