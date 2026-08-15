import { useCategories } from "@/features/products/queries";
import { X, RotateCcw } from "lucide-react";

interface ActiveFilterChipsProps {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  onRemoveQuery: () => void;
  onRemoveCategory: () => void;
  onRemovePrice: () => void;
  onRemoveSort: () => void;
  onClearAll: () => void;
}

export default function ActiveFilterChips({
  q,
  categoryId,
  minPrice,
  maxPrice,
  sort,
  onRemoveQuery,
  onRemoveCategory,
  onRemovePrice,
  onRemoveSort,
  onClearAll,
}: ActiveFilterChipsProps) {
  const { data: categories } = useCategories();

  const selectedCategoryName = categoryId
    ? categories?.find((c) => c.id === categoryId)?.name || "Category"
    : null;

  const hasPriceFilter = minPrice !== undefined || maxPrice !== undefined;
  const hasSortFilter = sort && sort !== "newest";
  const hasActiveFilters = Boolean(q || categoryId || hasPriceFilter || hasSortFilter);

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2" id="active-filter-chips-bar">
      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Active Filters:</span>

      {/* Search Term Chip */}
      {q && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <span>Search: &quot;{q}&quot;</span>
          <button
            type="button"
            onClick={onRemoveQuery}
            className="rounded-full p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-900"
            aria-label="Remove search filter"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {/* Category Chip */}
      {categoryId && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <span>Category: {selectedCategoryName}</span>
          <button
            type="button"
            onClick={onRemoveCategory}
            className="rounded-full p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-900"
            aria-label="Remove category filter"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {/* Price Range Chip */}
      {hasPriceFilter && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <span>
            Price: ${minPrice ?? 0} - {maxPrice ? `$${maxPrice}` : "∞"}
          </span>
          <button
            type="button"
            onClick={onRemovePrice}
            className="rounded-full p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-900"
            aria-label="Remove price filter"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {/* Sort Chip */}
      {hasSortFilter && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <span>
            Sort: {sort === "price_asc" ? "Price Low-High" : "Price High-Low"}
          </span>
          <button
            type="button"
            onClick={onRemoveSort}
            className="rounded-full p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-900"
            aria-label="Remove sort filter"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      )}

      {/* Clear All Link */}
      <button
        type="button"
        onClick={onClearAll}
        className="flex items-center gap-1 text-xs font-bold text-red-600 hover:underline dark:text-red-400"
      >
        <RotateCcw className="h-3 w-3" />
        <span>Clear All</span>
      </button>
    </div>
  );
}
