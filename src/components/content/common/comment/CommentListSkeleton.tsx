'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// =============================================================
// Types
// =============================================================

interface ICommentListSkeletonProps {
    className?: string;
}

// =============================================================
// Component
// =============================================================

export const CommentListSkeleton = ({ className }: ICommentListSkeletonProps) => {
    return (
        <div className={cn('space-y-4', className)} aria-hidden='true'>
            {/* First comment with reply */}
            <div className='p-4 bg-card border border-border rounded-lg'>
                <div className='flex gap-3'>
                    <Skeleton className='shrink-0 w-9 h-9 rounded-full' />
                    <div className='flex-1 space-y-2'>
                        <div className='flex items-center gap-2'>
                            <Skeleton className='h-4 w-24' />
                            <Skeleton className='h-3 w-16' />
                        </div>
                        <Skeleton className='h-4 w-full' />
                        <Skeleton className='h-4 w-4/5' />
                        <div className='flex gap-2 pt-1'>
                            <Skeleton className='h-7 w-12 rounded-md' />
                            <Skeleton className='h-7 w-14 rounded-md' />
                        </div>
                    </div>
                </div>
            </div>

            {/* Second comment */}
            <div className='p-4 bg-card border border-border rounded-lg'>
                <div className='flex gap-3'>
                    <Skeleton className='shrink-0 w-9 h-9 rounded-full' />
                    <div className='flex-1 space-y-2'>
                        <div className='flex items-center gap-2'>
                            <Skeleton className='h-4 w-20' />
                            <Skeleton className='h-4 w-12 rounded' />
                            <Skeleton className='h-3 w-14' />
                        </div>
                        <Skeleton className='h-4 w-full' />
                        <Skeleton className='h-4 w-3/4' />
                        <Skeleton className='h-4 w-1/2' />
                        <div className='flex gap-2 pt-1'>
                            <Skeleton className='h-7 w-12 rounded-md' />
                            <Skeleton className='h-7 w-14 rounded-md' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
