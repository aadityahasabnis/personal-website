import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="container-narrow py-12">
      {/* Header skeleton */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Cards skeleton */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border p-6">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
