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
  ChevronRight,
  Zap,
  CheckCircle2,
  Sparkles,
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
      <div className="flex h-[65vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Loading Seller Portal...</span>
        </div>
      </div>
    );
  }

  // Normalize vendor orders array
  const vendorOrders: any[] = Array.isArray(vendorOrdersData)
    ? vendorOrdersData
    : vendorOrdersData?.orders || [];

  const shop = sellerStatus?.shop;
  const sellerProducts = Array.isArray(sellerProductsData) ? sellerProductsData : [];
  const pendingProducts = sellerProducts.filter((product: any) => product.status === "PENDING");
  const approvedProducts = sellerProducts.filter((product: any) => product.status === "APPROVED");

  const totalEarnings = Number(payoutDashboard?.totalEarnings || 0);
  const pendingBalance = Number(payoutDashboard?.balance || 0);
  const totalOrdersCount = vendorOrders.length;
  const pendingOrdersCount = vendorOrders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING").length;
  const sellerName = sellerStatus?.name || currentUser?.name || "Merchant";

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Top Welcome Hero Banner - Emerald Wave Gradient Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 border border-emerald-800/40 p-6 sm:p-8 shadow-2xl text-white">
        {/* Wave Background Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-25">
          <svg className="w-full h-full" viewBox="0 0 500 200" fill="none" preserveAspectRatio="none">
            <path
              d="M0 100 Q 125 20, 250 100 T 500 100 L 500 200 L 0 200 Z"
              fill="url(#seller-emerald-grad)"
            />
            <defs>
              <linearGradient id="seller-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-400/60 bg-emerald-950 shadow-md">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={sellerName} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5 text-emerald-400" />
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {sellerName}!
                </h1>
                <p className="text-xs text-emerald-200/90 font-medium">
                  Store overview for <strong className="text-white underline decoration-emerald-400">{shop?.name || "Your Shop"}</strong>
                </p>
              </div>
            </div>
            <p className="text-xs text-emerald-100/80 font-medium pt-1">
              You have <span className="font-bold text-white">{pendingOrdersCount} orders requiring action</span> and <span className="font-bold text-white">${totalEarnings.toFixed(2)} total earnings</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/seller/products/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 text-zinc-950 px-5 py-3 text-xs font-bold hover:bg-emerald-400 shadow-lg transition-transform hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Product</span>
            </Link>

            {shop?.id && (
              <Link
                href={`/shops/${shop.id}`}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-500 hover:text-zinc-950 transition-all duration-200"
              >
                <Store className="h-4 w-4" />
                <span>View Storefront</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* No Shop Warning Alert */}
      {!shop && (
        <div className="rounded-3xl border border-amber-300/80 bg-amber-500/10 p-6 dark:border-amber-900/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                Create Your Shop Profile
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                You haven't set up your shop profile yet. Create a shop profile to start publishing products.
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

      {/* Row 1: Total Revenue Sparkline Card & Monthly Goal Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Revenue Card (2 Columns) */}
        <div className="lg:col-span-2 rounded-3xl bg-white border border-zinc-200 text-zinc-900 shadow-lg dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-white dark:shadow-xl p-6 flex flex-col justify-between relative overflow-hidden transition-colors">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Total Revenue
              </span>
              <div className="flex items-baseline gap-3">
                <h3 className="text-3xl font-black text-zinc-900 dark:text-white">
                  ${totalEarnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <TrendingUp className="h-3 w-3" />
                  Lifetime Sales
                </span>
              </div>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-md">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>

          {/* SVG Wave Sparkline Chart */}
          <div className="mt-8 h-32 w-full">
            <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="seller-revenue-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 90 Q 100 100 200 65 T 400 50 T 600 25 L 600 120 L 0 120 Z"
                fill="url(#seller-revenue-area)"
              />
              <path
                d="M 0 90 Q 100 100 200 65 T 400 50 T 600 25"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Monthly Target Radial Circular Ring Gauge (1 Column) */}
        <div className="rounded-3xl bg-white border border-zinc-200 text-zinc-900 shadow-lg dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-white dark:shadow-xl p-6 flex flex-col items-center justify-center text-center relative transition-colors">
          <div className="w-full flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Monthly Sales Target
            </span>
            <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>

          {/* Radial Circular Ring Gauge */}
          <div className="relative my-2 flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="62"
                stroke="currentColor"
                strokeWidth="12"
                className="text-zinc-200 dark:text-zinc-800"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="62"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={389}
                strokeDashoffset={389 - (389 * 68) / 100}
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-1000 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black text-zinc-900 dark:text-white block">68%</span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-2">
            <span className="font-bold text-zinc-900 dark:text-white">${totalEarnings.toFixed(0)}</span> of $18K target
          </p>
        </div>
      </div>

      {/* Row 2: Analytics Trio - Vendor Orders Bar Chart, Catalog Health, Store Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Orders Bar Chart */}
        <div className="rounded-3xl bg-white border border-zinc-200 text-zinc-900 shadow-lg dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-white dark:shadow-xl p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Vendor Orders
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">{totalOrdersCount}</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{pendingOrdersCount} requiring action</span>
              </div>
            </div>
          </div>

          {/* Status Legend */}
          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Processing
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Shipped
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Pending
            </span>
          </div>

          {/* Bar Columns Visual */}
          <div className="h-36 flex items-end justify-between gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            {[
              { height: "70%", color: "bg-emerald-500" },
              { height: "90%", color: "bg-emerald-500" },
              { height: "50%", color: "bg-blue-500" },
              { height: "80%", color: "bg-emerald-500" },
              { height: "60%", color: "bg-amber-500" },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-t-lg h-28 flex items-end overflow-hidden">
                  <div
                    className={`w-full ${bar.color} rounded-t-lg transition-all duration-500`}
                    style={{ height: bar.height }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catalog Health & Product Approval */}
        <div className="rounded-3xl bg-white border border-zinc-200 text-zinc-900 shadow-lg dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-white dark:shadow-xl p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Catalog Health
              </span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white mt-0.5 block">
                {sellerProducts.length} Products
              </span>
            </div>
            <Link href="/seller/products" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Approved Active
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{approvedProducts.length}</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${sellerProducts.length > 0 ? (approvedProducts.length / sellerProducts.length) * 100 : 0}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <span className="text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-500" /> Pending Admin Review
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold">{pendingProducts.length}</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${sellerProducts.length > 0 ? (pendingProducts.length / sellerProducts.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Store Performance Funnel */}
        <div className="rounded-3xl bg-white border border-zinc-200 text-zinc-900 shadow-lg dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-white dark:shadow-xl p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Store Funnel
              </span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white mt-0.5 block">5.82%</span>
            </div>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">This month</span>
          </div>

          {/* Funnel Progress Bars */}
          <div className="space-y-3">
            {[
              { label: "Store Views", count: "4,200", pct: "100%", color: "bg-emerald-500" },
              { label: "Product Clicks", count: "1,850", pct: "70%", color: "bg-teal-500" },
              { label: "Add to Carts", count: "410", pct: "40%", color: "bg-cyan-500" },
              { label: "Purchases", count: "245", pct: "25%", color: "bg-indigo-500" },
            ].map((step) => (
              <div key={step.label} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                  <span>{step.label}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">{step.count}</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${step.color} rounded-full transition-all duration-700`}
                    style={{ width: step.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Action Tables - Product Approval Requests & Recent Vendor Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Approval Requests */}
        <div className="rounded-3xl bg-white border border-zinc-200 text-zinc-900 shadow-lg dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-white dark:shadow-xl p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Product Approval Requests
              </h3>
            </div>
            <Link
              href="/seller/products"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View Catalog</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {sellerProducts.length === 0 ? (
            <div className="py-12 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
              No products found in your shop catalog.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {sellerProducts.slice(0, 4).map((product: any) => (
                <div key={product.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">{product.name || product.title}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      ${Number(product.price || 0).toFixed(2)} • {product.category?.name || "General"}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-bold border ${
                      product.status === "APPROVED"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : product.status === "PENDING"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Vendor Orders */}
        <div className="rounded-3xl bg-white border border-zinc-200 text-zinc-900 shadow-lg dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-white dark:shadow-xl p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Recent Vendor Orders
              </h3>
            </div>
            <Link
              href="/seller/orders"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {vendorOrders.length === 0 ? (
            <div className="py-12 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
              No recent vendor orders found.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {vendorOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-white block">
                      Order #{order.order?.orderNumber || order.id.slice(0, 8)}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {order.items?.length || 1} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-zinc-900 dark:text-white block">
                      ${Number(order.subTotal || order.totalAmount || 0).toFixed(2)}
                    </span>
                    <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {order.status}
                    </span>
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

