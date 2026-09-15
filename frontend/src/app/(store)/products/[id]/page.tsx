"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Store,
  Star,
  Loader2,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useProductDetails } from "@/features/products/queries";
import { useCurrentUser } from "@/features/auth/queries";
import { useAddToCart } from "@/features/cart/queries";
import {
  useCheckWishlist,
  useAddToWishlist,
  useRemoveFromWishlist,
} from "@/features/wishlist/queries";
import { ProductVariant } from "@/types/product";
import ProductDetailSkeleton from "@/components/product/ProductDetailSkeleton";
import ProductGallery from "@/components/product/ProductGallery";
import VariantSelector from "@/components/product/VariantSelector";
import QuantitySelector from "@/components/product/QuantitySelector";
import ProductReviewsSection from "@/components/review/ProductReviewsSection";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: product, isLoading, isError } = useProductDetails(id);
  const { data: user } = useCurrentUser();
  const { mutate: addToCart, isPending: isAddingCart, isSuccess: isAddToCartSuccess } = useAddToCart();
  const { data: wishlistCheck } = useCheckWishlist(id);
  const { mutate: addToWishlist, isPending: isAddingWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: isRemovingWishlist } = useRemoveFromWishlist();

  const isWishlisted = Boolean(wishlistCheck?.isWishlisted);
  const isWishlistBusy = isAddingWishlist || isRemovingWishlist;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product?.variants || product.variants.length === 0) {
      setSelectedVariant(null);
      return;
    }

    const firstAvailableVariant = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];

    setSelectedVariant((currentVariant) => {
      if (currentVariant && product.variants?.some((variant) => variant.id === currentVariant.id)) {
        return currentVariant;
      }

      return firstAvailableVariant;
    });
  }, [product]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 p-12 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-bold text-red-900 dark:text-red-300">
            Product Not Found
          </h1>
          <p className="mt-1 max-w-sm text-xs text-red-600 dark:text-red-400">
            The product you are looking for may have been removed or is currently unavailable.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Products
          </Link>
        </div>
      </div>
    );
  }

  // Calculate pricing based on selected variant or base product safely
  const rawActivePrice = selectedVariant?.price ?? product.price;
  const activePrice = typeof rawActivePrice === "number" ? rawActivePrice : parseFloat(String(rawActivePrice || 0));
  const activeStock = selectedVariant?.stock ?? product.stock;

  const comparePrice = product.compareAtPrice
    ? typeof product.compareAtPrice === "number"
      ? product.compareAtPrice
      : parseFloat(String(product.compareAtPrice))
    : null;

  const hasDiscount = Boolean(comparePrice && comparePrice > activePrice);
  const discountPercentage = hasDiscount
    ? Math.round(((comparePrice! - activePrice) / comparePrice!) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
    });
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    const queryParams = new URLSearchParams({
      buyNow: "true",
      productId: product.id,
      quantity: String(quantity),
    });

    if (selectedVariant?.id) {
      queryParams.set("variantId", selectedVariant.id);
    }

    router.push(`/checkout?${queryParams.toString()}`);
  };

  const handleWishlistToggle = () => {
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-10 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-emerald-600">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <Link href="/products" className="hover:text-emerald-600">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            <Link href={`/categories/${product.category.id}`} className="hover:text-emerald-600">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <span className="truncate max-w-[200px] font-semibold text-zinc-900 dark:text-white">
          {product.title}
        </span>
      </nav>

      {/* Main 2-Column Product Detail Layout */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left Column: Image Gallery */}
        <div>
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Right Column: Product Information & Controls */}
        <div className="space-y-6">
          {/* Shop Badge & Rating Summary */}
          <div className="flex items-center justify-between">
            {product.shop ? (
              <Link
                href={`/shops/${product.shop.id}`}
                className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950 dark:text-emerald-300"
              >
                <Store className="h-3.5 w-3.5" />
                <span>{product.shop.name}</span>
              </Link>
            ) : (
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                Verified Merchant
              </span>
            )}

            {product.reviewCount ? (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  {product.rating?.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-400">({product.reviewCount} reviews)</span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-zinc-400">No reviews yet</span>
            )}
          </div>

          {/* Title & SKU */}
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
              {product.title}
            </h1>
            <p className="text-xs text-zinc-400">
              SKU: <code className="font-mono text-zinc-600 dark:text-zinc-300">{product.sku}</code>
            </p>
          </div>

          {/* Price & Discount display */}
          <div className="flex items-baseline gap-3 border-y border-zinc-100 py-4 dark:border-zinc-800">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              ${activePrice.toFixed(2)}
            </span>
            {hasDiscount && comparePrice && (
              <>
                <span className="text-base text-zinc-400 line-through">
                  ${comparePrice.toFixed(2)}
                </span>
                <span className="rounded-lg bg-red-600 px-2 py-0.5 text-xs font-extrabold uppercase text-white shadow-xs">
                  Save {discountPercentage}%
                </span>
              </>
            )}
          </div>

          {/* Stock Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${activeStock > 0 ? "bg-emerald-500" : "bg-red-500"
                }`}
            />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {activeStock > 0 ? `In Stock (${activeStock} units available)` : "Out of Stock"}
            </span>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedVariantId={selectedVariant?.id}
              onSelectVariant={(variant) => setSelectedVariant(variant)}
            />
          )}

          {/* Quantity Selector */}
          <QuantitySelector
            quantity={quantity}
            maxStock={activeStock}
            onQuantityChange={(qty) => setQuantity(qty)}
          />

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Add to Cart Button */}
            <button
              type="button"
              disabled={activeStock <= 0 || isAddingCart}
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-colors hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              id="product-add-to-cart-btn"
            >
              {isAddingCart ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
              <span>Add to Cart</span>
            </button>

            {/* Buy Now Button */}
            <button
              type="button"
              disabled={activeStock <= 0 || isAddingCart}
              onClick={handleBuyNow}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              id="product-buy-now-btn"
            >
              <span>Buy Now</span>
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              disabled={isWishlistBusy}
              onClick={handleWishlistToggle}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all ${isWishlisted
                  ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-red-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                }`}
              aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              id="product-wishlist-btn"
            >
              {isWishlistBusy ? (
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
              ) : (
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              )}
            </button>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="flex flex-col items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              <Truck className="h-4 w-4 text-emerald-600" />
              <span>Fast Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Buyer Protection</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              <RotateCcw className="h-4 w-4 text-emerald-600" />
              <span>7-Day Return</span>
            </div>
          </div>

          {/* Seller / Shop Info Card */}
          {product.shop && (
            <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-teal-100 font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  {product.shop.logo ? (
                    <Image src={product.shop.logo} alt={product.shop.name} fill className="object-cover" />
                  ) : (
                    <Store className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                    {product.shop.name}
                  </h4>
                  <p className="text-[11px] text-zinc-500">Verified Marketplace Seller</p>
                </div>
              </div>

              <Link
                href={`/shops/${product.shop.id}`}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                id="view-shop-btn"
              >
                View Shop
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3 border-t border-zinc-200 pt-10 dark:border-zinc-800">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Product Overview</h3>
        <p className="text-xs leading-relaxed text-zinc-600 whitespace-pre-line dark:text-zinc-300">
          {product.description}
        </p>
      </div>

      {/* Product Reviews & Ratings Section */}
      <ProductReviewsSection productId={product.id} productTitle={product.title} />
    </div>
  );
}
