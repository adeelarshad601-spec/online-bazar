"use client";

import { use, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import CategoryBar from "@/components/product/CategoryBar";
import ProductGrid from "@/components/product/ProductGrid";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import ProductPagination from "@/components/product/ProductPagination";
import { useCategoryDetails, useProductSearch } from "@/features/products/queries";
import { usePublicShops } from "@/features/seller/shop-queries";
import { Layers, ArrowLeft, AlertCircle } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

function CategoryPageContent({ categoryId }: { categoryId: string }) {
  const { data: category, isLoading: isCategoryLoading, isError: isCategoryError } = useCategoryDetails(categoryId);
  const [page, setPage] = useState(1);
  const categoryImage = category?.image && !/^(https?:\/\/)?(www\.)?example\.com\//i.test(category.image)
    ? category.image
    : null;

  const {
    data: productsData,
    isLoading: isProductsLoading,
    isError: isProductsError,
    refetch,
  } = useProductSearch({
    categoryId,
    page,
    limit: 12,
  });

  const products = productsData?.products || [];
  const { data: categoryShops = [] } = usePublicShops({ categoryId });
  const pagination = productsData?.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 };

  if (isCategoryLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
        <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-44 w-full animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
        <ProductSkeleton count={6} />
      </div>
    );
  }

  if (isCategoryError || !category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 p-12 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <h2 className="mt-3 text-lg font-bold text-red-900 dark:text-red-300">Category Not Found</h2>
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            The requested category does not exist or has been removed.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Explore All Marketplace Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
      {/* Back Link & Category Bar Navigation */}
      <div className="space-y-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Products</span>
        </Link>
        <CategoryBar selectedCategoryId={categoryId} />
      </div>

      {/* Category Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-950 p-8 text-white shadow-lg dark:border-zinc-800 sm:p-10">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-md">
              <Layers className="h-3.5 w-3.5" />
              <span>Category Catalog</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              {category.name}
            </h1>
            <p className="text-xs text-zinc-300">
              Showing {pagination.total} products in <strong className="text-emerald-300">{category.name}</strong>
            </p>
          </div>

          {categoryImage && (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/20 shadow-md">
              <Image
                src={categoryImage}
                alt={category.name}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {categoryShops.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Shops in {category.name}</h2>
          <div className="flex flex-wrap gap-3">
            {categoryShops.map((shop) => (
              <Link key={shop.id} href={`/shops/${shop.id}`} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-900 shadow-xs hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white">
                {shop.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Category Products Grid */}
      <div className="space-y-6">
        {isProductsLoading ? (
          <ProductSkeleton count={6} />
        ) : isProductsError ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 p-10 text-center dark:border-red-900/40 dark:bg-red-950/20">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h3 className="mt-2 text-sm font-bold text-red-900 dark:text-red-300">
              Failed to load category products
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
              emptyTitle={`No products found in ${category.name}`}
              emptyMessage="Sellers haven't added any products to this category yet."
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

export default function CategoryDetailPage({ params }: CategoryPageProps) {
  const { id } = use(params);

  return (
    <Suspense fallback={<ProductSkeleton count={6} />}>
      <CategoryPageContent categoryId={id} />
    </Suspense>
  );
}
