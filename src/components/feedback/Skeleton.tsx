'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ISkeletonProps {
  className?: string;
}

/**
 * Premium Skeleton Component
 * Animated loading placeholder with shimmer effect
 */
export const Skeleton = ({ className }: ISkeletonProps) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-lg bg-[var(--surface)]',
      'before:absolute before:inset-0 before:-translate-x-full',
      'before:animate-[shimmer_1.5s_infinite]',
      'before:bg-gradient-to-r before:from-transparent before:via-[var(--fg)]/5 before:to-transparent',
      className,
    )}
  />
);

/**
 * Content Card Skeleton
 */
export const ContentCardSkeleton = ({ featured = false }: { featured?: boolean }) => (
  <div
    className={cn(
      'rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)]',
      featured ? 'p-8 md:p-10' : 'p-6',
    )}
  >
    <div className="flex gap-2 mb-4">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-20" />
    </div>
    <Skeleton className={cn('w-3/4', featured ? 'h-8' : 'h-6')} />
    <Skeleton className="h-4 w-full mt-3" />
    <Skeleton className="h-4 w-2/3 mt-2" />
    <div className="flex gap-4 mt-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

/**
 * Page Header Skeleton
 */
export const PageHeaderSkeleton = () => (
  <div className="mb-16 md:mb-20">
    <Skeleton className="h-4 w-24 mb-4" />
    <Skeleton className="h-12 md:h-16 w-48" />
    <Skeleton className="h-6 w-full max-w-2xl mt-6" />
    <Skeleton className="h-6 w-3/4 max-w-xl mt-2" />
    <Skeleton className="h-px w-32 mt-8" />
  </div>
);

/**
 * Articles Grid Skeleton
 */
export const ArticlesGridSkeleton = () => (
  <div className="space-y-12">
    {/* Featured skeleton */}
    <div className="grid gap-6 md:grid-cols-2">
      <ContentCardSkeleton featured />
      <ContentCardSkeleton featured />
    </div>
    {/* Grid skeleton */}
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <ContentCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

/**
 * Notes Grid Skeleton
 */
export const NotesGridSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 9 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.05 }}
      >
        <ContentCardSkeleton />
      </motion.div>
    ))}
  </div>
);

/**
 * Projects Grid Skeleton
 */
export const ProjectsGridSkeleton = () => (
  <div className="grid gap-8 md:grid-cols-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
        className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-8 overflow-hidden"
      >
        <Skeleton className="h-48 w-full rounded-xl mb-6" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full mt-3" />
        <Skeleton className="h-4 w-5/6 mt-2" />
        <div className="flex gap-3 mt-6">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-20 rounded-full" />
        </div>
      </motion.div>
    ))}
  </div>
);

export default Skeleton;
