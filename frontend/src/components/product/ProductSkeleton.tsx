export default function ProductSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div>
            <div className="aspect-square w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-3 space-y-2 px-1">
              <div className="flex items-center justify-between">
                <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-1/6 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
            </div>
          </div>
          <div className="mt-4 border-t border-zinc-100 pt-3 px-1 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="h-5 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-9 w-9 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
