"use client";

import { useState, useEffect } from "react";
import { useCategories } from "@/features/products/queries";
import { Filter, X, RotateCcw, DollarSign, Layers, ArrowUpDown } from "lucide-react";

interface ProductFilterSidebarProps {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  onFilterChange: (filters: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
  }) => void;
  onReset: () => void;

  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function ProductFilterSidebar({
  categoryId,
  minPrice,
  maxPrice,
  sort = "newest",
  onFilterChange,
  onReset,
  isOpenMobile = false,
  onCloseMobile,
}: ProductFilterSidebarProps) {
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();

  const [minInput, setMinInput] = useState(minPrice ? String(minPrice) : "");
  const [maxInput, setMaxInput] = useState(maxPrice ? String(maxPrice) : "");

  useEffect(() => {
    setMinInput(minPrice ? String(minPrice) : "");
  }, [minPrice]);

  useEffect(() => {
    setMaxInput(maxPrice ? String(maxPrice) : "");
  }, [maxPrice]);

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const min = minInput ? Number(minInput) : undefined;
    const max = maxInput ? Number(maxInput) : undefined;
    onFilterChange({ minPrice: min, maxPrice: max, page: 1 });
  };

  const handleCategorySelect = (id?: string) => {
    onFilterChange({ categoryId: id === categoryId ? undefined : id, page: 1 });
  };

  const handleSortSelect = (newSort: string) => {
    onFilterChange({ sort: newSort, page: 1 });
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Header & Reset Button */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Filter Products</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
          id="reset-filters-btn"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Sorting Control */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <ArrowUpDown className="h-3.5 w-3.5 text-emerald-600" />
          <span>Sort By</span>
        </label>
        <select
          value={sort}
          onChange={(e) => handleSortSelect(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-800 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          aria-label="Sort product catalog"
          id="filter-sort-select"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <Layers className="h-3.5 w-3.5 text-emerald-600" />
          <span>Category</span>
        </label>
        {isCategoriesLoading ? (
          <div className="space-y-2 py-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : (
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => handleCategorySelect(undefined)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${!categoryId
                  ? "bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
            >
              <span>All Categories</span>
            </button>
            {categories?.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${isSelected
                      ? "bg-emerald-100 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                >
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <form onSubmit={handlePriceApply} className="space-y-3">
        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
          <span>Price Range ($)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            id="min-price-input"
          />
          <span className="text-zinc-400">-</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            id="max-price-input"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-zinc-900 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          id="apply-price-filter-btn"
        >
          Apply Price Filter
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Container */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/80">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto flex h-full w-4/5 max-w-sm flex-col bg-white p-6 shadow-2xl dark:bg-zinc-950">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">Filters</span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex-1 overflow-y-auto">{filterContent}</div>
          </div>
        </div>
      )}
    </>
  );
}
