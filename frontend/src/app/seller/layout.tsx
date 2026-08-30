"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCurrentUser } from "@/features/auth/queries";
import { useSellerStatus } from "@/features/seller/queries";
import SellerProfileCard from "@/components/seller/SellerProfileCard";
import Link from "next/link";
import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingBag,
  CreditCard,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

interface SellerLayoutContentProps {
  children: ReactNode;
}

function SellerLayoutContent({ children }: SellerLayoutContentProps) {
  const { data: user } = useCurrentUser();
  const { data: sellerStatus } = useSellerStatus();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const productStatus = searchParams.get("status") || "";
  const isNavLinkActive = (href: string) => {
    const [hrefPath, hrefQuery = ""] = href.split("?");
    const expectedParams = new URLSearchParams(hrefQuery);
    return pathname === hrefPath && expectedParams.toString() === searchParams.toString();
  };
  const [productsMenuOpen, setProductsMenuOpen] = useState(pathname.startsWith("/seller/products"));
  const [shopMenuOpen, setShopMenuOpen] = useState(pathname.startsWith("/seller/shop"));
  const [ordersMenuOpen, setOrdersMenuOpen] = useState(pathname.startsWith("/seller/orders"));
  const [payoutsMenuOpen, setPayoutsMenuOpen] = useState(pathname.startsWith("/seller/payouts"));

  // Only block access to seller portal pages — not to seller/apply or seller/status
  const isSellerPortalPath =
    pathname.startsWith("/seller/dashboard") ||
    pathname.startsWith("/seller/shop") ||
    pathname.startsWith("/seller/products") ||
    pathname.startsWith("/seller/orders") ||
    pathname.startsWith("/seller/payouts");

  // Access check — only enforce SELLER role on actual portal pages
  if (user && user.role !== "SELLER" && isSellerPortalPath) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-12 text-center space-y-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-300">
            Seller Access Required
          </h2>
          <p className="text-xs text-amber-700 dark:text-amber-400 max-w-md mx-auto">
            You must be an approved seller to access the seller panel. Your current account role is <strong>{user.role}</strong>.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/seller/apply"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-700"
            >
              <span>Apply to Become a Seller</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  ];

  // For non-portal paths like /seller/apply or /seller/status, render without the sidebar shell
  const isApplyOrStatus =
    pathname.startsWith("/seller/apply") ||
    pathname.startsWith("/seller/status");

  if (isApplyOrStatus || !isSellerPortalPath) {
    return (
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside
        className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shrink-0 flex flex-col md:sticky md:top-0 md:h-screen md:overflow-y-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <Link href="/seller/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-zinc-900 dark:text-white block leading-tight">
                Seller Portal
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider block">
                {sellerStatus?.shop?.name || "Online-Bazar"}
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex flex-col flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-emerald-600 dark:text-emerald-400" />}
              </Link>
            );
          })}
          <div className="order-5">
            <button type="button" onClick={() => setOrdersMenuOpen((open) => !open)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold transition-all ${pathname.startsWith("/seller/orders") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white"}`}>
              <ShoppingBag className="h-4 w-4" />
              <span>Orders</span>
              <ChevronRight className={`ml-auto h-3.5 w-3.5 transition-transform ${ordersMenuOpen ? "rotate-90" : ""}`} />
            </button>
            {ordersMenuOpen && (
              <div className="ml-8 space-y-1 border-l border-emerald-200 py-1 pl-3 dark:border-emerald-900">
                {[["All Orders", ""], ["Pending", "PENDING"], ["Processing", "PROCESSING"], ["Shipped", "SHIPPED"], ["Delivered", "DELIVERED"], ["Cancelled", "CANCELLED"]].map(([name, status]) => (
                  <Link key={name} href={status ? `/seller/orders?status=${status}` : "/seller/orders"} className={`block rounded-lg px-3 py-2 text-[11px] font-semibold ${isNavLinkActive(status ? `/seller/orders?status=${status}` : "/seller/orders") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "text-zinc-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"}`}>{name}</Link>
                ))}
              </div>
            )}
          </div>
          <div className="order-4">
            <button type="button" onClick={() => setPayoutsMenuOpen((open) => !open)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold transition-all ${pathname.startsWith("/seller/payouts") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white"}`}>
              <CreditCard className="h-4 w-4" />
              <span>Payouts</span>
              <ChevronRight className={`ml-auto h-3.5 w-3.5 transition-transform ${payoutsMenuOpen ? "rotate-90" : ""}`} />
            </button>
            {payoutsMenuOpen && (
              <div className="ml-8 space-y-1 border-l border-emerald-200 py-1 pl-3 dark:border-emerald-900">
                {[["Payout Overview", ""], ["Pending Requests", "PENDING"], ["Processing", "PROCESSING"], ["Completed", "COMPLETED"], ["Failed", "FAILED"]].map(([name, status]) => (
                  <Link key={name} href={status ? `/seller/payouts?status=${status}` : "/seller/payouts"} className={`block rounded-lg px-3 py-2 text-[11px] font-semibold ${isNavLinkActive(status ? `/seller/payouts?status=${status}` : "/seller/payouts") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "text-zinc-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"}`}>{name}</Link>
                ))}
              </div>
            )}
          </div>
          <div className="order-2">
            <button
              type="button"
              onClick={() => setShopMenuOpen((open) => !open)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold transition-all ${
                pathname.startsWith("/seller/shop")
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white"
              }`}
            >
              <Store className="h-4 w-4" />
              <span>My Shop</span>
              <ChevronRight className={`ml-auto h-3.5 w-3.5 transition-transform ${shopMenuOpen ? "rotate-90" : ""}`} />
            </button>
            {shopMenuOpen && (
              <div className="ml-8 space-y-1 border-l border-emerald-200 py-1 pl-3 dark:border-emerald-900">
                <Link href="/seller/shop/overview" className={`block rounded-lg px-3 py-2 text-[11px] font-semibold ${isNavLinkActive("/seller/shop/overview") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "text-zinc-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"}`}>
                  Shop Overview
                </Link>
                <Link href="/seller/shop" className={`block rounded-lg px-3 py-2 text-[11px] font-semibold ${isNavLinkActive("/seller/shop") ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "text-zinc-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"}`}>
                  Manage Shop Profile
                </Link>
                {sellerStatus?.shop?.id && (
                  <Link href={`/shops/${sellerStatus.shop.id}`} target="_blank" className="block rounded-lg px-3 py-2 text-[11px] font-semibold text-zinc-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300">
                    View Storefront
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="order-3">
            <button
              type="button"
              onClick={() => setProductsMenuOpen((open) => !open)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-bold transition-all ${
                pathname.startsWith("/seller/products")
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white"
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Products</span>
              <ChevronRight className={`ml-auto h-3.5 w-3.5 transition-transform ${productsMenuOpen ? "rotate-90" : ""}`} />
            </button>
            {productsMenuOpen && (
              <div className="ml-8 space-y-1 border-l border-emerald-200 py-1 pl-3 dark:border-emerald-900">
                {[
                  ["All Products", ""],
                  ["Pending Approval", "PENDING"],
                  ["Approved", "APPROVED"],
                  ["Rejected", "REJECTED"],
                  ["Suspended", "SUSPENDED"],
                ].map(([name, status]) => {
                  const href = status ? `/seller/products?status=${status}` : "/seller/products";
                  const isProductPageActive = pathname === "/seller/products" && productStatus === status;

                  return (
                  <Link key={href} href={href} className={`block rounded-lg px-3 py-2 text-[11px] font-semibold ${isProductPageActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "text-zinc-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"}`}>
                    {name}
                  </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800">
          <SellerProfileCard />
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden"
        style={{ scrollbarGutter: "stable", scrollbarWidth: "thin", msOverflowStyle: "auto" }}
      >
        <div className="max-w-7xl p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <SellerLayoutContent>{children}</SellerLayoutContent>
    </ProtectedRoute>
  );
}
