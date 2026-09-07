"use client";

import { use, useState } from "react";
import { useOrderDetails } from "@/features/orders/queries";
import { useUpdateAdminOrderStatusMutation, useProcessAdminOrderRefundMutation } from "@/features/admin/orders-queries";
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
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Tag,
  DollarSign,
} from "lucide-react";

function AdminOrderDetailContent({ orderId }: { orderId: string }) {
  const { data: order, isLoading, isError } = useOrderDetails(orderId);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateAdminOrderStatusMutation();
  const { mutate: processRefund, isPending: isRefunding } = useProcessAdminOrderRefundMutation();

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("Customer Return Request / Product Returned");
  const [deductShipping, setDeductShipping] = useState(true);

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

  const handleConfirmRefund = (e: React.FormEvent) => {
    e.preventDefault();
    processRefund(
      { id: orderId, reason: refundReason, deductShipping },
      {
        onSuccess: () => {
          setIsRefundModalOpen(false);
        },
      }
    );
  };

  const address = order.shippingAddress;
  const isRefunded = order.paymentStatus === "REFUNDED";
  const shippingCharge = (order as any).shippingAmount ?? 0;
  const subtotalVal = (order as any).subtotal ?? Number(order.totalAmount || 0);
  const discountVal = (order as any).discount ?? 0;
  const totalPaid = Number(order.totalAmount || 0);

  // Net Refund Amount: merchandise subtotal - discount (deducting delivery charges)
  const netRefundAmount = deductShipping ? Math.max(0, totalPaid - shippingCharge) : totalPaid;

  return (
    <div className="space-y-8 max-w-5xl pb-12">
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                Order #{order.orderNumber}
              </h1>
              {isRefunded && (
                <span className="rounded-full bg-red-100 px-3 py-0.5 text-[10px] font-black uppercase text-red-800 dark:bg-red-950 dark:text-red-300">
                  Refunded
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Change Status & Refund Action */}
        <div className="flex items-center gap-3 flex-wrap">
          {!isRefunded && (
            <button
              type="button"
              onClick={() => setIsRefundModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Return & Refund</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500">Status:</span>
            <select
              disabled={isUpdating || isRefunded}
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-bold text-zinc-800 focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            >
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
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
              <p>{address.address} {address.unit ? `(${address.unit})` : ""}</p>
              <p>
                {address.city} {address.state ? `, ${address.state}` : ""} {address.postalCode}
              </p>
              {address.country && <p className="font-semibold">{address.country}</p>}
            </div>
          ) : (
            <p className="text-xs text-zinc-400">No address details available</p>
          )}
        </div>

        {/* Financial & Payment Summary */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Financial & Refund Summary</h3>
          </div>

          <div className="text-xs space-y-2">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Payment Status</span>
              <span className={`font-bold ${isRefunded ? "text-red-600" : "text-emerald-600"}`}>
                {order.paymentStatus || "COMPLETED"}
              </span>
            </div>

            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Merchandise Subtotal:</span>
              <span className="font-bold text-zinc-900 dark:text-white">${subtotalVal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Delivery Charge (Shipping):</span>
              <span className="font-bold text-zinc-900 dark:text-white">${shippingCharge.toFixed(2)}</span>
            </div>

            {discountVal > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount Applied:</span>
                <span>-${discountVal.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 flex justify-between items-baseline">
              <span className="font-bold text-zinc-900 dark:text-white">Total Customer Paid:</span>
              <span className="font-extrabold text-base text-zinc-900 dark:text-white">
                ${totalPaid.toFixed(2)}
              </span>
            </div>

            {isRefunded && (
              <div className="mt-3 rounded-2xl bg-red-50/80 p-3 dark:bg-red-950/40 border border-red-200 dark:border-red-900 space-y-1">
                <div className="flex justify-between font-bold text-red-900 dark:text-red-300">
                  <span>Non-Refundable Delivery Charge:</span>
                  <span>-${shippingCharge.toFixed(2)} (Deducted)</span>
                </div>
                <div className="flex justify-between font-black text-sm text-red-700 dark:text-red-300">
                  <span>Net Refund Issued:</span>
                  <span>${Math.max(0, totalPaid - shippingCharge).toFixed(2)}</span>
                </div>
              </div>
            )}
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
              <div className="text-right">
                <span className="font-bold text-xs text-zinc-900 dark:text-white block">
                  Merchandise Subtotal: ${Number(vo.subTotal).toFixed(2)}
                </span>
                {vo.shippingAmount > 0 && (
                  <span className="text-[11px] text-zinc-500 font-medium block">
                    Vendor Shipping: ${Number(vo.shippingAmount).toFixed(2)}
                  </span>
                )}
              </div>
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

      {/* Return & Refund Action Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <RotateCcw className="h-5 w-5" />
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                  Process Return & Order Refund
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRefundModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRefund} className="space-y-4">
              {/* Refund Breakdown Preview */}
              <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2 text-xs">
                <p className="font-extrabold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-700 pb-2">
                  Marketplace Refund Calculation
                </p>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Customer Paid Total:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">${totalPaid.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-amber-700 dark:text-amber-400 font-medium">
                  <span>Delivery Charges (Non-Refundable):</span>
                  <span>{deductShipping ? `-$${shippingCharge.toFixed(2)} (Deducted)` : "$0.00"}</span>
                </div>

                <div className="flex justify-between font-black text-sm text-emerald-600 dark:text-emerald-400 pt-1 border-t border-zinc-200 dark:border-zinc-700">
                  <span>Net Refund to Customer:</span>
                  <span>${netRefundAmount.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Reason for Return / Refund
                </label>
                <input
                  type="text"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deductShipping}
                    onChange={(e) => setDeductShipping(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Deduct Delivery Charges (${shippingCharge.toFixed(2)}) from customer refund</span>
                </label>
                <p className="text-[11px] text-zinc-500 mt-1 ml-6">
                  Standard real-world policy: Original delivery charges are retained by carrier and subtracted from item return refunds.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isRefunding}
                  className="px-6 py-2.5 rounded-2xl bg-amber-600 text-xs font-extrabold text-white shadow-md hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isRefunding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing Refund...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      <span>Confirm Refund (${netRefundAmount.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <AdminOrderDetailContent orderId={resolvedParams.id} />;
}
