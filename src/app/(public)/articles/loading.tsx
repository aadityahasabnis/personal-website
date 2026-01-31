import { PageHeaderSkeleton, ArticlesGridSkeleton } from '@/components/feedback/Skeleton';

/**
 * Loading skeleton for articles listing page
 */
const ArticlesLoading = () => {
    return (
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 md:py-32">
            <PageHeaderSkeleton />
            <ArticlesGridSkeleton />
        </div>
    );
};

export default ArticlesLoading;
