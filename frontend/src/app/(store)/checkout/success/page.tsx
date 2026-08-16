"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useOrderDetails } from "@/features/orders/queries";
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Home,
  MapPin,
  CreditCard,
  Package,
  Store,
  Calendar,
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
  Truck,
} from "lucide-react";

function ConfirmationStepper() {
  const steps = [
    { id: 1, name: "Cart", status: "completed" },
    { id: 2, name: "Shipping", status: "completed" },
    { id: 3, name: "Review", status: "completed" },
    { id: 4, name: "Confirmation", status: "completed" },
  ];

  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="flex items-center justify-between gap-2 sm:gap-4">
        {steps.map((step, idx) => (
          <li key={step.id} className="flex-1">
            <div className="flex flex-col items-center">
              <div className="flex items-center w-full">
                {idx > 0 && <div className="h-0.5 w-full bg-emerald-600" />}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold ring-4 ring-emerald-100 dark:ring-emerald-950">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                {idx < steps.length - 1 && <div className="h-0.5 w-full bg-emerald-600" />}
              </div>
              <span className="mt-2 text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 text-center">
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function SuccessSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 space-y-8 sm:px-6 lg:px-8">
      <div className="h-10 w-48 mx-auto animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-48 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-64 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function SuccessContentInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useOrderDetails(orderId);

  if (!orderId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-amber-200 bg-amber-50/50 p-12 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/20">
          <AlertCircle className="h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-xl font-bold text-amber-900 dark:text-amber-300">
            Missing Order Identifier
          </h2>
          <p className="mt-2 max-w-sm text-xs text-amber-600 dark:text-amber-400">
            No order reference was provided in the link. Please check your order history or return to store.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Browse Products</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <SuccessSkeleton />;
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 p-12 shadow-xs dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-bold text-red-900 dark:text-red-300">
            Unable to Load Order Details
          </h2>
          <p className="mt-2 max-w-sm text-xs text-red-600 dark:text-red-400">
            We encountered an issue retrieving your order details. Please check your network or try again.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Load</span>
            </button>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const paymentMethodName = order.payment?.method === "COD" ? "Cash on Delivery (COD)" : order.payment?.method || "Cash on Delivery (COD)";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-8 sm:px-6 lg:px-8">
      {/* Confirmation Progress Stepper */}
      <ConfirmationStepper />

      {/* Hero Success Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-linear-to-b from-emerald-50/80 to-white p-8 text-center shadow-xs dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-zinc-900">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 animate-bounce-short">
          <CheckCircle2 className="h-10 w-10 stroke-[2.2]" />
        </div>

        <div className="mt-6 space-y-2">
          <span className="inline-block rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
            Order Placed Successfully
          </span>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
            Thank You For Your Order!
          </h1>
          <p className="mx-auto max-w-md text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Your order has been registered and sent to our vendor network for processing and dispatch.
          </p>
        </div>

        {/* Key Attributes Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 font-semibold text-zinc-700 shadow-xs dark:bg-zinc-800 dark:text-zinc-300">
            <Package className="h-4 w-4 text-emerald-600" />
            <span>Order #: <strong>{order.orderNumber}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 font-semibold text-zinc-700 shadow-xs dark:bg-zinc-800 dark:text-zinc-300">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span>Date: {orderDate}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 font-semibold text-zinc-700 shadow-xs dark:bg-zinc-800 dark:text-zinc-300">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span>Status: <strong className="text-amber-600 dark:text-amber-400 uppercase">{order.status}</strong></span>
          </div>
        </div>
      </div>

      {/* Grid: Payment Info & Shipping Address */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Payment Information Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Payment Information
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Payment status & instruction
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-500 dark:text-zinc-400">Payment Method</span>
              <span className="font-bold text-zinc-900 dark:text-white">
                {paymentMethodName}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-500 dark:text-zinc-400">Payment Status</span>
              <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {order.paymentStatus || order.payment?.status || "PENDING"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-zinc-100 pt-2 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Total Amount</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* COD Special Instructions Box */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Cash on Delivery Required</span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
              No online payment is required now. Please prepare <strong>${order.totalAmount.toFixed(2)}</strong> in cash to hand over to the courier upon parcel delivery.
            </p>
          </div>
        </div>

        {/* Shipping Address Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Delivery Address
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Recipient details for shipment
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
            <p className="font-bold text-sm text-zinc-900 dark:text-white">
              {order.shippingAddress?.fullName}
            </p>
            <p className="text-zinc-500 dark:text-zinc-400">
              📞 {order.shippingAddress?.phone}
            </p>
            <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{order.shippingAddress?.country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Products Section */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Ordered Products
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Summary of items included in this order
              </p>
            </div>
          </div>
        </div>

        {/* Vendor Order Groups */}
        {order.vendorOrders && order.vendorOrders.length > 0 ? (
          <div className="space-y-6">
            {order.vendorOrders.map((vendorOrder) => (
              <div
                key={vendorOrder.id}
                className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30 space-y-3"
              >
                {vendorOrder.shop && (
                  <div className="flex items-center gap-2 border-b border-zinc-200/60 pb-2 dark:border-zinc-700/60 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                    <Store className="h-4 w-4 text-emerald-600" />
                    <span>Vendor: {vendorOrder.shop.name}</span>
                    <span className="ml-auto rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 uppercase">
                      Subtotal: ${vendorOrder.subTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="divide-y divide-zinc-200/40 dark:divide-zinc-700/40">
                  {vendorOrder.items.map((item) => {
                    const primaryImage =
                      item.product?.images && item.product.images.length > 0
                        ? item.product.images[0].url
                        : null;

                    return (
                      <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800">
                          {primaryImage ? (
                            <Image
                              src={primaryImage}
                              alt={item.product?.title || "Product"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-zinc-400">
                              <ShoppingBag className="h-5 w-5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-0.5">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                            {item.product?.title || "Product Item"}
                          </h4>
                          {item.variant && (
                            <span className="inline-block rounded-md bg-zinc-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                              Option: {item.variant.name || "Default"}
                            </span>
                          )}
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">Order item details processed.</p>
        )}

        {/* Final Calculation Recap */}
        <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Shipping Fee</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-zinc-900 dark:text-white pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
            <span>Grand Total</span>
            <span className="text-xl text-emerald-600 dark:text-emerald-400">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href={`/orders/${order.id}`}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700"
        >
          <Package className="h-4 w-4" />
          <span>View Order Details</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/products"
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-xs font-bold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Continue Shopping</span>
        </Link>
        <Link
          href="/"
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-xs font-bold text-zinc-700 shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Home className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Guarantees */}
      <div className="flex items-center justify-center gap-6 text-[11px] font-semibold text-zinc-400 pt-2">
        <div className="flex items-center gap-1.5">
          <Truck className="h-4 w-4 text-emerald-600" />
          <span>Fast Delivery</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Verified Purchase</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<SuccessSkeleton />}>
        <SuccessContentInner />
      </Suspense>
    </ProtectedRoute>
  );
}
