"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCurrentUser, useLogout } from "@/features/auth/queries";
import { useUnreadCount } from "@/features/notifications/queries";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
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
  SunMedium,
  MoonStar,
  Settings,
  FileText,
  LogOut,
  Wallet,
  Scale,
  Tags,
  BadgeCheck,
  ChevronDown,
  CreditCard,
  Shield,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

interface AdminLayoutContentProps {
  children: ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutContentProps) {
  const { data: user } = useCurrentUser();
  const { mutate: logout } = useLogout();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: unreadData } = useUnreadCount();
  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    sellers: true,
  });
  const notificationCount = unreadData?.unreadCount ?? 0;

  const isNavLinkActive = (href: string) => {
    const [hrefPath, hrefQuery = ""] = href.split("?");
    const expectedParams = new URLSearchParams(hrefQuery);
    return pathname === hrefPath && expectedParams.toString() === searchParams.toString();
  };

  // Initialize dark mode after hydration
  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem("admin-theme");
    if (savedTheme) {
      const isDark = savedTheme === "dark";
      setDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    } else {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    localStorage.setItem("admin-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

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

  const navGroups = [
    {
      label: "ADMIN CONTROL",
      items: [
        { id: "overview", name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
        { id: "profile", name: "Profile", href: "/account/settings", icon: Users },
      ],
    },
    {
      label: "MARKETPLACE",
      items: [
        {
          id: "sellers",
          name: "Sellers",
          href: "/admin/sellers",
          icon: Store,
          children: [
            { name: "Verification (KYC)", href: "/admin/sellers?tab=kyc" },
            { name: "Payouts & Commissions", href: "/admin/sellers?tab=payouts" },
          ],
        },
        { id: "products", name: "Products", href: "/admin/products", icon: Package },
        { id: "categories", name: "Categories", href: "/admin/categories", icon: Layers },
        { id: "orders", name: "Orders", href: "/admin/orders", icon: ShoppingBag },
        { id: "disputes", name: "Disputes & Refunds", href: "/admin/orders?tab=disputes", icon: Scale },
        { id: "brands", name: "Brands & Attributes", href: "/admin/categories?tab=brands", icon: Tags },
      ],
    },
    {
      label: "MARKETING",
      items: [
        { id: "coupons", name: "Coupons", href: "/admin/coupons", icon: Ticket },
        { id: "notifications", name: "Notifications", href: "/account/notifications", icon: Bell },
      ],
    },
    {
      label: "SETTINGS & SYSTEM",
      items: [
        { id: "general-settings", name: "General Settings", href: "/admin/settings", icon: Settings },
        { id: "payment-gateways", name: "Payment Gateways", href: "/admin/settings/payments", icon: CreditCard },
        { id: "roles-permissions", name: "Roles & Permissions", href: "/admin/settings/roles", icon: Shield },
      ],
    },
  ];

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "A";
  const adminAvatar = user?.avatar || "";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <Link href="/account/settings" className="flex items-center gap-2 rounded-xl transition hover:bg-zinc-100 dark:hover:bg-zinc-800/60 p-1.5">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-white font-bold ring-2 ring-white dark:ring-zinc-900">
              {adminAvatar ? (
                <img src={adminAvatar} alt={user?.name || "Admin avatar"} className="h-full w-full object-cover" />
              ) : (
                <ShieldAlert className="h-5 w-5" />
              )}
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

        <nav className="space-y-5 p-4">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                {group.label}
              </p>

              {group.items.map((item) => {
                const Icon = item.icon;
                const [itemPath, itemQuery = ""] = item.href.split("?");
                const isActive = itemQuery
                  ? isNavLinkActive(item.href)
                  : pathname === itemPath || (itemPath !== "/admin/dashboard" && pathname.startsWith(`${itemPath}/`));
                const isExpanded = item.children ? expandedItems[item.id] ?? true : false;

                return (
                  <div key={item.id} className="space-y-1.5">
                    <Link
                      href={item.children ? item.href : item.href}
                      onClick={(event) => {
                        if (!item.children) return;
                        event.preventDefault();
                        setExpandedItems((prev) => ({
                          ...prev,
                          [item.id]: !(prev[item.id] ?? true),
                        }));
                      }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                      <span>{item.name}</span>
                      {item.children && (
                        <ChevronRight
                          className={`ml-auto h-3.5 w-3.5 text-zinc-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      )}
                      {isActive && !item.children && <ChevronRight className="ml-auto h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </Link>

                    {item.children && isExpanded && (
                      <div className="ml-8 space-y-1 border-l border-zinc-200 pl-3 dark:border-zinc-700">
                        {item.children.map((child) => {
                          const isChildActive = isNavLinkActive(child.href);

                          return (
                            <Link
                              key={`${child.name}-${child.href}`}
                              href={child.href}
                              className={`block rounded-lg px-2 py-1.5 text-[10px] font-semibold transition ${isChildActive ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"}`}
                              onClick={() => setExpandedItems((prev) => ({ ...prev, [item.id]: true }))}
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
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
      <main className="flex-1 overflow-x-hidden">
        <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                >
                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900">
                    {adminAvatar ? (
                      <img src={adminAvatar} alt={user?.name || "Admin avatar"} className="h-full w-full object-cover" />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                        Admin
                      </p>
                      <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {user?.name || "Marketplace Operator"}
                      </h2>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                </button>

                {profileMenuOpen && (
                  <div className="absolute left-0 top-16 z-20 w-52 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                    <Link
                      href="/account/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      System Settings
                    </Link>
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Activity Logs
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setDarkMode((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                aria-label="Toggle dark mode"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              </button>

              <Link
                href="/account/notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                aria-label={`Notifications, ${notificationCount} unread`}
                title="Open notifications"
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </Link>

              <Link
                href="/admin/dashboard"
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Dashboard
              </Link>
              <Link
                href="/account/settings"
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Profile
              </Link>
              <Link
                href="/"
                className="rounded-xl bg-indigo-600 px-3 py-2 text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                View Store
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-7xl p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <ProtectedRoute>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedRoute>
  );
}