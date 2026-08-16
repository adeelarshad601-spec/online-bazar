"use client";

import { useAdminStats } from "@/features/admin/dashboard-queries";
import { useAdminSellers } from "@/features/admin/sellers-queries";
import { useAdminOrders } from "@/features/admin/orders-queries";
import Link from "next/link";
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ShieldAlert,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: isStatsLoading } = useAdminStats();
  const { data: pendingSellersData, isLoading: isSellersLoading } = useAdminSellers("PENDING");
  const { data: recentOrdersData, isLoading: isOrdersLoading } = useAdminOrders(1, 5);

  const isLoading = isStatsLoading || isSellersLoading || isOrdersLoading;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const pendingSellers = pendingSellersData || [];
  const recentOrders = recentOrdersData?.orders || [];

  const totalSales = Number(stats?.sales?.total || 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="h-7 w-7 text-indigo-600" />
          <span>Platform Overview</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          System-wide performance, seller requests, catalog metrics & sales
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Platform Revenue */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Gross Platform Sales</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
            ${totalSales.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Completed Orders
          </span>
        </div>

        {/* Total Users & Sellers */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Registered Users</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
            {stats?.users?.total || 0}
          </p>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {stats?.users?.sellers || 0} Sellers
          </span>
        </div>

        {/* Total Products */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Products</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
            {stats?.products?.total || 0}
          </p>
          <Link href="/admin/products" className="text-[11px] font-semibold text-purple-600 hover:underline">
            Manage Catalog
          </Link>
        </div>

        {/* Pending Sellers */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Pending Seller Apps</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
            {stats?.users?.pendingSellers || 0}
          </p>
          <Link href="/admin/sellers" className="text-[11px] font-semibold text-amber-600 hover:underline">
            Review Applications
          </Link>
        </div>
      </div>

      {/* Two Column Grid for Pending Actions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Sellers Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Pending Merchant Applications
            </h2>
            <Link href="/admin/sellers" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          {pendingSellers.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No pending seller applications awaiting approval.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {pendingSellers.slice(0, 4).map((seller) => (
                <div key={seller.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">{seller.name}</p>
                    <p className="text-[11px] text-zinc-500">{seller.email}</p>
                  </div>
                  <Link
                    href="/admin/sellers"
                    className="rounded-xl bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Platform Orders Card */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Recent Platform Orders
            </h2>
            <Link href="/admin/orders" className="text-xs font-bold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No recent orders found.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-white block">
                      Order #{order.orderNumber}
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-zinc-900 dark:text-white block">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
