"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
} from "@/features/cart/queries";
import { CartItem } from "@/types/cart";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
  RefreshCw,
  Loader2,
  Tag,
  Check,
} from "lucide-react";

function CartItemRow({ item }: { item: CartItem }) {
  const { mutate: updateQuantity, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();

  const maxStock = item.variant ? item.variant.stock : item.product.stock;

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity({ cartItemId: item.id, quantity: item.quantity - 1 });
    }
  };

  const handleIncrement = () => {
    if (item.quantity < maxStock) {
      updateQuantity({ cartItemId: item.id, quantity: item.quantity + 1 });
    }
  };

  const primaryImage =
    item.product.images && item.product.images.length > 0 ? item.product.images[0].url : null;

  return (
    <div
      className="flex flex-col gap-4 rounded-3xl bg-[#f6f7f9] p-4 transition-all dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
      id={`cart-item-${item.id}`}
    >
      {/* Product Image & Info */}
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white p-2 dark:bg-zinc-800 flex items-center justify-center shadow-xs">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={item.product.title}
              fill
              className="object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-300">
              <ShoppingBag className="h-8 w-8 stroke-[1.2]" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Link
            href={`/products/${item.product.id}`}
            className="font-semibold text-sm text-zinc-900 line-clamp-1 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
          >
            {item.product.title}
          </Link>

          {item.variant && (
            <span className="inline-block rounded-full bg-zinc-200/70 px-2.5 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {item.variant.name || "Default Option"}
            </span>
          )}

          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            ${item.price.toFixed(2)} each
          </p>
        </div>
      </div>

      {/* Quantity Stepper & Subtotal & Remove */}
      <div className="flex items-center justify-between gap-6 border-t border-zinc-200/60 pt-3 sm:border-t-0 sm:pt-0 dark:border-zinc-800">
        {/* Rounded Stepper */}
        <div className="flex items-center rounded-full bg-white px-1 py-0.5 shadow-xs dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700">
          <button
            type="button"
            disabled={item.quantity <= 1 || isUpdating}
            onClick={handleDecrement}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-700"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-zinc-900 dark:text-white">
            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mx-auto text-emerald-600" /> : item.quantity}
          </span>
          <button
            type="button"
            disabled={item.quantity >= maxStock || isUpdating}
            onClick={handleIncrement}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:text-zinc-300 dark:hover:bg-zinc-700"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right min-w-[70px]">
          <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
            ${item.subtotal.toFixed(2)}
          </span>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          disabled={isRemoving}
          onClick={() => removeItem(item.id)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          aria-label="Remove item"
          title="Remove item"
        >
          {isRemoving ? <Loader2 className="h-4 w-4 animate-spin text-red-500" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
      <div className="h-8 w-48 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function CartPageContent() {
  const { data: cart, isLoading, isError, refetch } = useCart();
  const { mutate: clearCart, isPending: isClearing } = useClearCart();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      setCouponApplied(true);
    }
  };

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 p-12 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-bold text-red-900 dark:text-red-300">
            Failed to Load Shopping Cart
          </h1>
          <p className="mt-1 max-w-sm text-xs text-red-600 dark:text-red-400">
            We couldn't connect to your shopping cart. Please check your internet connection.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Request
          </button>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  // Free shipping threshold ($50)
  const freeShippingThreshold = 50;
  const currentTotal = cart?.totalAmount || 0;
  const amountLeftForFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);
  const freeShippingProgress = Math.min(100, (currentTotal / freeShippingThreshold) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
              Shopping Cart
            </h1>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Review your items before proceeding to secure checkout
            </p>
          </div>
        </div>

        {!isEmpty && (
          <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {cart?.totalItems} {cart?.totalItems === 1 ? "Item" : "Items"}
          </span>
        )}
      </div>

      {isEmpty ? (
        /* Clean Empty State */
        <div className="flex flex-col items-center justify-center rounded-3xl bg-[#f6f7f9] p-16 text-center shadow-xs dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100/70 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <ShoppingBag className="h-10 w-10 stroke-[1.2]" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white">
            Your Cart is Empty
          </h2>
          <p className="mt-2 max-w-sm text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Explore thousands of products from independent verified vendors on Online-Bazar.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700"
          >
            <span>Start Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        /* Cart Content */
        <div className="space-y-6">
          {/* Free Shipping Progress Indicator Banner */}
          <div className="rounded-3xl bg-emerald-50 p-4 border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Truck className="h-4 w-4" />
                {amountLeftForFreeShipping === 0
                  ? "You unlocked FREE Shipping on this order!"
                  : `Add $${amountLeftForFreeShipping.toFixed(2)} more to qualify for FREE Shipping!`}
              </span>
              <span>{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-200/70 dark:bg-emerald-900">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column: Cart Items */}
            <div className="space-y-4 lg:col-span-2">
              <div className="space-y-3">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Continue Shopping</span>
                </Link>

                <button
                  type="button"
                  disabled={isClearing}
                  onClick={() => clearCart()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-600 shadow-xs hover:bg-red-50 hover:text-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  {isClearing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span>Clear Cart</span>
                </button>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div>
              <div className="sticky top-24 space-y-6 rounded-3xl bg-[#f6f7f9] p-6 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                  Order Summary
                </h3>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="relative flex items-center">
                    <Tag className="absolute left-3.5 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Promo code..."
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full rounded-full border border-zinc-200 bg-white py-2.5 pl-10 pr-20 text-xs font-medium text-zinc-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="absolute right-1 rounded-full bg-emerald-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> Coupon code applied!
                    </p>
                  )}
                </form>

                {/* Breakdown */}
                <div className="space-y-3 border-y border-zinc-200/80 py-4 text-xs dark:border-zinc-800">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400 font-medium">
                    <span>Subtotal</span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      ${cart?.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400 font-medium">
                    <span>Shipping</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {amountLeftForFreeShipping === 0 ? "FREE" : "Calculated at checkout"}
                    </span>
                  </div>

                  {couponApplied && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount (20%)</span>
                      <span>-${((cart?.totalAmount || 0) * 0.2).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex items-baseline justify-between text-base font-extrabold text-zinc-900 dark:text-white">
                  <span>Total Amount</span>
                  <span className="text-2xl text-emerald-600 dark:text-emerald-400">
                    $
                    {(
                      (cart?.totalAmount || 0) * (couponApplied ? 0.8 : 1)
                    ).toFixed(2)}
                  </span>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700"
                  id="proceed-checkout-btn"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {/* Guarantees */}
                <div className="space-y-2 rounded-2xl bg-white p-4 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 shadow-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>100% Safe & Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    <span>Fast Delivery Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-emerald-600" />
                    <span>Easy 7-Day Hassle-Free Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartPageContent />
    </ProtectedRoute>
  );
}
