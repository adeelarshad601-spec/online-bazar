import Link from "next/link";
import CategoryGrid from "@/components/product/CategoryGrid";
import FeaturedProductsSection from "@/components/product/FeaturedProductsSection";
import { ArrowRight, ShoppingBag, Store, ShieldCheck, Sparkles, Flame, Tag } from "lucide-react";

export default function StorefrontHomePage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-zinc-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Next-Gen Multi-Vendor Marketplace</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Discover Local & Global <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Sellers</span> in One Place
              </h1>

              <p className="max-w-xl text-base text-zinc-300 sm:text-lg">
                Shop thousands of unique items, fashion, tech, home goods, and more directly from verified independent vendors on Online-Bazar.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/40"
                  id="hero-explore-products-btn"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Explore Products
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/seller/apply"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-6 py-3.5 text-sm font-semibold text-zinc-200 backdrop-blur-md transition-all hover:bg-zinc-800 hover:text-white"
                  id="hero-become-seller-btn"
                >
                  <Store className="h-4 w-4 text-teal-400" />
                  Become a Seller
                </Link>
              </div>
            </div>

            {/* Feature Cards Showcase */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-transform hover:-translate-y-1">
                  <Flame className="h-8 w-8 text-amber-400" />
                  <h3 className="mt-3 text-base font-bold text-white">Daily Deals</h3>
                  <p className="mt-1 text-xs text-zinc-400">Up to 50% off on top trending categories.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-transform hover:-translate-y-1">
                  <ShieldCheck className="h-8 w-8 text-emerald-400" />
                  <h3 className="mt-3 text-base font-bold text-white">Verified Shops</h3>
                  <p className="mt-1 text-xs text-zinc-400">All sellers are thoroughly vetted for quality.</p>
                </div>
              </div>
              <div className="space-y-4 pt-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-transform hover:-translate-y-1">
                  <Tag className="h-8 w-8 text-teal-400" />
                  <h3 className="mt-3 text-base font-bold text-white">Best Pricing</h3>
                  <p className="mt-1 text-xs text-zinc-400">Direct vendor pricing with zero middleman markup.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-transform hover:-translate-y-1">
                  <ShoppingBag className="h-8 w-8 text-indigo-400" />
                  <h3 className="mt-3 text-base font-bold text-white">Seamless Cart</h3>
                  <p className="mt-1 text-xs text-zinc-400">Multi-seller checkout in one single order.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Category Grid Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <CategoryGrid title="Top Marketplace Categories" subtitle="Find top-rated products by browsing independent seller categories" />
      </section>

      {/* Featured Products Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FeaturedProductsSection />
      </section>

      {/* Seller Application Callout Banner */}
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
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-emerald-700 shadow-md transition-colors hover:bg-emerald-50"
              id="banner-apply-seller-btn"
            >
              <Store className="h-4 w-4" />
              Apply as a Seller
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
