"use client";

import { use, useState } from "react";
import { useVendorOrders, useUpdateVendorOrderStatusMutation } from "@/features/seller/dashboard-queries";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  MapPin,
  Loader2,
  AlertCircle,
} from "lucide-react";

function VendorOrderDetailContent({ vendorOrderId }: { vendorOrderId: string }) {
  const { data: vendorOrdersData, isLoading, refetch } = useVendorOrders();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateVendorOrderStatusMutation();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const vendorOrders: any[] = Array.isArray(vendorOrdersData)
    ? vendorOrdersData
    : vendorOrdersData?.orders || [];

  const vendorOrder = vendorOrders.find((o) => o.id === vendorOrderId);

  if (!vendorOrder) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center space-y-4">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        <h2 className="text-lg font-bold text-red-900">Vendor Order Not Found</h2>
        <p className="text-xs text-red-700 max-w-sm mx-auto">
          Could not locate vendor order ID {vendorOrderId}.
        </p>
        <Link
          href="/seller/orders"
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Orders</span>
        </Link>
      </div>
    );
  }

  const getAvailableNextStatuses = (currentStatus: string) => {
    switch (currentStatus) {
      case "PENDING":
        return ["PROCESSING"];
      case "PROCESSING":
        return ["SHIPPED"];
      case "SHIPPED":
        return ["DELIVERED"];
      default:
        return [];
    }
  };

  const paymentStatus = vendorOrder.order?.paymentStatus || "PENDING";
  const canFulfill = paymentStatus === "COMPLETED";
  const nextStatuses = canFulfill ? getAvailableNextStatuses(vendorOrder.status) : [];

  const handleStatusChange = (st: any) => {
    updateStatus({ id: vendorOrderId, status: st });
  };

  const address = vendorOrder.order?.shippingAddress;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/seller/orders"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Vendor Order #{vendorOrder.id.slice(0, 8)}</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Placed on {new Date(vendorOrder.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              vendorOrder.status === "DELIVERED"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : vendorOrder.status === "SHIPPED"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                : vendorOrder.status === "CANCELLED"
                ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
            }`}
          >
            {vendorOrder.status}
          </span>
        </div>
      </div>

      {/* Next Status Action Banner */}
      {paymentStatus === "FAILED" && (
        <div className="rounded-3xl border border-red-200 bg-red-50/60 p-6 dark:border-red-900/40 dark:bg-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-red-900 dark:text-red-300">
              Fulfillment blocked
            </h3>
            <p className="text-xs text-red-700 dark:text-red-400">
              Payment status is <strong>{paymentStatus}</strong>, so this order cannot move to Processing, Shipped, or Delivered.
            </p>
          </div>
        </div>
      )}

      {nextStatuses.length > 0 && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
              Fulfillment Status Action
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Current status is <strong>{vendorOrder.status}</strong>. Advance fulfillment to next stage when ready.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {nextStatuses.map((st) => (
              <button
                key={st}
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusChange(st)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Mark as {st}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Shipping Address</h3>
          </div>
          {address ? (
            <div className="text-xs space-y-1 text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <p className="font-bold text-zinc-900 dark:text-white">{address.fullName}</p>
              <p>{address.phone}</p>
              <p>{address.address}</p>
              <p>
                {address.city} {address.postalCode}
              </p>
              {address.country && <p>{address.country}</p>}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">No address details available</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <ShoppingBag className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Financial Summary</h3>
          </div>
          <div className="text-xs space-y-2">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Vendor Subtotal</span>
              <span className="font-bold text-zinc-900 dark:text-white">
                ${Number(vendorOrder.subTotal || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Payment Status</span>
              <span className={`font-semibold ${vendorOrder.order?.paymentStatus === "FAILED" ? "text-red-600" : paymentStatus === "PENDING" ? "text-amber-600" : "text-emerald-600"}`}>
                {paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Breakdown */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-100 pb-3 dark:border-zinc-800">
          Order Items Breakdown
        </h3>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {vendorOrder.items?.map((item: any) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                  {item.product?.images?.[0]?.url ? (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-5 w-5 text-zinc-400" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-zinc-900 dark:text-white">
                    {item.product?.title || "Product"}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    SKU: {item.product?.sku}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-zinc-900 dark:text-white">
                  ${Number(item.price).toFixed(2)}
                </p>
                <p className="text-[11px] text-zinc-500">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VendorOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <VendorOrderDetailContent vendorOrderId={resolvedParams.id} />;
}
