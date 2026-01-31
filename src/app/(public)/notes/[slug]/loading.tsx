import { Skeleton } from '@/components/feedback/Skeleton';

/**
 * Loading skeleton for note detail page
 */
const NoteLoading = () => {
    return (
        <div className="min-h-screen">
            {/* Header Section */}
            <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 md:pt-32 pb-12">
                {/* Back link */}
                <Skeleton className="mb-8 h-5 w-28" />

                {/* Type + Tags */}
                <div className="flex gap-2 mb-6">
                    <Skeleton className="h-6 w-14 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* Title */}
                <Skeleton className="h-8 md:h-10 w-3/4" />
                <Skeleton className="mt-3 h-8 md:h-10 w-1/2" />

                {/* Description */}
                <Skeleton className="mt-4 h-5 w-full" />
                <Skeleton className="mt-2 h-5 w-2/3" />

                {/* Meta */}
                <div className="mt-6 flex gap-6">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                </div>

                {/* Accent line */}
                <div className="mt-8 w-12 h-px bg-[var(--surface)]" />
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 lg:px-8 pb-16">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-4/5" />
                    <Skeleton className="mt-6 h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-9 w-24 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteLoading;
