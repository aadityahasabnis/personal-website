'use client';

import { Heart } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAction, useActionQuery } from '@/hooks';
import { siteStorage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import type { IContentStatsSnapshot } from '@/server/new/public/stats';
import { getContentLikesById, incrementContentLikesById } from '@/server/new/public/stats';

import type { IContentStatsLabelProps } from './types';

// =============================================================
// Content Likes
// =============================================================

export const ContentLikes = ({ contentId, contentType, className, showIcon = true }: IContentStatsLabelProps) => {
    const queryKey = useMemo(() => ['public-content-likes', contentType, contentId], [contentId, contentType]);
    const storageId = useMemo(() => `${contentType}:${contentId}`, [contentId, contentType]);

    const [liked, setLiked] = useState(false);
    const [optimisticLikes, setOptimisticLikes] = useState<number>(0);

    useEffect(() => {
        setLiked(siteStorage.hasLiked(storageId, 'content'));
    }, [storageId]);

    const likesQuery = useActionQuery<IContentStatsSnapshot>({
        queryKey,
        action: () => getContentLikesById(contentId),
        staleTime: 5000,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (!likesQuery.data) return;
        setOptimisticLikes((current) => Math.max(current, likesQuery.data.likes));
    }, [likesQuery.data]);

    const likeAction = useAction<IContentStatsSnapshot, []>({
        action: () => incrementContentLikesById(contentId),
        onSuccess: (snapshot) => {
            siteStorage.setLiked(storageId, 'content');
            setLiked(true);
            setOptimisticLikes((current) => Math.max(current, snapshot.likes));
        },
    });

    const handleLike = useCallback(async () => {
        if (liked || likeAction.pending) return;

        const baseLikes = Math.max(likesQuery.data?.likes ?? 0, optimisticLikes);
        setLiked(true);
        setOptimisticLikes(baseLikes + 1);

        const response = await likeAction.mutateAsync();
        if (!response.success) {
            setLiked(false);
            setOptimisticLikes(baseLikes);
            siteStorage.removeLiked(storageId, 'content');
        }
    }, [likeAction, liked, likesQuery.data?.likes, optimisticLikes, storageId]);

    const likes = Math.max(likesQuery.data?.likes ?? 0, optimisticLikes);

    return (
        <button
            type='button'
            onClick={handleLike}
            disabled={liked || likeAction.pending}
            aria-label={liked ? 'You already liked this content' : 'Like this content'}
            aria-pressed={liked}
            className={cn(
                'relative inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-label font-medium bg-card border transition-base',
                liked ? 'text-primary border-primary/40' : 'text-muted-foreground border-border hover:text-primary hover:border-primary/40',
                likeAction.pending ? 'opacity-70 cursor-wait' : '',
                className,
            )}
        >
            {showIcon && <Heart className={cn('size-3.5', liked ? 'fill-current' : '')} />}
            <span>{likes.toLocaleString()}</span>
        </button>
    );
};

export type { IContentStatsLabelProps };
