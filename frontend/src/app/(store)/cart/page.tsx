"use client";

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
      className="flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs transition-all dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between"
      id={`cart-item-${item.id}`}
    >
      {/* Product Image & Info */}
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={item.product.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400">
              <ShoppingBag className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <Link
            href={`/products/${item.product.id}`}
            className="font-bold text-sm text-zinc-900 line-clamp-1 hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
          >
            {item.product.title}
          </Link>

          {item.variant && (
            <span className="inline-block rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              Option: {item.variant.name || "Default"}
            </span>
          )}

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            ${item.price.toFixed(2)} each
          </p>
        </div>
      </div>

      {/* Quantity & Subtotal & Remove */}
      <div className="flex items-center justify-between gap-4 border-t border-zinc-100 pt-3 sm:border-t-0 sm:pt-0 dark:border-zinc-800">
        {/* Stepper */}
        <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
          <button
            type="button"
            disabled={item.quantity <= 1 || isUpdating}
            onClick={handleDecrement}
            className="flex h-8 w-8 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-200 disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-700"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-xs font-bold text-zinc-900 dark:text-white">
            {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mx-auto text-emerald-600" /> : item.quantity}
          </span>
          <button
            type="button"
            disabled={item.quantity >= maxStock || isUpdating}
            onClick={handleIncrement}
            className="flex h-8 w-8 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-200 disabled:opacity-40 dark:text-zinc-300 dark:hover:bg-zinc-700"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right">
          <span className="text-sm font-extrabold text-zinc-900 dark:text-white">
            ${item.subtotal.toFixed(2)}
          </span>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          disabled={isRemoving}
          onClick={() => removeItem(item.id)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
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
      <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function CartPageContent() {
  const { data: cart, isLoading, isError, refetch } = useCart();
  const { mutate: clearCart, isPending: isClearing } = useClearCart();

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 p-12 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-bold text-red-900 dark:text-red-300">
            Failed to Load Cart
          </h1>
          <p className="mt-1 max-w-sm text-xs text-red-600 dark:text-red-400">
            We couldn't connect to your shopping cart. Please check your connection and try again.
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

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
              Shopping Cart
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Review items before proceeding to checkout
            </p>
          </div>
        </div>

        {!isEmpty && (
          <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {cart?.totalItems} Items
          </span>
        )}
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white p-16 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white">
            Your Shopping Cart is Empty
          </h2>
          <p className="mt-2 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
            Explore millions of high-quality products from verified independent vendors.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
          >
            <span>Browse Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        /* Cart Content: Items + Summary */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Cart Items List */}
          <div className="space-y-4 lg:col-span-2">
            <div className="space-y-3">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-600 shadow-xs hover:bg-red-50 hover:text-red-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
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
            <div className="sticky top-24 space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Order Summary
              </h3>

              <div className="space-y-3 border-y border-zinc-100 py-4 text-xs dark:border-zinc-800">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Subtotal ({cart?.totalItems} items)</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    ${cart?.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Calculated at Checkout
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Taxes</span>
                  <span className="font-semibold text-zinc-500">Calculated at Checkout</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between text-base font-extrabold text-zinc-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-2xl text-emerald-600 dark:text-emerald-400">
                  ${cart?.totalAmount.toFixed(2)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700"
                id="proceed-checkout-btn"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="space-y-2 rounded-2xl bg-zinc-50 p-4 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>100% Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-emerald-600" />
                  <span>Fast Nationwide Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-emerald-600" />
                  <span>Easy 7-Day Returns</span>
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
