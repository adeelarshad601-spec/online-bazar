export default function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
      <div className="h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left Column: Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square w-full animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 w-20 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
        </div>

        {/* Right Column: Details Skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
          </div>

          <div className="h-10 w-1/2 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-20 w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
