import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for article detail page
 * Shown while the article content is being fetched
 */
const ArticleLoading = () => {
    return (
        <div className="container-narrow py-12 animate-pulse">
            {/* Back link */}
            <Skeleton className="mb-8 h-5 w-32" />

            {/* Header */}
            <header className="mb-8">
                {/* Tags */}
                <div className="mb-4 flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                </div>

                {/* Title */}
                <Skeleton className="h-12 w-3/4 md:h-14" />
                <Skeleton className="mt-2 h-12 w-1/2 md:h-14" />

                {/* Description */}
                <Skeleton className="mt-4 h-6 w-full" />
                <Skeleton className="mt-2 h-6 w-2/3" />

                {/* Meta */}
                <div className="mt-6 flex gap-4">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </header>

            {/* Cover image */}
            <Skeleton className="mb-8 h-64 w-full rounded-lg md:h-96" />

            {/* Content */}
            <div className="grid gap-8 lg:grid-cols-[1fr_250px]">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-4/5" />
                    <Skeleton className="mt-6 h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="mt-6 h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-2/3" />
                </div>

                {/* Sidebar */}
                <aside className="hidden lg:block">
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ArticleLoading;
