import React from 'react';

import { cn } from '@/lib/utils';

const MemoizedSkeleton = React.memo(({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return <div className={cn('animate-pulse rounded-md bg-slate-100 w-full shrink-0', className)} {...props} />;
});

export { MemoizedSkeleton as Skeleton };
