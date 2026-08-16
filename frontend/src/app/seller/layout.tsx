"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCurrentUser } from "@/features/auth/queries";
import { useSellerStatus } from "@/features/seller/queries";
import Link from "next/link";
import { ReactNode } from "react";
import {
  LayoutDashboard,
  Store,
  Package,
  ShoppingBag,
  CreditCard,
  User,
  LogOut,
  AlertCircle,
  Home,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { usePathname } from "next/navigation";

interface SellerLayoutContentProps {
  children: ReactNode;
}

function SellerLayoutContent({ children }: SellerLayoutContentProps) {
  const { data: user } = useCurrentUser();
  const { data: sellerStatus, isLoading } = useSellerStatus();
  const pathname = usePathname();

  // Access check
  if (user && user.role !== "SELLER") {
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
    { name: "My Shop", href: "/seller/shop", icon: Store },
    { name: "Products", href: "/seller/products", icon: Package },
    { name: "Orders", href: "/seller/orders", icon: ShoppingBag },
    { name: "Payouts", href: "/seller/payouts", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shrink-0">
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

        <nav className="p-4 space-y-1">
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
        </nav>

        <div className="p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <Link
            href="/account/settings"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          >
            <User className="h-4 w-4" />
            <span>Account Settings</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          >
            <Home className="h-4 w-4" />
            <span>Customer Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl overflow-x-hidden">
        {children}
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
