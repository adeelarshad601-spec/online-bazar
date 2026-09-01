"use client";

import Link from "next/link";
import CategoryPillBar from "@/components/product/CategoryPillBar";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import SpecificationsSection from "@/components/home/SpecificationsSection";
import { useProducts } from "@/features/products/queries";
import { ArrowRight, ChevronRight, Store } from "lucide-react";

export default function StorefrontHomePage() {
  const { data: products, isLoading } = useProducts();

  const latestProducts = products ? products.slice(0, 4) : [];
  const bestSellingProducts = products ? products.slice(0, 8) : [];
  const totalCount = products?.length || 12;

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Bento Grid Hero Section (GoCart Inspired Layout, Online-Bazar Emerald Theme) */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Main Hero Banner (Spans 2 columns on desktop) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-200/50 p-8 sm:p-12 lg:col-span-2 flex flex-col justify-between dark:from-emerald-950/60 dark:via-zinc-900 dark:to-emerald-900/40 border border-emerald-200/50 dark:border-emerald-800/30">
            <div className="max-w-md space-y-4 z-10">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                  NEWS
                </span>
                <span>Free Shipping on Orders Above $50!</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>

              {/* Slogan */}
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl lg:text-5xl leading-tight">
                Gadgets you'll love. <br />
                <span className="text-emerald-700 dark:text-emerald-400">Prices you'll trust.</span>
              </h1>

              {/* Subtext */}
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                Starts from <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">$4.90</span>
              </p>
            </div>

            {/* Product Graphic Cutout / Illustration */}
            <div className="mt-8 flex items-end justify-between z-10">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-6 py-3.5 text-xs font-bold text-white shadow-lg transition-all hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <span>Shop Marketplace</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white/80 p-2.5 shadow-sm backdrop-blur-md dark:bg-zinc-900/80">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Store className="h-5 w-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-zinc-900 dark:text-white">Verified Vendors</p>
                  <p className="text-[10px] text-zinc-500">100% Quality Guaranteed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side 2 Stacked Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {/* Top Promo Card (Warm Peach) */}
            <div className="relative overflow-hidden rounded-3xl bg-amber-100/70 p-6 flex items-center justify-between dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/30">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Best products
                </h3>
                <Link
                  href="/products?sort=popular"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-emerald-700 dark:text-zinc-300 dark:hover:text-emerald-400"
                >
                  <span>View more</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Decorative Audio/Tech Icon Graphic */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-amber-200/60 text-amber-800 shadow-inner dark:bg-amber-900/50 dark:text-amber-300 text-3xl font-black">
                🎧
              </div>
            </div>

            {/* Bottom Promo Card (Soft Blue) */}
            <div className="relative overflow-hidden rounded-3xl bg-sky-100/70 p-6 flex items-center justify-between dark:bg-sky-950/40 border border-sky-200/50 dark:border-sky-900/30">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  20% discounts
                </h3>
                <Link
                  href="/products?featured=true"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-emerald-700 dark:text-zinc-300 dark:hover:text-emerald-400"
                >
                  <span>View more</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Decorative Watch/Tech Icon Graphic */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-sky-200/60 text-sky-800 shadow-inner dark:bg-sky-900/50 dark:text-sky-300 text-3xl font-black">
                ⌚
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Pill Bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CategoryPillBar />
      </section>

      {/* 3. Latest Products Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6" id="latest-products-section">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Latest Products
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>Showing {latestProducts.length} of {totalCount} products</span>
            <span>•</span>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-emerald-600 hover:underline dark:text-emerald-400 font-bold"
            >
              <span>View more</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <ProductSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {latestProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Best Selling Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6" id="best-selling-section">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            Best Selling
          </h2>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span>Showing {bestSellingProducts.length} of {totalCount} products</span>
            <span>•</span>
            <Link
              href="/products?sort=popular"
              className="inline-flex items-center gap-1 text-emerald-600 hover:underline dark:text-emerald-400 font-bold"
            >
              <span>View more</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <ProductSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {bestSellingProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} priority={idx < 4} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Our Specifications Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SpecificationsSection />
      </section>

      {/* 6. Become a Seller Callout Banner (Restored as requested) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-10 text-white shadow-xl sm:px-12 sm:py-12">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
              Grow Your Business
            </span>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Ready to sell your products on Online-Bazar?
            </h2>
            <p className="text-xs text-emerald-100 sm:text-sm">
              Open your vendor shop today, reach thousands of buyers, and manage orders with our powerful seller dashboard.
            </p>
            <Link
              href="/seller/apply"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs font-bold text-emerald-700 shadow-md transition-all hover:bg-emerald-50 hover:shadow-lg"
              id="banner-apply-seller-btn"
            >
              <Store className="h-4 w-4" />
              <span>Apply as a Seller</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
