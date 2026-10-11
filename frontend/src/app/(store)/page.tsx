"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CategoryPillBar from "@/components/product/CategoryPillBar";
import ProductCard from "@/components/product/ProductCard";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import SpecificationsSection from "@/components/home/SpecificationsSection";
import { useProducts } from "@/features/products/queries";
import { ArrowRight, Search, ShieldCheck, ShoppingBag, Store, Truck } from "lucide-react";

export default function StorefrontHomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: products, isLoading } = useProducts();

  const latestProducts = products ? products.slice(0, 4) : [];
  const bestSellingProducts = products ? products.slice(0, 8) : [];
  const totalCount = products?.length || 12;

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Marketplace Hero */}
      <section className="relative isolate overflow-hidden bg-[#f8f7f1] dark:bg-zinc-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-[#e6f0e8] dark:bg-emerald-950/30"
          style={{ clipPath: "polygon(0 32%, 15% 56%, 30% 19%, 44% 54%, 59% 0, 75% 49%, 91% 20%, 100% 42%, 100% 100%, 0 100%)" }}
        />
        <div className="relative mx-auto grid min-h-140 max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:min-h-125 lg:grid-cols-[1.08fr_0.92fr] lg:gap-5 lg:px-8 lg:py-10">
          <div className="hero-copy-enter relative z-10 max-w-2xl space-y-5">
            <div className="hero-copy-item inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300 sm:text-xs">
              <ShoppingBag className="h-4 w-4" />
              <span>Good finds from trusted sellers</span>
            </div>

            <h1 className="hero-copy-item max-w-xl font-serif text-[2.65rem] font-semibold leading-[1.08] text-[#173b30] dark:text-white sm:text-5xl lg:text-[3.65rem]">
              Find your next <span className="text-emerald-700 dark:text-emerald-400">favorite thing.</span>
            </h1>

            <p className="hero-copy-item max-w-lg text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:text-base">
              Shop everyday essentials, fresh style, and useful tech from independent sellers across Online Bazar.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                const params = new URLSearchParams();
                if (searchTerm.trim()) params.set("search", searchTerm.trim());
                router.push(`/products${params.size ? `?${params.toString()}` : ""}`);
              }}
              className="hero-copy-item flex w-full max-w-xl items-center rounded-full border border-[#e5e1d7] bg-white p-1.5 shadow-[0_8px_28px_rgba(28,55,42,0.10)] dark:border-zinc-700 dark:bg-zinc-900"
            >
              <Search className="ml-3 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
              <input
                aria-label="Search products"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="What are you looking for?"
                className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-white"
              />
              <button
                type="submit"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-emerald-700 px-4 text-xs font-bold text-white transition-colors hover:bg-emerald-800 sm:px-5 sm:text-sm"
              >
                Search
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="hero-copy-item flex flex-wrap gap-x-6 gap-y-3 pt-1 text-xs font-semibold text-[#37564a] dark:text-emerald-100">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />Secure checkout</span>
              <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />Delivery to your door</span>
            </div>
          </div>

          <div className="relative mx-auto h-80 w-full max-w-117.5 sm:h-100 lg:h-110">
            <div aria-hidden="true" className="absolute left-[18%] top-[12%] h-[76%] w-[65%] rotate-[-8deg] rounded-[2rem] bg-[#d9e8dc] shadow-lg dark:bg-emerald-950" />
            <div aria-hidden="true" className="absolute left-[22%] top-[8%] h-[78%] w-[65%] rotate-[7deg] rounded-[2rem] bg-[#d6e9e9] shadow-lg dark:bg-teal-950" />

            {products?.slice(0, 3).map((product, index) => {
              const positions = [
                "left-[20%] top-[4%] z-20 h-[82%] w-[66%]",
                "left-[4%] top-[15%] z-10 h-[72%] w-[62%] -rotate-[7deg]",
                "right-[0%] top-[13%] z-0 h-[70%] w-[58%] rotate-[8deg]",
              ];
              const imageUrl = product.images?.[0]?.url;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className={`absolute overflow-hidden rounded-[1.65rem] border-[5px] border-white bg-white shadow-[0_18px_45px_rgba(28,55,42,0.20)] transition-transform duration-500 hover:-translate-y-2 dark:border-zinc-800 dark:bg-zinc-900 ${positions[index]}`}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.title}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 768px) 55vw, 30vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#eaf2ec] text-emerald-700 dark:bg-zinc-800 dark:text-emerald-300">
                      <ShoppingBag className="h-14 w-14 stroke-[1.2]" />
                    </div>
                  )}
                  {index === 0 && (
                    <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded-xl bg-white/95 px-3 py-2 shadow-sm backdrop-blur dark:bg-zinc-950/90">
                      <span className="min-w-0 truncate text-xs font-bold text-zinc-800 dark:text-white">{product.title}</span>
                      <span className="shrink-0 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">${Number(product.price).toFixed(0)}</span>
                    </div>
                  )}
                </Link>
              );
            })}

            {!products?.length && (
              <div className="absolute left-[20%] top-[4%] z-20 flex h-[82%] w-[66%] items-center justify-center overflow-hidden rounded-[1.65rem] border-[5px] border-white bg-[#e6f0e8] shadow-[0_18px_45px_rgba(28,55,42,0.20)] dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex h-44 w-44 items-center justify-center rounded-full bg-white/70 text-emerald-700 dark:bg-zinc-800 dark:text-emerald-300">
                  <ShoppingBag className="h-20 w-20 stroke-[1.1]" />
                </div>
              </div>
            )}

            <div className="absolute bottom-[1%] left-[3%] z-30 flex items-center gap-2 rounded-2xl border border-white/80 bg-white px-3 py-2.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 sm:px-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-white"><Store className="h-4 w-4" /></span>
              <span className="text-xs font-bold text-zinc-800 dark:text-white">One bazaar, more to love</span>
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
