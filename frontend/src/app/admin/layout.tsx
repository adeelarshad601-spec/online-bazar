"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCurrentUser } from "@/features/auth/queries";
import Link from "next/link";
import { ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Layers,
  ShoppingBag,
  Ticket,
  Bell,
  Home,
  ShieldAlert,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { usePathname } from "next/navigation";

interface AdminLayoutContentProps {
  children: ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutContentProps) {
  const { data: user } = useCurrentUser();
  const pathname = usePathname();

  // Role Protection Guard
  if (user && user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-200 bg-red-50/60 p-12 text-center space-y-4 dark:border-red-900/40 dark:bg-red-950/20">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-red-900 dark:text-red-300">
            Admin Access Required
          </h2>
          <p className="text-xs text-red-700 dark:text-red-400 max-w-md mx-auto">
            You must be an administrator to access the admin portal. Your current role is <strong>{user.role}</strong>.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
            >
              <span>Return Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Sellers", href: "/admin/sellers", icon: Store },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Notifications", href: "/account/notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-zinc-900 dark:text-white block leading-tight">
                Admin Control
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider block">
                Online-Bazar
              </span>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-indigo-600 dark:text-indigo-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
          >
            <Home className="h-4 w-4" />
            <span>Storefront Home</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedRoute>
  );
}
