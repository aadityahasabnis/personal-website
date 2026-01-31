import { getAndIncrementViews } from '@/server/queries/stats';

interface IViewsProps {
    slug: string;
    className?: string;
}

/**
 * Views - Server Component that streams view count
 * 
 * This component:
 * 1. Increments view count atomically in MongoDB
 * 2. Returns the updated count
 * 3. Streams into the page via Suspense (doesn't block initial HTML)
 * 
 * Usage:
 * <Suspense fallback={<Skeleton className="h-4 w-16" />}>
 *   <Views slug={article.slug} />
 * </Suspense>
 */
const Views = async ({ slug, className }: IViewsProps) => {
    const count = await getAndIncrementViews(slug);

    return (
        <span className={className ?? 'text-sm text-muted-foreground'}>
            {count.toLocaleString()} views
        </span>
    );
};

export { Views };
export type { IViewsProps };
