"use client";

import { useAdminOrders, useUpdateAdminOrderStatusMutation } from "@/features/admin/orders-queries";
import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  Package,
  Loader2,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data, isLoading } = useAdminOrders(page, 10, statusFilter || undefined);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateAdminOrderStatusMutation();

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  const handleStatusChange = (id: string, newStatus: any) => {
    setUpdatingId(id);
    updateStatus(
      { id, status: newStatus },
      {
        onSettled: () => setUpdatingId(null),
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-indigo-600" />
            <span>Platform Order Management</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Monitor all customer orders across all vendor shops and manage platform order status
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
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

      {/* Orders Table Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              No Orders Found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              No orders found matching status "{statusFilter || "All"}".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Order</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {orders.map((order) => {
                  const isThisUpdating = updatingId === order.id && isUpdating;

                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-4 px-6">
                        <span className="font-bold text-zinc-900 dark:text-white block">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-zinc-800 dark:text-zinc-200">
                        {order.shippingAddress?.fullName || "Customer"}
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-900 dark:text-white">
                        ${Number(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            order.paymentStatus === "FAILED"
                              ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              : order.paymentStatus === "PENDING"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}
                        >
                          {order.paymentStatus || "PENDING"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : order.status === "SHIPPED"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              : order.status === "CANCELLED"
                              ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            disabled={isThisUpdating || order.status === "CANCELLED"}
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-[11px] font-semibold text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                            title="View Order Details"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              Previous
            </button>
            <span className="text-zinc-500">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
