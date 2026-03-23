'use client';

import { Eye } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAction, useActionQuery } from '@/hooks';
import { siteStorage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import type { IContentStatsSnapshot } from '@/server/new/public/stats';
import { getContentViewsById, incrementContentViewsById } from '@/server/new/public/stats';

import type { IContentStatsLabelProps } from './types';

// =============================================================
// Content Views
// =============================================================

export const ContentViews = ({ contentId, contentType, className, showIcon = true }: IContentStatsLabelProps) => {
    const queryKey = useMemo(() => ['public-content-views', contentType, contentId], [contentId, contentType]);
    const storageId = useMemo(() => `${contentType}:${contentId}`, [contentId, contentType]);
    const [displayViews, setDisplayViews] = useState<number>(0);
    const incrementedKeyRef = useRef<string | null>(null);

    const viewsQuery = useActionQuery<IContentStatsSnapshot>({
        queryKey,
        action: () => getContentViewsById(contentId),
        staleTime: 5000,
        refetchOnWindowFocus: false,
    });

    const incrementViewAction = useAction<IContentStatsSnapshot, []>({
        action: () => incrementContentViewsById(contentId),
        onSuccess: (snapshot) => {
            setDisplayViews((current) => Math.max(current, snapshot.views));
        },
    });

    useEffect(() => {
        if (viewsQuery.data) {
            setDisplayViews((current) => Math.max(current, viewsQuery.data.views));
        }
    }, [viewsQuery.data]);

    useEffect(() => {
        if (incrementedKeyRef.current === storageId) return;
        incrementedKeyRef.current = storageId;

        let isMounted = true;

        const incrementOnLoad = async () => {
            const optimisticBase = viewsQuery.data?.views ?? displayViews;
            const optimisticNext = optimisticBase + 1;
            setDisplayViews(optimisticNext);

            const response = await incrementViewAction.mutateAsync();

            if (!isMounted) return;

            if (!response.success) {
                setDisplayViews(optimisticBase);
                return;
            }

            setDisplayViews(Math.max(optimisticNext, response.data.views));
            siteStorage.setViewed(storageId, 'content');
        };

        void incrementOnLoad();

        return () => {
            isMounted = false;
        };
    }, [displayViews, incrementViewAction, storageId, viewsQuery.data?.views]);

    return (
        <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 text-label font-medium text-muted-foreground bg-card border border-border rounded-md', className)}>
            {showIcon && <Eye className='size-3.5' />}
            <span>{displayViews.toLocaleString()}</span>
        </span>
    );
};
