"use client";

import Link from "next/link";
import ProductGrid from "./ProductGrid";
import ProductSkeleton from "./ProductSkeleton";
import { useProducts } from "@/features/products/queries";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FeaturedProductsSection() {
  const { data: products, isLoading } = useProducts();

  const featuredProducts = products ? products.slice(0, 8) : [];

  return (
    <section className="space-y-6" id="home-featured-products-section">
      <div className="flex items-end justify-between">
        <div>
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Curated Selection</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
            Featured Vendor Products
          </h2>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline dark:text-emerald-400"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <ProductSkeleton count={4} />
      ) : (
        <ProductGrid products={featuredProducts} />
      )}
    </section>
  );
}
