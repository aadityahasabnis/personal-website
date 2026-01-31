import { PageHeaderSkeleton, NotesGridSkeleton } from '@/components/feedback/Skeleton';

/**
 * Loading skeleton for notes listing page
 */
const NotesLoading = () => {
    return (
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 md:py-32">
            <PageHeaderSkeleton />
            <NotesGridSkeleton />
        </div>
    );
};

export default NotesLoading;
