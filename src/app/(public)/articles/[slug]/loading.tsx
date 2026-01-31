import { Skeleton } from '@/components/feedback/Skeleton';

/**
 * Loading skeleton for article detail page
 * Shown while the article content is being fetched
 */
const ArticleLoading = () => {
    return (
        <div className="min-h-screen">
            {/* Header Section */}
            <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-24 md:pt-32 pb-12">
                {/* Back link */}
                <Skeleton className="mb-8 h-5 w-32" />

                {/* Tags */}
                <div className="flex gap-2 mb-6">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                </div>

                {/* Title */}
                <Skeleton className="h-10 md:h-12 w-3/4" />
                <Skeleton className="mt-3 h-10 md:h-12 w-1/2" />

                {/* Description */}
                <Skeleton className="mt-6 h-6 w-full" />
                <Skeleton className="mt-2 h-6 w-2/3" />

                {/* Meta */}
                <div className="mt-8 flex gap-6">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                </div>

                {/* Accent line */}
                <div className="mt-8 w-16 h-px bg-[var(--surface)]" />
            </div>

            {/* Cover image */}
            <div className="max-w-5xl mx-auto px-6 lg:px-8 mb-12">
                <Skeleton className="h-64 md:h-96 w-full rounded-2xl" />
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[1fr_250px]">
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
                            <Skeleton className="h-4 w-24 mb-4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default ArticleLoading;
