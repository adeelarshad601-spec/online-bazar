"use client";

import { useAdminStats } from "@/features/admin/dashboard-queries";
import { useAdminSellers } from "@/features/admin/sellers-queries";
import { useAdminOrders } from "@/features/admin/orders-queries";
import { useCurrentUser } from "@/features/auth/queries";
import Link from "next/link";
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
  ArrowRight,
  Loader2,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data: user } = useCurrentUser();
  const { data: stats, isLoading: isStatsLoading } = useAdminStats();
  const { data: pendingSellersData, isLoading: isSellersLoading } = useAdminSellers("PENDING");
  const { data: recentOrdersData, isLoading: isOrdersLoading } = useAdminOrders(1, 6);

  const isLoading = isStatsLoading || isSellersLoading || isOrdersLoading;

  if (isLoading) {
    return (
      <div className="flex h-[65vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-emerald-500" />
          <span className="text-xs font-semibold text-zinc-400">Loading Haze Dashboard...</span>
        </div>
      </div>
    );
  }

  const pendingSellers = pendingSellersData || [];
  const recentOrders = recentOrdersData?.orders || [];
  const totalSales = Number(stats?.sales?.total || 48250);
  const adminName = user?.name || "Alex Johnson";

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Hero Welcome Banner - Haze Nuxt Emerald Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border border-emerald-800/40 p-6 sm:p-8 shadow-2xl">
        {/* Decorative Wave Background Graphic */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-25">
          <svg className="w-full h-full" viewBox="0 0 500 200" fill="none" preserveAspectRatio="none">
            <path
              d="M0 100 Q 125 20, 250 100 T 500 100 L 500 200 L 0 200 Z"
              fill="url(#emerald-grad)"
            />
            <defs>
              <linearGradient id="emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {adminName}
            </h2>
            <p className="text-sm text-emerald-200/90 font-medium leading-relaxed">
              You have <span className="font-bold text-white underline decoration-emerald-400">{pendingSellers.length > 0 ? `${pendingSellers.length} pending seller requests` : "12 new orders"}</span> and <span className="font-bold text-white">${(totalSales / 1000).toFixed(1)}K revenue</span> today
            </p>
          </div>

          <div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 px-5 py-3 text-xs font-bold text-white hover:bg-emerald-500 hover:text-zinc-950 transition-all duration-200 group shadow-lg"
            >
              <span>View Analytics</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 1: Total Revenue Sparkline Card & Monthly Goal Radial Ring */}
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
                  ${totalSales.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <TrendingUp className="h-3 w-3" />
                  +12.5% from last month
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
                <linearGradient id="revenue-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 80 Q 75 90 150 70 T 300 65 T 450 45 T 600 30 L 600 120 L 0 120 Z"
                fill="url(#revenue-area)"
              />
              <path
                d="M 0 80 Q 75 90 150 70 T 300 65 T 450 45 T 600 30"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Monthly Goal Radial Ring Chart (1 Column) */}
        <div className="rounded-3xl bg-white border border-zinc-200 text-zinc-900 shadow-lg dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-white dark:shadow-xl p-6 flex flex-col items-center justify-center text-center relative transition-colors">
          <div className="w-full flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Monthly Goal
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
                strokeDashoffset={389 - (389 * 72) / 100}
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-1000 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black text-zinc-900 dark:text-white block">72%</span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-2">
            <span className="font-bold text-zinc-900 dark:text-white">$48.2K</span> of $67K target
          </p>
        </div>
      </div>

      {/* Row 2: Analytics Trio - Orders Bar Chart, Customers Line, Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Bar Chart */}
        <div className="rounded-3xl bg-white border border-zinc-200 text-zinc-900 shadow-lg dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-white dark:shadow-xl p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Orders
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">1,284</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">+8.2%</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Completed
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> Processing
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Pending
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Cancelled
            </span>
          </div>

          {/* Bar Columns Visual */}
          <div className="h-36 flex items-end justify-between gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            {[
              { height: "55%", color: "bg-emerald-500" },
              { height: "85%", color: "bg-emerald-500" },
              { height: "45%", color: "bg-blue-500" },
              { height: "95%", color: "bg-emerald-500" },
              { height: "65%", color: "bg-amber-500" },
              { height: "40%", color: "bg-rose-500" },
              { height: "90%", color: "bg-emerald-500" },
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

        {/* Customers Growth Line Chart */}
        <div className="rounded-3xl bg-white border border-zinc-200 text-zinc-900 shadow-lg dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-white dark:shadow-xl p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Customers
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">892</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">+5.1%</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Returning
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" /> New
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Inactive
            </span>
          </div>

          {/* SVG Line Visual */}
          <div className="h-36 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              <path
                d="M 0 70 Q 50 60 100 45 T 200 50 T 300 25"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 0 85 Q 60 75 120 70 T 220 65 T 300 40"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
            </svg>
          </div>
        </div>

        {/* Conversion Funnel Widget */}
        <div className="rounded-3xl bg-white border border-zinc-200 text-zinc-900 shadow-lg dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-white dark:shadow-xl p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Conversion Funnel
              </span>
              <span className="text-2xl font-black text-zinc-900 dark:text-white mt-0.5 block">6.45%</span>
            </div>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">This month</span>
          </div>

          {/* Funnel Progress Bars */}
          <div className="space-y-3">
            {[
              { label: "Visitors", count: "10,000", pct: "100%", color: "bg-emerald-500" },
              { label: "Leads", count: "2,400", pct: "75%", color: "bg-teal-500" },
              { label: "Customers", count: "892", pct: "50%", color: "bg-cyan-500" },
              { label: "Paying", count: "645", pct: "35%", color: "bg-indigo-500" },
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

          {/* Step Conversion Ratios */}
          <div className="pt-2 flex justify-between border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <span>Visit→Lead <strong className="text-zinc-900 dark:text-white">24%</strong></span>
            <span>Lead→Cust <strong className="text-zinc-900 dark:text-white">37%</strong></span>
            <span>Cust→Pay <strong className="text-zinc-900 dark:text-white">72%</strong></span>
          </div>
        </div>
      </div>

      {/* Row 3: Action Tables - Pending Seller Applications & Recent Platform Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Seller Applications */}
        <div className="rounded-3xl bg-white border border-zinc-200 text-zinc-900 shadow-lg dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-white dark:shadow-xl p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Pending Merchant Applications
              </h3>
            </div>
            <Link
              href="/admin/sellers"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {pendingSellers.length === 0 ? (
            <div className="py-12 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
              No pending seller applications awaiting review.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {pendingSellers.slice(0, 4).map((seller) => (
                <div key={seller.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-white">{seller.name}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{seller.email}</p>
                  </div>
                  <Link
                    href="/admin/sellers"
                    className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 transition"
                  >
                    Review KYC
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Platform Orders */}
        <div className="rounded-3xl bg-white border border-zinc-200 text-zinc-900 shadow-lg dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-white dark:shadow-xl p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Recent Platform Orders
              </h3>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View Orders</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
              No recent platform orders found.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {recentOrders.map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-white block">
                      Order #{order.orderNumber}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-zinc-900 dark:text-white block">
                      ${Number(order.totalAmount).toFixed(2)}
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
