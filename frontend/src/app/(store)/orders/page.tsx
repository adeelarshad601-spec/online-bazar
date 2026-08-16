"use client";

import { useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCustomerOrders } from "@/features/orders/queries";
import { useCurrentUser } from "@/features/auth/queries";
import {
  Package,
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Store,
  ShieldCheck,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const upper = status.toUpperCase();

  if (upper === "DELIVERED" || upper === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>{upper}</span>
      </span>
    );
  }

  if (upper === "CANCELLED" || upper === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800 dark:bg-red-950 dark:text-red-300">
        <XCircle className="h-3.5 w-3.5" />
        <span>{upper}</span>
      </span>
    );
  }

  if (upper === "SHIPPED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
        <Truck className="h-3.5 w-3.5" />
        <span>{upper}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
      <Clock className="h-3.5 w-3.5" />
      <span>{upper}</span>
    </span>
  );
}

function OrdersSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6 sm:px-6 lg:px-8">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

function CustomerOrdersContent() {
  const { data: user } = useCurrentUser();
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useCustomerOrders(page, limit);

  if (user && user.role !== "CUSTOMER") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-12 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-300">
            Customer Orders Only
          </h2>
          <p className="text-xs text-amber-700 dark:text-amber-400 max-w-md mx-auto">
            Order history is designed for customer accounts. You are currently logged in as a <strong>{user.role}</strong>.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-700"
          >
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/50 p-12 dark:border-red-900/40 dark:bg-red-950/20 space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-red-900 dark:text-red-300">
            Failed to Load Orders
          </h2>
          <p className="text-xs text-red-600 dark:text-red-400 max-w-sm">
            We couldn't connect to your order history. Please check your network and try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry Request</span>
          </button>
        </div>
      </div>
    );
  }

  const { orders, pagination } = data;
  const isOrdersEmpty = orders.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
              My Orders
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Track, review, and manage your recent purchases
            </p>
          </div>
        </div>

        {!isOrdersEmpty && (
          <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {pagination.total} Orders Total
          </span>
        )}
      </div>

      {/* Orders Content */}
      {isOrdersEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-white p-16 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-zinc-900 dark:text-white">
            No Orders Found
          </h2>
          <p className="mt-2 max-w-sm text-xs text-zinc-500 dark:text-zinc-400">
            You haven't placed any orders yet. Explore our products and start shopping!
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
          >
            <span>Start Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {orders.map((order) => {
              const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              const totalItemCount =
                order.vendorOrders?.reduce(
                  (acc, vo) => acc + (vo.items?.reduce((itemAcc, item) => itemAcc + item.quantity, 0) || 0),
                  0
                ) || 0;

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-900 space-y-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-zinc-900 dark:text-white">
                          {order.orderNumber}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Placed on {orderDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left sm:text-right">
                        <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                          Total Amount
                        </span>
                        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Summary items/vendors breakdown */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-emerald-600" />
                      <span>{totalItemCount} {totalItemCount === 1 ? "Item" : "Items"}</span>
                      {order.vendorOrders && order.vendorOrders.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Store className="h-3.5 w-3.5 text-zinc-400" />
                            {order.vendorOrders.length} {order.vendorOrders.length === 1 ? "Shop" : "Shops"}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Payment: <strong>{order.payment?.method || "COD"}</strong> ({order.paymentStatus})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  aria-label="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CustomerOrdersPage() {
  return (
    <ProtectedRoute>
      <CustomerOrdersContent />
    </ProtectedRoute>
  );
}
