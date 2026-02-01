'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteStorage } from '@/lib/storage';

interface IArticleViewsProps {
    /** Full article slug (topicSlug/articleSlug) */
    slug: string;
    /** Initial views (if known from server) */
    initialViews?: number;
    /** View deduplication window in hours (default: 1 hour for more accurate counts) */
    deduplicationHours?: number;
    /** Additional className */
    className?: string;
}

/**
 * ArticleViews - Client component for displaying and tracking article views
 * 
 * Professional view counting:
 * 1. Always increments on page load (professional behavior like Medium, Dev.to)
 * 2. Uses 1-hour deduplication window (prevents refresh spam)
 * 3. Stores last view timestamp in structured storage (rc::s:views)
 * 4. Shows loading skeleton during initial fetch
 */
const ArticleViews = ({
    slug,
    initialViews = 0,
    deduplicationHours = 1,
    className,
}: IArticleViewsProps) => {
    const [views, setViews] = useState(initialViews);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const trackView = async () => {
            try {
                // Check if recently viewed (deduplication)
                const recentlyViewed = siteStorage.hasViewedRecently(slug, deduplicationHours);

                if (!recentlyViewed) {
                    // Increment view count
                    const response = await fetch(`/api/articles/${encodeURIComponent(slug)}/views`, {
                        method: 'POST',
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        setViews(data.data?.views ?? initialViews);
                        siteStorage.setViewed(slug);
                    }
                } else {
                    // Just fetch current views (no increment)
                    const response = await fetch(`/api/articles/${encodeURIComponent(slug)}/views`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        setViews(data.data?.views ?? initialViews);
                    }
                }
            } catch (error) {
                console.error('Failed to track views:', error);
            } finally {
                setIsLoading(false);
            }
        };

        trackView();
    }, [slug, deduplicationHours, initialViews]);

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 text-sm text-[var(--fg-muted)]',
                className
            )}
        >
            <Eye className="size-4" />
            {isLoading ? (
                <span className="inline-block w-12 h-4 bg-[var(--surface)] animate-pulse rounded" />
            ) : (
                <span className="tabular-nums">{views.toLocaleString()} views</span>
            )}
        </span>
    );
};

export { ArticleViews };
export type { IArticleViewsProps };
