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
import { Heart, ShoppingBag, Store, Star, Loader2 } from "lucide-react";

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
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900/90"
      id={`product-card-${product.id}`}
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <Link href={`/products/${product.id}`} className="relative block h-full w-full">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={product.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={priority}
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

          {/* Wishlist Toggle Button */}
          <button
            type="button"
            disabled={isWishlistBusy}
            onClick={handleWishlistToggle}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-md backdrop-blur-md transition-all hover:scale-110 active:scale-95 hover:text-red-500 dark:bg-zinc-900/90 dark:text-zinc-400"
            aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
            id={`wishlist-toggle-btn-${product.id}`}
          >
            {isWishlistBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
            ) : (
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isWishlisted ? "fill-red-500 text-red-500" : "text-zinc-600 dark:text-zinc-300"
                }`}
              />
            )}
          </button>
        </div>

        {/* Details Section */}
        <div className="mt-3 space-y-2 px-1">
          {/* Shop / Category Tag */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            {product.shop ? (
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <Store className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{product.shop.name}</span>
              </span>
            ) : product.category ? (
              <span className="truncate max-w-[120px]">{product.category.name}</span>
            ) : (
              <span>Marketplace</span>
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

          {/* Title */}
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

          {/* Add to Cart Action */}
          <button
            type="button"
            disabled={product.stock <= 0 || isAddingCart}
            onClick={handleAddToCart}
            title={product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-600"
            aria-label="Add to cart"
            id={`add-to-cart-btn-${product.id}`}
          >
            {isAddingCart ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
