import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ISkeletonCardProps {
  className?: string;
}

/**
 * Skeleton loading card for content placeholders
 */
const SkeletonCard = ({ className }: ISkeletonCardProps) => (
  <div
    className={cn(
      "flex flex-col gap-4 w-full bg-card rounded-lg p-4 border",
      className,
    )}
  >
    <div className="flex justify-between items-start">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-20" />
      </div>
      <Skeleton className="size-12 rounded-full" />
    </div>
    <div className="flex flex-col gap-2">
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-2 w-3/4" />
    </div>
  </div>
);

interface ISkeletonFormProps {
  fields?: number;
  className?: string;
}

/**
 * Skeleton loading form for form placeholders
 */
const SkeletonForm = ({ fields = 4, className }: ISkeletonFormProps) => (
  <div className={cn("flex flex-col gap-4", className)}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex gap-3 justify-end mt-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

interface ISkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * Skeleton loading table for table placeholders
 */
const SkeletonTable = ({
  rows = 5,
  columns = 4,
  className,
}: ISkeletonTableProps) => (
  <div className={cn("flex flex-col gap-2 w-full", className)}>
    {/* Header */}
    <div className="flex gap-4 p-3 bg-muted rounded-t-lg">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 p-3 border-b">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export { SkeletonCard, SkeletonForm, SkeletonTable };
