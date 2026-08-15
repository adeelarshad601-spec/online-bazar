export default function CategorySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-7 w-7 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
          </div>
          <div className="mt-6 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-1/2 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
