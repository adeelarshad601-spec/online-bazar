"use client";

import { useVendorOrders, useUpdateVendorOrderStatusMutation } from "@/features/seller/dashboard-queries";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Loader2,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function SellerOrdersPage() {
  const searchParams = useSearchParams();
  const [selectedStatus, setSelectedStatus] = useState<string>(() => searchParams.get("status") || "");
  const { data: vendorOrdersData, isLoading } = useVendorOrders(selectedStatus || undefined);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateVendorOrderStatusMutation();

  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const handleStatusChange = (id: string, newStatus: any) => {
    setUpdatingId(id);
    updateStatus(
      { id, status: newStatus },
      {
        onSettled: () => setUpdatingId(null),
      }
    );
  };

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-emerald-600" />
            <span>Vendor Orders</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Fulfill and manage fulfillment status for orders containing your products
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {vendorOrders.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
            <ShoppingBag className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              No Orders Found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              {selectedStatus
                ? `No orders matching status "${selectedStatus}".`
                : "You don't have any vendor orders assigned to your shop yet."}
            </p>
          </div>
        ) : (
          vendorOrders.map((vendorOrder) => {
            const nextStatuses = getAvailableNextStatuses(vendorOrder.status);
            const isThisUpdating = updatingId === vendorOrder.id && isUpdating;

            return (
              <div
                key={vendorOrder.id}
                className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
                        Vendor Order #{vendorOrder.id.slice(0, 8)}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Placed on {new Date(vendorOrder.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-base text-zinc-900 dark:text-white">
                      ${Number(vendorOrder.subTotal || 0).toFixed(2)}
                    </span>
                    <Link
                      href={`/seller/orders/${vendorOrder.id}`}
                      className="inline-flex items-center gap-1 rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      <span>Details</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-2">
                  {vendorOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs">
                      <div className="h-8 w-8 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                        {item.product?.images?.[0]?.url ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4 text-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 dark:text-white truncate">
                          {item.product?.title || "Product"}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status action */}
                {nextStatuses.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                    <span className="text-[11px] font-semibold text-zinc-500">Advance Status:</span>
                    {nextStatuses.map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={isThisUpdating}
                        onClick={() => handleStatusChange(vendorOrder.id, st)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {isThisUpdating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>Mark as {st}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
