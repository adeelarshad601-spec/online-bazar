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
  Scale,
  Tags,
  ChevronDown,
  CreditCard,
  Shield,
  Search,
  BookOpen,
  Globe,
  Menu,
  X,
  MessageSquare,
  Mail,
  Kanban,
  Calendar,
  Folder,
  BarChart3,
  Edit3,
  MapPin,
  FormInput,
  Wand2,
  BadgeDollarSign,
  Sparkles,
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    sellers: true,
  });

  const notificationCount = unreadData?.unreadCount ?? 4;

  const isNavLinkActive = (href: string) => {
    const [hrefPath, hrefQuery = ""] = href.split("?");
    const expectedParams = new URLSearchParams(hrefQuery);
    return pathname === hrefPath && expectedParams.toString() === searchParams.toString();
  };

  // Initialize dark mode after hydration
  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem("theme") || localStorage.getItem("admin-theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else if (savedTheme === "light") {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    } else {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    localStorage.setItem("admin-theme", darkMode ? "dark" : "light");
  }, [darkMode, isMounted]);


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
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
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
      label: "WEBSITE",
      items: [
        { id: "landing", name: "Landing Page", href: "/", icon: Home },
      ],
    },
    {
      label: "DASHBOARDS",
      items: [
        { id: "overview", name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
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
      label: "APPS",
      items: [
        { id: "coupons", name: "Coupons", href: "/admin/coupons", icon: Ticket },
        { id: "notifications", name: "Notifications", href: "/account/notifications", icon: Bell },
        { id: "chat", name: "Chat", href: "/admin/dashboard?tab=chat", icon: MessageSquare },
        { id: "mail", name: "Mail", href: "/admin/dashboard?tab=mail", icon: Mail },
        { id: "kanban", name: "Kanban", href: "/admin/dashboard?tab=kanban", icon: Kanban },
        { id: "calendar", name: "Calendar", href: "/admin/dashboard?tab=calendar", icon: Calendar },
        { id: "files", name: "Files", href: "/admin/dashboard?tab=files", icon: Folder },
      ],
    },
    {
      label: "PAGES & SETTINGS",
      items: [
        { id: "profile", name: "Profile", href: "/account/settings", icon: Users },
        { id: "general-settings", name: "General Settings", href: "/admin/settings", icon: Settings },
        { id: "payment-gateways", name: "Payment Gateways", href: "/admin/settings/payments", icon: CreditCard },
        { id: "roles-permissions", name: "Roles & Permissions", href: "/admin/settings/roles", icon: Shield },
      ],
    },
  ];

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "A";
  const adminAvatar = user?.avatar || "";

  return (
    <div className="h-screen overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col md:flex-row font-sans transition-colors duration-200">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar - Online Bazar Design */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col transition-transform duration-300 md:static md:translate-x-0 shrink-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 font-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              OB
            </div>
            <div>
              <span className="text-base font-extrabold text-zinc-900 dark:text-white tracking-wide block leading-tight flex items-center gap-1">
                Online Bazar
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                  Admin
                </span>
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block tracking-wider">
                Management Suite
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav
          className="flex-1 overflow-y-auto p-3 space-y-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800"
          style={{ scrollbarWidth: "thin" }}
        >
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 pb-1">
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
                  <div key={item.id} className="space-y-1">
                    <Link
                      href={item.href}
                      onClick={(event) => {
                        if (item.children) {
                          event.preventDefault();
                          setExpandedItems((prev) => ({
                            ...prev,
                            [item.id]: !(prev[item.id] ?? true),
                          }));
                        } else {
                          setMobileSidebarOpen(false);
                        }
                      }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-emerald-500 text-zinc-950 shadow-sm font-bold shadow-emerald-500/20"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-zinc-950" : "text-zinc-500 dark:text-zinc-400"}`} />
                      <span className="flex-1">{item.name}</span>
                      {item.children && (
                        <ChevronRight
                          className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      )}
                    </Link>

                    {item.children && isExpanded && (
                      <div className="ml-7 space-y-1 border-l border-zinc-200 dark:border-zinc-800/80 pl-3">
                        {item.children.map((child) => {
                          const isChildActive = isNavLinkActive(child.href);

                          return (
                            <Link
                              key={`${child.name}-${child.href}`}
                              href={child.href}
                              onClick={() => {
                                setMobileSidebarOpen(false);
                                setExpandedItems((prev) => ({ ...prev, [item.id]: true }));
                              }}
                              className={`block rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition ${
                                isChildActive
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/40"
                              }`}
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

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white transition"
          >
            <Home className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>View Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <h1 className="text-sm font-bold text-zinc-900 dark:text-white tracking-wide hidden sm:block">
                Dashboard
              </h1>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Global Search Input */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-800/80 pl-9 pr-3 py-1.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 border border-zinc-200 dark:border-zinc-700/50 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Docs Button */}
            <Link
              href="/admin/dashboard?tab=docs"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 dark:hover:text-white dark:hover:bg-zinc-800 transition"
              title="Documentation"
            >
              <BookOpen className="h-4 w-4" />
            </Link>

            {/* Light / Dark Theme Toggle Button - Fixed Icon Logic */}
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 dark:hover:text-white dark:hover:bg-zinc-800 transition cursor-pointer"
              title={darkMode ? "Dark Mode Active (Click for Light Mode)" : "Light Mode Active (Click for Dark Mode)"}
            >
              {darkMode ? (
                <MoonStar className="h-4 w-4 text-emerald-400" />
              ) : (
                <SunMedium className="h-4 w-4 text-amber-500" />
              )}
            </button>

            {/* Language Switcher Badge */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/40 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600">
              <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>EN</span>
            </div>

            {/* Notifications Button */}
            <Link
              href="/account/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 dark:hover:text-white dark:hover:bg-zinc-800 transition"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                  {notificationCount}
                </span>
              )}
            </Link>

            {/* User Profile Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition"
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-emerald-500 text-zinc-950 font-bold text-xs ring-2 ring-emerald-500/40">
                  {adminAvatar ? (
                    <img src={adminAvatar} alt={user?.name || "Admin"} className="h-full w-full object-cover" />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white hidden lg:block">
                  {user?.name || "Alex Johnson"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-2 shadow-2xl space-y-1">
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user?.name || "Alex Johnson"}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">{user?.email || "admin@onlinebazar.com"}</p>
                  </div>
                  <Link
                    href="/account/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition"
                  >
                    <Settings className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    System Settings
                  </Link>
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition"
                  >
                    <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Activity Logs
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Workspace */}
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6"
          style={{ scrollbarWidth: "thin" }}
        >
          {children}
        </main>
      </div>
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