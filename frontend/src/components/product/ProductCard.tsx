"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { useAddToCart } from "@/features/cart/queries";
import {
  useWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
} from "@/features/wishlist/queries";
import { useCurrentUser } from "@/features/auth/queries";
import { Heart, ShoppingBag, Star, Loader2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { mutate: addToCart, isPending: isAddingCart } = useAddToCart();
  const { data: wishlistData } = useWishlist();
  const { mutate: addToWishlist, isPending: isAddingWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: isRemovingWishlist } = useRemoveFromWishlist();

  const isWishlisted = Boolean(
    wishlistData?.items?.some((item) => item.productId === product.id)
  );

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    addToCart({ productId: product.id, quantity: 1 });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const isWishlistBusy = isAddingWishlist || isRemovingWishlist;

  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#f6f7f9] p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-600/10 dark:bg-zinc-900/90 dark:border dark:border-zinc-800"
      id={`product-card-${product.id}`}
    >
      {/* Top Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-white dark:bg-zinc-800/80 flex items-center justify-center p-4">
        <Link href={`/products/${product.id}`} className="relative block h-full w-full">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-300 dark:text-zinc-600">
              <ShoppingBag className="h-16 w-16 stroke-[1.2]" />
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
              -{discountPercentage}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="rounded-lg bg-zinc-800/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          disabled={isWishlistBusy}
          onClick={handleWishlistToggle}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-sm backdrop-blur-md transition-all hover:scale-110 active:scale-95 hover:text-emerald-600 dark:bg-zinc-900/90 dark:text-zinc-400 z-10"
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          id={`wishlist-toggle-btn-${product.id}`}
        >
          {isWishlistBusy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
          ) : (
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted ? "fill-emerald-600 text-emerald-600" : "text-zinc-600 dark:text-zinc-300"
              }`}
            />
          )}
        </button>

        {/* Quick Add to Cart Floating Button */}
        <button
          type="button"
          disabled={product.stock <= 0 || isAddingCart}
          onClick={handleAddToCart}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-emerald-700 disabled:opacity-50 z-10"
          aria-label="Add to cart"
        >
          {isAddingCart ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
        </button>
      </div>

      {/* Bottom Info Section (Clean Gocart Layout) */}
      <div className="mt-3 space-y-1.5 px-1 pb-1">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/products/${product.id}`}
            className="truncate font-semibold text-xs sm:text-sm text-zinc-800 transition-colors group-hover:text-emerald-600 dark:text-zinc-100 dark:group-hover:text-emerald-400"
          >
            {product.title}
          </Link>
          <span className="shrink-0 font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
            ${numericPrice.toFixed(0)}
          </span>
        </div>

        {/* Green Stars Rating Row */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  Boolean(product.reviewCount && product.reviewCount > 0 && i < Math.round(product.rating || 0))
                    ? "fill-emerald-500 text-emerald-500"
                    : "fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700"
                }`}
              />
            ))}
          </div>
          {product.reviewCount && product.reviewCount > 0 ? (
            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
              {product.rating?.toFixed(1)} ({product.reviewCount})
            </span>
          ) : (
            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
              (0)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
