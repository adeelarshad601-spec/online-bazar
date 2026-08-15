import { Layers } from "lucide-react";

export default function CategoryEmptyState({
  title = "No Categories Available",
  message = "Check back soon as our sellers add new categories and products.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50 p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner dark:bg-emerald-950 dark:text-emerald-300">
        <Layers className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  );
}
