"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useOrderDetails, useCancelOrderMutation } from "@/features/orders/queries";
import {
  Package,
  ShoppingBag,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  CreditCard,
  Store,
  Calendar,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Ban,
  Loader2,
} from "lucide-react";

function OrderStatusTimeline({ currentStatus }: { currentStatus: string }) {
  const upper = currentStatus.toUpperCase();

  if (upper === "CANCELLED") {
    return (
      <div className="rounded-2xl bg-red-50 p-4 border border-red-200 dark:bg-red-950/30 dark:border-red-900/40 text-center space-y-1">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-red-800 dark:text-red-300">
          <XCircle className="h-5 w-5" />
          <span>Order Cancelled</span>
        </div>
        <p className="text-xs text-red-600 dark:text-red-400">
          This order has been cancelled and will not be processed further.
        </p>
      </div>
    );
  }

  const timelineSteps = [
    { key: "PENDING", label: "Order Placed" },
    { key: "PROCESSING", label: "Processing" },
    { key: "SHIPPED", label: "Shipped" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const statusOrder = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentIndex = statusOrder.indexOf(upper) >= 0 ? statusOrder.indexOf(upper) : 0;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
        Order Status Progress
      </h3>
      <div className="flex items-center justify-between gap-2">
        {timelineSteps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                {idx > 0 && (
                  <div
                    className={`h-0.5 w-full transition-colors ${
                      idx <= currentIndex ? "bg-emerald-600" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  />
                )}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                  } ${isCurrent ? "ring-4 ring-emerald-100 dark:ring-emerald-950" : ""}`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>
                {idx < timelineSteps.length - 1 && (
                  <div
                    className={`h-0.5 w-full transition-colors ${
                      idx < currentIndex ? "bg-emerald-600" : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  />
                )}
              </div>
              <span
                className={`mt-2 text-[10px] sm:text-xs font-bold text-center ${
                  isCurrent
                    ? "text-emerald-600 dark:text-emerald-400"
                    : isCompleted
                    ? "text-zinc-800 dark:text-zinc-200"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6 sm:px-6 lg:px-8">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-32 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-64 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

function OrderDetailsContent({ orderId }: { orderId: string }) {
  const { data: order, isLoading, isError, refetch } = useOrderDetails(orderId);
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrderMutation();
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 p-12 dark:border-red-900/40 dark:bg-red-950/20 space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-red-900 dark:text-red-300">
            Order Details Unavailable
          </h2>
          <p className="text-xs text-red-600 dark:text-red-400 max-w-sm">
            We couldn't retrieve the details for order ID <strong>{orderId}</strong>.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Load</span>
            </button>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Orders</span>
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
    hour: "2-digit",
    minute: "2-digit",
  });

  const isCancellable = order.status === "PENDING";

  const handleConfirmCancel = () => {
    cancelOrder(order.id, {
      onSuccess: () => {
        setShowCancelPrompt(false);
      },
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:bg-zinc-800 dark:text-zinc-300"
              aria-label="Back to orders"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>Order #{order.orderNumber}</span>
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Placed on {orderDate}
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation Button (Only shown when order.status === "PENDING") */}
        {isCancellable && !showCancelPrompt && (
          <button
            type="button"
            disabled={isCancelling}
            onClick={() => setShowCancelPrompt(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 shadow-xs hover:bg-red-100 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/80"
          >
            <Ban className="h-4 w-4 text-red-600" />
            <span>Cancel Order</span>
          </button>
        )}
      </div>

      {/* Inline Cancellation Confirmation Prompt */}
      {showCancelPrompt && isCancellable && (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50/80 p-5 shadow-sm dark:border-red-900/60 dark:bg-red-950/40 animate-fade-in space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-300">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
                Are you sure you want to cancel this order?
              </h4>
              <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                Order cancellation is only allowed while the order is in <strong>PENDING</strong> status. Once cancelled, this action cannot be undone and items will not be shipped.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => setShowCancelPrompt(false)}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-bold text-zinc-700 shadow-xs hover:bg-zinc-50 focus:outline-hidden focus:ring-2 focus:ring-zinc-400/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Keep Order
            </button>
            <button
              type="button"
              disabled={isCancelling}
              onClick={handleConfirmCancel}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <Ban className="h-3.5 w-3.5" />
                  <span>Confirm Cancellation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Progress Timeline */}
      <OrderStatusTimeline currentStatus={order.status} />

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Payment Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Payment Info
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Method & status details
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-500 dark:text-zinc-400">Payment Method</span>
              <span className="font-bold text-zinc-900 dark:text-white">
                {order.payment?.method === "COD" ? "Cash on Delivery (COD)" : order.payment?.method || "Cash on Delivery"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-zinc-500 dark:text-zinc-400">Payment Status</span>
              <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {order.paymentStatus || order.payment?.status || "PENDING"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-zinc-100 pt-2 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Grand Total</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {order.payment?.method === "COD" && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 text-[11px] text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Cash on Delivery Notice</span>
              </div>
              <p>
                Amount of <strong>${order.totalAmount.toFixed(2)}</strong> is payable in cash upon parcel delivery.
              </p>
            </div>
          )}
        </div>

        {/* Shipping Address Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Shipping Address
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Delivery destination
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

      {/* Products & Vendor Breakdown */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Ordered Items
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Products included in this shipment
            </p>
          </div>
        </div>

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
                    <span>Shop: {vendorOrder.shop.name}</span>
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
                            {item.product?.title || "Product"}
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

        <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Shipping</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">FREE</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-zinc-900 dark:text-white pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
            <span>Total Amount</span>
            <span className="text-xl text-emerald-600 dark:text-emerald-400">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <ProtectedRoute>
      <OrderDetailsContent orderId={resolvedParams.id} />
    </ProtectedRoute>
  );
}
