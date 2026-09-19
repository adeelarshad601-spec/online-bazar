"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/logo";
import { useCurrentUser, useLogout } from "@/features/auth/queries";
import { useCategories } from "@/features/products/queries";
import { useCart } from "@/features/cart/queries";
import { useWishlist } from "@/features/wishlist/queries";
import { useCustomerOrders } from "@/features/orders/queries";
import { useUnreadCount } from "@/features/notifications/queries";
import {
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Store,
  ShieldAlert,
  Package,
  Layers,
  Sparkles,
  Bell,
  HelpCircle,
  SunMedium,
  MoonStar,
  Check,
} from "lucide-react";

import AuthModal from "@/components/auth/AuthModal";

export default function Header() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories();
  const { data: cartData } = useCart();
  const { data: wishlistData } = useWishlist();
  const { data: customerOrdersData } = useCustomerOrders();
  const { data: unreadData } = useUnreadCount();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchCatOpen, setSearchCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [darkMode, setDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: "login" | "register" }>({
    isOpen: false,
    mode: "login",
  });

  // Listen for global custom event to trigger auth modal anywhere in the app
  useEffect(() => {
    const handleOpenAuthModal = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode?: "login" | "register" }>;
      const mode = customEvent.detail?.mode || "login";
      setAuthModalState({ isOpen: true, mode });
    };

    window.addEventListener("open-auth-modal", handleOpenAuthModal);
    return () => {
      window.removeEventListener("open-auth-modal", handleOpenAuthModal);
    };
  }, []);

  // Initialize theme on hydration
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


  const categories = categoriesData || [];
  const unreadCount = unreadData?.unreadCount ?? 0;

  const selectedCatObj = categories.find((c) => c.id === selectedCategory);
  const selectedCatName = selectedCategory === "All" ? "All Categories" : selectedCatObj?.name || "All Categories";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    if (selectedCategory && selectedCategory !== "All") {
      params.set("categoryId", selectedCategory);
    }
    const query = params.toString();
    router.push(`/products${query ? `?${query}` : ""}`);
  };

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-t-4 border-emerald-700 bg-white/95 backdrop-blur-md shadow-xs dark:border-emerald-600 dark:bg-zinc-950/95">
      {/* 1. Main Header Row */}
      <div className="w-full border-b border-zinc-200/80 px-4 dark:border-zinc-800 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-2 py-2.5 sm:gap-4">
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white lg:hidden"
              aria-label="Toggle Navigation Menu"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
            <div className="min-w-0">
              <Logo size="md" showSubtitle />
            </div>
          </div>

          {/* Center Search Bar with Custom Category Dropdown */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden flex-1 max-w-lg items-center lg:flex"
            id="storefront-search-form"
          >
            <div className="relative flex w-full h-10 items-stretch overflow-visible rounded-none border border-zinc-300 bg-white shadow-xs transition-all focus-within:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900">
              {/* Custom Styled Category Dropdown */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setSearchCatOpen((prev) => !prev)}
                  className="h-full flex items-center gap-2 bg-zinc-950 px-3.5 text-xs font-bold text-white border-r border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer"
                  id="search-category-dropdown-btn"
                >
                  <span className="max-w-[120px] truncate">{selectedCatName}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${searchCatOpen ? "rotate-180" : ""}`} />
                </button>

                {searchCatOpen && (
                  <div
                    className="absolute left-0 top-full mt-1.5 w-56 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 z-50 max-h-64 overflow-y-auto"
                    onMouseLeave={() => setSearchCatOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("All");
                        setSearchCatOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        selectedCategory === "All"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span>All Categories</span>
                      {selectedCategory === "All" && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                    </button>
                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSearchCatOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                          selectedCategory === cat.id
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {selectedCategory === cat.id && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input Field */}
              <input
                type="text"
                placeholder="Search products, brands, or shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-3.5 py-2 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                id="search-input-field"
              />

              {/* Square Search Submit Button inside Input */}
              <button
                type="submit"
                className="flex h-full w-10 shrink-0 items-center justify-center rounded-none bg-emerald-600 text-white transition-colors hover:bg-emerald-700 focus:outline-none"
                aria-label="Submit search"
                id="search-submit-btn"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Right Action Icons & User Account */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Wishlist Icon with Counter Badge */}
            <Link
              href="/wishlist"
              className="relative hidden h-8 w-8 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-emerald-400 sm:flex sm:h-10 sm:w-10"
              aria-label="View Wishlist"
              id="header-wishlist-link"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs">
                {wishlistData?.items?.length || 0}
              </span>
            </Link>

            {/* Cart Icon with Counter Badge */}
            <Link
              href="/cart"
              className="relative hidden h-8 w-8 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-emerald-400 sm:flex sm:h-10 sm:w-10"
              aria-label="View Shopping Cart"
              id="header-cart-link"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs">
                {cartData?.totalItems || 0}
              </span>
            </Link>

            {/* Notifications Icon with Counter Badge */}
            {user && (
              <Link
                href="/account/notifications"
                className="relative hidden h-8 w-8 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-emerald-400 sm:flex sm:h-10 sm:w-10"
                aria-label="View Notifications"
                id="header-notifications-link"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-xs">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Storefront Dark / Light Mode Toggle Button next to Cart */}
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="relative hidden h-8 w-8 items-center justify-center rounded-full text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer sm:flex sm:h-10 sm:w-10"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              id="header-theme-toggle-btn"
            >
              {darkMode ? (
                <SunMedium className="h-4 w-4 text-amber-500 sm:h-5 sm:w-5" />
              ) : (
                <MoonStar className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5" />
              )}
            </button>

            {/* Vertical Separator */}
            <div className="hidden h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 sm:block" />


            {/* User Account / Profile Pill */}
            {isUserLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 p-1 pr-2 text-[10px] font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:gap-2 sm:pr-3 sm:text-xs"
                  id="user-menu-btn"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs sm:text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="max-w-[70px] truncate sm:max-w-[100px]">{user.name}</span>
                  <ChevronDown className="h-3 w-3 text-zinc-500 sm:h-3.5 sm:w-3.5" />
                </button>

                {/* Account Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    id="user-dropdown-menu"
                  >
                    <div className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-800">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">{user.name}</p>
                      <p className="truncate text-[11px] text-zinc-500">{user.email}</p>
                    </div>

                    <div className="py-1">
                      {user.role === "CUSTOMER" && (
                        <>
                          <Link
                            href="/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Package className="h-4 w-4 text-emerald-600" />
                            <span>My Orders</span>
                            <span className="ml-auto min-w-5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                              {customerOrdersData?.pagination?.total ?? customerOrdersData?.orders?.length ?? 0}
                            </span>
                          </Link>

                          <Link
                            href="/wishlist"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Heart className="h-4 w-4 text-pink-600" />
                            <span>Wishlist</span>
                            <span className="ml-auto min-w-5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                              {wishlistData?.items?.length || 0}
                            </span>
                          </Link>

                          <Link
                            href="/account/notifications"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Bell className="h-4 w-4 text-amber-600" />
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                              <span className="ml-auto min-w-5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            )}
                          </Link>

                          <Link
                            href="/account/settings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <UserIcon className="h-4 w-4 text-blue-600" />
                            Account Settings
                          </Link>

                          <Link
                            href="/support"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <HelpCircle className="h-4 w-4 text-teal-600" />
                            Help & Support
                          </Link>
                        </>
                      )}

                      {user.role === "SELLER" && (
                        <>
                          <Link
                            href="/seller/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Store className="h-4 w-4 text-teal-600" />
                            Seller Dashboard
                          </Link>

                          <Link
                            href="/seller/shop"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Store className="h-4 w-4 text-emerald-600" />
                            My Shop
                          </Link>

                          <Link
                            href="/seller/products"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Package className="h-4 w-4 text-violet-600" />
                            Products
                          </Link>

                          <Link
                            href="/seller/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <ShoppingCart className="h-4 w-4 text-cyan-600" />
                            Orders
                          </Link>

                          <Link
                            href="/seller/payouts"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <ShieldAlert className="h-4 w-4 text-indigo-600" />
                            Earnings
                          </Link>

                          <Link
                            href="/account/notifications"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Bell className="h-4 w-4 text-amber-600" />
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                              <span className="ml-auto min-w-5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            )}
                          </Link>

                          <Link
                            href="/account/settings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <UserIcon className="h-4 w-4 text-blue-600" />
                            Settings
                          </Link>

                          <Link
                            href="/support"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <HelpCircle className="h-4 w-4 text-teal-600" />
                            Help & Support
                          </Link>
                        </>
                      )}

                      {user.role === "ADMIN" && (
                        <>
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Store className="h-4 w-4 text-emerald-600" />
                            Admin Panel
                          </Link>

                          <Link
                            href="/account/notifications"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Bell className="h-4 w-4 text-amber-600" />
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                              <span className="ml-auto min-w-5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            )}
                          </Link>

                          <Link
                            href="/account/settings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <UserIcon className="h-4 w-4 text-blue-600" />
                            Settings
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-zinc-100 pt-1 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        id="logout-btn"
                      >
                        <LogOut className="h-4 w-4" />
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAuthModalState({ isOpen: true, mode: "login" })}
                  className="rounded-full border border-emerald-600/30 bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700 shadow-sm transition-all hover:border-emerald-600 hover:bg-emerald-600 hover:text-white hover:shadow-md dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white sm:px-5 sm:py-2.5 sm:text-xs"
                  id="header-login-btn"
                >
                  <span className="inline-flex items-center gap-1.5 sm:gap-2">
                    <UserIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>Sign In</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Sub-Navbar Row with Full Navigation Links (Home, Shop, New Arrivals, Deals, Sellers, Support, Become a Seller) */}
      <nav className="border-b border-emerald-700/30 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="overflow-x-auto">
            <div className="flex min-w-max items-center justify-between gap-2 sm:gap-3 text-[10px] font-bold sm:text-xs">
              {/* All Categories Button with Dropdown */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-xs transition-colors hover:bg-emerald-700 sm:px-3.5 sm:text-xs"
                  id="categories-dropdown-toggle"
                >
                  <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>All Categories</span>
                  <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>

                {categoriesDropdownOpen && (
                  <div
                    className="absolute left-0 top-full mt-2 z-50 max-h-80 w-64 overflow-y-auto rounded-2xl border border-zinc-200 bg-white py-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                    onMouseLeave={() => setCategoriesDropdownOpen(false)}
                    id="categories-menu-list"
                  >
                    {isCategoriesLoading ? (
                      <div className="px-4 py-3 text-xs text-zinc-400 animate-pulse">
                        Loading categories...
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-zinc-400">
                        No categories found
                      </div>
                    ) : (
                      categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/categories/${cat.id}`}
                          onClick={() => setCategoriesDropdownOpen(false)}
                          className="block px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                        >
                          {cat.name}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Core Navigation Links */}
              <div className="flex min-w-max items-center gap-2 sm:gap-3">
                <Link
                  href="/"
                  className="text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400"
                >
                  Home
                </Link>

                <Link
                  href="/products"
                  className="text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400"
                >
                  Products
                </Link>

                <Link
                  href="/products?sort=newest"
                  className="hidden md:flex items-center gap-1 text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>New Arrivals</span>
                </Link>

                <Link
                  href="/products?featured=true"
                  className="hidden lg:block text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400"
                >
                  Featured Deals
                </Link>

                <Link
                  href="/shops"
                  className="text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400"
                >
                  Browse Sellers
                </Link>

                <Link
                  href="/support"
                  className="flex items-center gap-1 text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-teal-600" />
                  <span>Help & Support</span>
                </Link>

                <Link
                  href="/seller/apply"
                  className="hidden sm:inline-flex items-center gap-1 text-emerald-700 font-extrabold hover:underline dark:text-emerald-400"
                >
                  <Store className="h-3.5 w-3.5" />
                  <span>Become a Seller</span>
                </Link>
              </div>

              {/* Right Support Hotline */}
              <div className="hidden xl:block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                24/7 Support: <span className="font-bold text-emerald-600 dark:text-emerald-400">+1 800-ONLINE-BAZAR</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 3. Mobile Search Input Bar */}
      <div className="border-b border-zinc-100 px-4 py-2.5 lg:hidden dark:border-zinc-800">
        <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2">
          <input
            type="text"
            placeholder="Search products, brands, or shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
          <button
            type="submit"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white"
            aria-label="Submit search"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* 4. Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className="border-b border-zinc-200 bg-white p-4 lg:hidden dark:border-zinc-800 dark:bg-zinc-950"
          id="mobile-menu-drawer"
        >
          <div className="space-y-4">
            <div className="border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Categories
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-emerald-50 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-sm font-semibold">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-zinc-800 hover:text-emerald-600 dark:text-zinc-200 dark:hover:text-emerald-400"
              >
                Home
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-zinc-800 hover:text-emerald-600 dark:text-zinc-200 dark:hover:text-emerald-400"
              >
                All Products
              </Link>
              <Link
                href="/products?sort=newest"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-1.5 text-zinc-800 hover:text-emerald-600 dark:text-zinc-200 dark:hover:text-emerald-400"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>New Arrivals</span>
              </Link>
              <Link
                href="/products?featured=true"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-zinc-800 hover:text-emerald-600 dark:text-zinc-200 dark:hover:text-emerald-400"
              >
                Featured Deals
              </Link>
              <Link
                href="/shops"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-zinc-800 hover:text-emerald-600 dark:text-zinc-200 dark:hover:text-emerald-400"
              >
                Browse Sellers
              </Link>
              <Link
                href="/support"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-zinc-800 hover:text-emerald-600 dark:text-zinc-200 dark:hover:text-emerald-400"
              >
                Help & Support
              </Link>
              {user && (
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-zinc-800 hover:text-emerald-600 dark:text-zinc-200 dark:hover:text-emerald-400"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-emerald-600" />
                    <span>My Orders</span>
                  </div>
                  <span className="min-w-5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                    {customerOrdersData?.pagination?.total ?? customerOrdersData?.orders?.length ?? 0}
                  </span>
                </Link>
              )}
              <Link
                href="/seller/apply"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-emerald-600 dark:text-emerald-400 font-bold"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Auth Modal (Popup over current page with backdrop blur) */}
      <AuthModal
        isOpen={authModalState.isOpen}
        onClose={() => setAuthModalState((prev) => ({ ...prev, isOpen: false }))}
        initialMode={authModalState.mode}
      />
    </header>
  );
}
