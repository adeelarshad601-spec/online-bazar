export default function ShopSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
      <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="h-44 w-full animate-pulse bg-zinc-300 dark:bg-zinc-800 sm:h-56" />
        <div className="p-6 space-y-4">
          <div className="-mt-14 h-24 w-24 animate-pulse rounded-2xl bg-zinc-200 border-4 border-white dark:border-zinc-900 dark:bg-zinc-700" />
          <div className="h-8 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800/60" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/60" />
        ))}
      </div>
    </div>
  );
}
