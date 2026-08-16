"use client";

import { use, useState } from "react";
import { useOrderDetails } from "@/features/orders/queries";
import { useUpdateAdminOrderStatusMutation } from "@/features/admin/orders-queries";
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
  CreditCard,
  Store,
} from "lucide-react";

function AdminOrderDetailContent({ orderId }: { orderId: string }) {
  const { data: order, isLoading, isError } = useOrderDetails(orderId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateAdminOrderStatusMutation();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center space-y-4">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        <h2 className="text-lg font-bold text-red-900">Order Not Found</h2>
        <p className="text-xs text-red-700 max-w-sm mx-auto">
          Could not locate order ID {orderId}.
        </p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Orders</span>
        </Link>
      </div>
    );
  }

  const handleStatusChange = (st: any) => {
    updateStatus({ id: orderId, status: st });
  };

  const address = order.shippingAddress;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Change Status Control */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-500">Update Status:</span>
          <select
            disabled={isUpdating}
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-bold text-zinc-800 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <MapPin className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Customer Shipping Details</h3>
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

        {/* Financial & Payment Summary */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Payment & Total</h3>
          </div>
          <div className="text-xs space-y-2">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Payment Status</span>
              <span className="font-bold text-emerald-600">
                {order.paymentStatus || "COMPLETED (COD)"}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Order Grand Total</span>
              <span className="font-extrabold text-base text-zinc-900 dark:text-white">
                ${Number(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Orders Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Vendor Order Sub-orders ({order.vendorOrders?.length || 0})
        </h2>

        {order.vendorOrders?.map((vo: any) => (
          <div
            key={vo.id}
            className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-teal-600" />
                <span className="font-bold text-sm text-zinc-900 dark:text-white">
                  Shop: {vo.shop?.name}
                </span>
                <span className="text-xs text-zinc-400">(Vendor Order #{vo.id.slice(0, 8)})</span>
              </div>
              <span className="font-bold text-xs text-zinc-900 dark:text-white">
                Subtotal: ${Number(vo.subTotal).toFixed(2)}
              </span>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {vo.items?.map((item: any) => (
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
        ))}
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <AdminOrderDetailContent orderId={resolvedParams.id} />;
}
