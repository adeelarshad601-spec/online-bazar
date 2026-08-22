"use client";

import { useSellerPayoutDashboard, useVendorOrders } from "@/features/seller/dashboard-queries";
import { useSellerStatus } from "@/features/seller/queries";
import { useCurrentUser } from "@/features/auth/queries";
import { useShopProducts } from "@/features/seller/product-queries";
import { useUnreadCount } from "@/features/notifications/queries";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Clock,
  ArrowRight,
  TrendingUp,
  Store,
  User,
  Loader2,
  AlertCircle,
  Plus,
  Bell,
} from "lucide-react";

export default function SellerDashboardPage() {
  const { data: sellerStatus, isLoading: isStatusLoading } = useSellerStatus();
  const { data: currentUser } = useCurrentUser();
  const { data: payoutDashboard, isLoading: isPayoutLoading } = useSellerPayoutDashboard();
  const { data: vendorOrdersData, isLoading: isOrdersLoading } = useVendorOrders();
  const { data: sellerProductsData, isLoading: isProductsLoading } = useShopProducts(sellerStatus?.shop?.id);
  const { data: unreadData } = useUnreadCount();

  const isLoading = isStatusLoading || isPayoutLoading || isOrdersLoading || isProductsLoading;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Normalize vendor orders array
  const vendorOrders: any[] = Array.isArray(vendorOrdersData)
    ? vendorOrdersData
    : vendorOrdersData?.orders || [];

  const shop = sellerStatus?.shop;
  const sellerProducts = sellerProductsData?.products || [];
  const pendingProducts = sellerProducts.filter((product) => product.status === "PENDING");

  const totalEarnings = Number(payoutDashboard?.totalEarnings || 0);
  const pendingBalance = Number(payoutDashboard?.balance || 0);
  const totalOrdersCount = vendorOrders.length;
  const pendingOrdersCount = vendorOrders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING").length;

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </span>
            <span>Welcome back, {sellerStatus?.name || "Merchant"}!</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Store overview for <strong className="text-emerald-600 dark:text-emerald-400">{shop?.name || "Your Shop"}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/account/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            aria-label={`Notifications, ${unreadData?.unreadCount ?? 0} unread`}
            title="Open notifications"
          >
            <Bell className="h-4 w-4" />
            {(unreadData?.unreadCount ?? 0) > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {(unreadData?.unreadCount ?? 0) > 99 ? "99+" : unreadData?.unreadCount}
              </span>
            )}
          </Link>
          <Link
            href="/seller/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </Link>
          {shop?.id && (
            <Link
              href={`/shops/${shop.id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <Store className="h-4 w-4" />
              <span>View Storefront</span>
            </Link>
          )}
        </div>
      </div>

      {/* No Shop Warning */}
      {!shop && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6 dark:border-amber-900/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                Create Your Shop Profile
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                You haven't set up your shop profile yet. Create a shop to start publishing products.
              </p>
            </div>
          </div>
          <Link
            href="/seller/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 shrink-0"
          >
            <span>Setup Shop Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Revenue</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
            ${totalEarnings.toFixed(2)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Lifetime Sales</span>
          </div>
        </div>

        {/* Available Balance */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Pending Earnings</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
            ${pendingBalance.toFixed(2)}
          </p>
          <Link
            href="/seller/payouts"
            className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-semibold hover:underline"
          >
            <span>Request Payout</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Total Orders */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Vendor Orders</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
            {totalOrdersCount}
          </p>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {pendingOrdersCount} requiring action
          </span>
        </div>

        {/* Payout Requests */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Payout Requests</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
            {payoutDashboard?.payoutRequests ?? 0}
          </p>
          <Link
            href="/seller/payouts"
            className="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-semibold hover:underline"
          >
            <span>View Payout History</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-amber-900 dark:text-amber-200">Product Approval Requests</h2>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
              Track products submitted to the admin team for review.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-2xl font-black text-amber-900 dark:text-amber-200">{pendingProducts.length}</p>
            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">Pending approval</p>
          </div>
        </div>
        {sellerProducts.length > 0 && (
          <div className="mt-4 divide-y divide-amber-200/70 border-t border-amber-200/70 dark:divide-amber-900/40 dark:border-amber-900/40">
            {sellerProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-4 py-3 text-xs">
                <div className="min-w-0">
                  <p className="truncate font-bold text-amber-950 dark:text-amber-100">{product.title}</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">{product.category?.name || "Uncategorized"}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                  {product.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Vendor Orders Section */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Recent Vendor Orders
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Latest orders placed for products from your shop
            </p>
          </div>
          <Link
            href="/seller/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {vendorOrders.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <ShoppingBag className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700" />
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              No orders placed for your products yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {vendorOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      Order #{order.order?.orderNumber || order.id.slice(0, 8)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : order.status === "SHIPPED"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                    {order.items?.length || 0} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-zinc-900 dark:text-white block">
                    ${Number(order.subTotal || 0).toFixed(2)}
                  </span>
                  <Link
                    href="/seller/orders"
                    className="text-[11px] font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
