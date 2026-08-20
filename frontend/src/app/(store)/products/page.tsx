"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductGrid from "@/components/product/ProductGrid";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import ProductFilterSidebar from "@/components/product/ProductFilterSidebar";
import ActiveFilterChips from "@/components/product/ActiveFilterChips";
import ProductPagination from "@/components/product/ProductPagination";
import { useProductSearch } from "@/features/products/queries";
import { usePublicShops } from "@/features/seller/shop-queries";
import { Search, Filter, AlertCircle, RefreshCw, ShoppingBag, X } from "lucide-react";

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL search params safely
  const q = searchParams.get("q") || searchParams.get("search") || undefined;
  const categoryId = searchParams.get("categoryId") || searchParams.get("category") || undefined;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const sort = searchParams.get("sort") || "newest";
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  const [searchInput, setSearchInput] = useState(q || "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // TanStack Query hook
  const { data, isLoading, isError, refetch, isFetching } = useProductSearch({
    q,
    categoryId,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: 12,
  });

  const products = data?.products || [];
  const { data: matchingShops = [] } = usePublicShops(q ? { search: q } : undefined);
  const pagination = data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 };

  // Helper to update URL search params
  const updateUrlParams = (newParams: Record<string, string | number | undefined | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    // If changing filters, reset search alias if q is set
    if (newParams.q !== undefined) {
      params.delete("search");
    }
    if (newParams.categoryId !== undefined) {
      params.delete("category");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: searchInput.trim(), page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateUrlParams({ q: undefined, page: 1 });
  };

  const handleFilterChange = (filters: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
  }) => {
    updateUrlParams({
      categoryId: filters.categoryId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
      page: filters.page || 1,
    });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    router.push(pathname);
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6 sm:px-6 lg:px-8">
      {/* Top Banner & Search Input */}
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>

          {q && matchingShops.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Matching Shops</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {matchingShops.map((shop) => (
                  <a
                    key={shop.id}
                    href={`/shops/${shop.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xs transition hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                      {shop.logo ? <img src={shop.logo} alt="" className="h-full w-full object-cover" /> : <ShoppingBag className="m-3 h-6 w-6 text-emerald-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-zinc-900 dark:text-white">{shop.name}</p>
                      <p className="truncate text-xs text-zinc-500">{shop.description || "View seller storefront"}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
              Marketplace Catalog
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Browse products by search, category, price, and sorting
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 shadow-xs hover:bg-zinc-50 lg:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              id="mobile-filter-open-btn"
            >
              <Filter className="h-4 w-4 text-emerald-600" />
              <span>Filters</span>
            </button>

            {/* Total Results Counter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <ShoppingBag className="h-4 w-4 text-emerald-600" />
              <span>{pagination.total} Products Found</span>
            </div>
          </div>
        </div>

        {/* Search Bar Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products by keyword, brand, or SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 bg-white py-2.5 pl-10 pr-20 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              id="products-search-input"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-14 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
              id="products-search-btn"
            >
              Search
            </button>
          </div>
        </form>

        {/* Active Filter Chips */}
        <ActiveFilterChips
          q={q}
          categoryId={categoryId}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sort={sort}
          onRemoveQuery={handleClearSearch}
          onRemoveCategory={() => updateUrlParams({ categoryId: undefined, page: 1 })}
          onRemovePrice={() => updateUrlParams({ minPrice: undefined, maxPrice: undefined, page: 1 })}
          onRemoveSort={() => updateUrlParams({ sort: "newest", page: 1 })}
          onClearAll={handleResetFilters}
        />
      </div>

      {/* Main Layout: Sidebar + Product Grid */}
      <div className="flex gap-8">
        {/* Sidebar */}
        <ProductFilterSidebar
          categoryId={categoryId}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sort={sort}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          isOpenMobile={mobileFiltersOpen}
          onCloseMobile={() => setMobileFiltersOpen(false)}
        />

        {/* Products Content */}
        <div className="flex-1 space-y-8">
          {isLoading ? (
            <ProductSkeleton count={8} />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 p-12 text-center dark:border-red-900/50 dark:bg-red-950/20">
              <AlertCircle className="h-10 w-10 text-red-500" />
              <h3 className="mt-3 text-base font-bold text-red-900 dark:text-red-300">
                Failed to Load Products
              </h3>
              <p className="mt-1 max-w-sm text-xs text-red-600 dark:text-red-400">
                We encountered an issue connecting to the product service. Please try again.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Request
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {isFetching && (
                <div className="h-1 w-full overflow-hidden bg-emerald-100 dark:bg-emerald-950">
                  <div className="h-full w-1/3 animate-pulse bg-emerald-600" />
                </div>
              )}

              <ProductGrid
                products={products}
                emptyTitle="No Matching Products Found"
                emptyMessage="Try adjusting your search keywords, price range, or category filter."
              />

              <ProductPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductSkeleton count={8} />}>
      <ProductsContent />
    </Suspense>
  );
}
