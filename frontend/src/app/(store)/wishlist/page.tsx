"use client";

import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  useWishlist,
  useRemoveFromWishlist,
  useClearWishlist,
} from "@/features/wishlist/queries";
import { useAddToCart } from "@/features/cart/queries";
import { WishlistItem } from "@/types/wishlist";
import {
  Heart,
  Trash2,
  ShoppingBag,
  Store,
  Star,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";

function WishlistItemCard({ item }: { item: WishlistItem }) {
  const { product } = item;
  const { mutate: addToCart, isPending: isAddingCart } = useAddToCart();
  const { mutate: removeFromWishlist, isPending: isRemovingWishlist } = useRemoveFromWishlist();

  const primaryImage = product.images && product.images.length > 0 ? product.images[0].url : null;
  const numericPrice = typeof product.price === "number" ? product.price : parseFloat(String(product.price || 0));
  const numericCompareAt = product.compareAtPrice
    ? typeof product.compareAtPrice === "number"
      ? product.compareAtPrice
      : parseFloat(String(product.compareAtPrice))
    : null;

  const hasDiscount = Boolean(numericCompareAt && numericCompareAt > numericPrice);
  const discountPercentage = hasDiscount
    ? Math.round(((numericCompareAt! - numericPrice) / numericCompareAt!) * 100)
    : 0;

  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900"
      id={`wishlist-card-${item.id}`}
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <Link href={`/products/${product.id}`} className="block h-full w-full">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-400 dark:text-zinc-600">
                <ShoppingBag className="h-12 w-12 stroke-[1.5]" />
              </div>
            )}
          </Link>

          {/* Badges Overlay */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1">
            {hasDiscount && (
              <span className="rounded-lg bg-red-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                -{discountPercentage}%
              </span>
            )}
            {product.stock <= 5 && product.stock > 0 && (
              <span className="rounded-lg bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                Only {product.stock} Left
              </span>
            )}
            {product.stock === 0 && (
              <span className="rounded-lg bg-zinc-800/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                Out of Stock
              </span>
            )}
          </div>

          {/* Remove from Wishlist Action */}
          <button
            type="button"
            disabled={isRemovingWishlist}
            onClick={() => removeFromWishlist(product.id)}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-md backdrop-blur-md transition-transform hover:scale-110 active:scale-95 dark:bg-zinc-900/90"
            aria-label="Remove from wishlist"
            title="Remove from wishlist"
          >
            {isRemovingWishlist ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Details Section */}
        <div className="mt-3 space-y-2 px-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            {product.shop ? (
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <Store className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{product.shop.name}</span>
              </span>
            ) : (
              <span>Marketplace Product</span>
            )}

            {product.reviewCount ? (
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-3 w-3 fill-amber-400" />
                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                  {product.rating?.toFixed(1)}
                </span>
              </div>
            ) : (
              <span className="text-[10px] font-semibold text-zinc-400">New</span>
            )}
          </div>

          <Link
            href={`/products/${product.id}`}
            className="block font-bold text-sm text-zinc-900 line-clamp-2 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400"
          >
            {product.title}
          </Link>
        </div>
      </div>

      {/* Bottom Price & Add to Cart Area */}
      <div className="mt-4 border-t border-zinc-100 pt-3 px-1 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-zinc-900 dark:text-white">
                ${numericPrice.toFixed(2)}
              </span>
              {hasDiscount && numericCompareAt && (
                <span className="text-xs text-zinc-400 line-through">
                  ${numericCompareAt.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={product.stock <= 0 || isAddingCart}
            onClick={() => addToCart({ productId: product.id, quantity: 1 })}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-600"
          >
            {isAddingCart ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5" />
            )}
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function WishlistSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

function WishlistPageContent() {
  const { data: wishlist, isLoading, isError, refetch } = useWishlist();
  const { mutate: clearWishlist, isPending: isClearing } = useClearWishlist();

  if (isLoading) {
    return <WishlistSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 p-12 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-bold text-red-900 dark:text-red-300">
            Failed to Load Wishlist
          </h1>
          <p className="mt-1 max-w-sm text-xs text-red-600 dark:text-red-400">
            We couldn't connect to your saved wishlist. Please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Request
          </button>
        </div>
      </div>
    );
  }

  const items = wishlist?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
            <Heart className="h-5 w-5 fill-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
              Saved Wishlist
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Keep track of items you want to buy later
            </p>
          </div>
        </div>

        {!isEmpty && (
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-red-100 px-3.5 py-1 text-xs font-bold text-red-800 dark:bg-red-950 dark:text-red-300">
              {items.length} Saved Items
            </span>

            <button
              type="button"
              disabled={isClearing}
              onClick={() => clearWishlist()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-600 shadow-xs hover:bg-red-50 hover:text-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
            >
              {isClearing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white p-16 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950 dark:text-red-400">
            <Heart className="h-10 w-10 stroke-[1.5]" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white">
            Your Wishlist is Empty
          </h2>
          <p className="mt-2 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
            Save your favorite products to keep track of prices, discounts, and vendor availability.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
          >
            <span>Explore Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        /* Wishlist Items Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <WishlistItemCard key={item.id} item={item} />
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Marketplace Catalog</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistPageContent />
    </ProtectedRoute>
  );
}
