"use client";

import { useState, use, Suspense } from "react";
import Link from "next/link";
import ShopHeader from "@/components/product/ShopHeader";
import ShopSkeleton from "@/components/product/ShopSkeleton";
import ProductGrid from "@/components/product/ProductGrid";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import ProductPagination from "@/components/product/ProductPagination";
import { useShopDetails, useProductSearch } from "@/features/products/queries";
import {
  ChevronRight,
  Search,
  ArrowUpDown,
  AlertCircle,
  ArrowLeft,
  X,
  Store,
} from "lucide-react";

interface ShopPageProps {
  params: Promise<{ id: string }>;
}

function ShopPageContent({ shopId }: { shopId: string }) {
  const { data: shop, isLoading: isShopLoading, isError: isShopError } = useShopDetails(shopId);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Fetch shop products using search query & filters
  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    refetch,
  } = useProductSearch({
    shopId,
    q: searchQuery || undefined,
    sort,
    page,
    limit: 12,
  });

  const products = productsData?.products || [];
  const pagination = productsData?.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  if (isShopLoading) {
    return <ShopSkeleton />;
  }

  if (isShopError || !shop) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 p-12 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-bold text-red-900 dark:text-red-300">
            Shop Not Found
          </h1>
          <p className="mt-1 max-w-sm text-xs text-red-600 dark:text-red-400">
            The requested seller storefront does not exist or has been removed.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse All Marketplace Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-emerald-600">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <Link href="/products" className="hover:text-emerald-600">
          Products
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <span className="font-semibold text-zinc-900 dark:text-white">{shop.name}</span>
      </nav>

      {/* Shop Header */}
      <ShopHeader shop={shop} totalProducts={pagination.total} />

      {/* Shop Products Control Bar (In-Shop Search + Sorting) */}
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
        {/* Search inside Shop */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder={`Search inside ${shop.name}...`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-16 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              id="shop-search-input"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-12 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700"
            >
              Search
            </button>
          </div>
        </form>

        {/* Sort selector inside shop */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-emerald-600" />
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            id="shop-sort-select"
          >
            <option value="newest">Newest Products</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Shop Products Section */}
      <div className="space-y-6">
        {isProductsLoading ? (
          <ProductSkeleton count={8} />
        ) : isProductsError ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 p-10 text-center dark:border-red-900/40 dark:bg-red-950/20">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h3 className="mt-2 text-sm font-bold text-red-900 dark:text-red-300">
              Failed to load shop products
            </h3>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <ProductGrid
              products={products}
              emptyTitle={`No products found in ${shop.name}`}
              emptyMessage="This seller has not listed any products matching your search criteria yet."
            />

            <ProductPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(newPage) => {
                setPage(newPage);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function ShopDetailPage({ params }: ShopPageProps) {
  const { id } = use(params);

  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopPageContent shopId={id} />
    </Suspense>
  );
}
