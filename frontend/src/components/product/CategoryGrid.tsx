"use client";

import { useCategories } from "@/features/products/queries";
import CategoryCard from "./CategoryCard";
import CategorySkeleton from "./CategorySkeleton";
import CategoryEmptyState from "./CategoryEmptyState";
import { AlertCircle, RefreshCw } from "lucide-react";

interface CategoryGridProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

export default function CategoryGrid({
  title = "Explore Top Categories",
  subtitle = "Browse verified vendor products by category",
  limit,
}: CategoryGridProps) {
  const { data: categories, isLoading, isError, refetch } = useCategories();

  const displayedCategories = limit && categories ? categories.slice(0, limit) : categories;

  return (
    <section className="space-y-6" id="storefront-category-grid-section">
      {(title || subtitle) && (
        <div className="flex items-end justify-between">
          <div>
            {title && (
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <CategorySkeleton count={limit || 6} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center dark:border-red-900/50 dark:bg-red-950/20">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <h3 className="mt-2 text-sm font-bold text-red-900 dark:text-red-300">
            Failed to Load Categories
          </h3>
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            We couldn't connect to the marketplace server. Please try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : !displayedCategories || displayedCategories.length === 0 ? (
        <CategoryEmptyState />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {displayedCategories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              priority={index < 4}
            />
          ))}
        </div>
      )}
    </section>
  );
}
