import { getArticleStats } from '@/server/queries/stats';

interface IViewsProps {
    slug: string;
    className?: string;
}

/**
 * Views - Server Component that streams view count
 *
 * Reads the current view count from articleStats without incrementing.
 * View incrementing is handled via `after(() => incrementViews(slug))` in the page.
 *
 * Usage:
 * <Suspense fallback={<Skeleton className="h-4 w-16" />}>
 *   <Views slug={article.slug} />
 * </Suspense>
 */
const Views = async ({ slug, className }: IViewsProps) => {
    const stats = await getArticleStats(slug);
    const count = stats?.views ?? 0;

    return (
        <span className={className ?? 'text-sm text-muted-foreground'}>
            {count.toLocaleString()} views
        </span>
    );
};

export { Views };
export type { IViewsProps };
