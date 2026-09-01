"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/logo";
import { useCurrentUser, useLogout } from "@/features/auth/queries";
import { useCategories } from "@/features/products/queries";
import { useCart } from "@/features/cart/queries";
import { useWishlist } from "@/features/wishlist/queries";
import { useCustomerOrders } from "@/features/orders/queries";
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
} from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories();
  const { data: cartData } = useCart();
  const { data: wishlistData } = useWishlist();
  const { data: customerOrdersData } = useCustomerOrders();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = categoriesData || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
      {/* Top Announcement Bar (GoCart Style) */}
      <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-rose-500 text-xs font-semibold text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span>Get 20% OFF on Your First Order!</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products?featured=true"
              className="rounded-full bg-white px-3 py-0.5 text-[11px] font-bold text-zinc-900 shadow-xs hover:bg-zinc-100"
            >
              Claim Offer
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="w-full border-b border-zinc-200/80 bg-white/95 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-6 py-2.5">
          {/* Mobile Menu & Logo */}
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white lg:hidden"
              aria-label="Toggle Navigation Menu"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Logo size="md" showSubtitle />
          </div>

          {/* Nav Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            <Link href="/" className="hover:text-emerald-600 transition-colors dark:hover:text-emerald-400">
              Home
            </Link>
            <Link href="/products" className="hover:text-emerald-600 transition-colors dark:hover:text-emerald-400">
              Shop
            </Link>
            <Link href="/shops" className="hover:text-emerald-600 transition-colors dark:hover:text-emerald-400">
              Sellers
            </Link>
            <Link href="/seller/apply" className="hover:text-emerald-600 transition-colors dark:hover:text-emerald-400">
              Become a Seller
            </Link>
          </div>

          {/* Pill Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden flex-1 max-w-md items-center lg:flex"
            id="storefront-search-form"
          >
            <div className="relative flex w-full items-center rounded-full border border-zinc-200 bg-zinc-100/80 px-4 py-2 shadow-xs focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-600/20 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-within:border-emerald-500">
              <Search className="h-4 w-4 shrink-0 text-zinc-400 mr-2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
                id="search-input-field"
              />
            </div>
          </form>

          {/* Action Icons & User Account */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-emerald-400"
              aria-label="View Wishlist"
              id="header-wishlist-link"
            >
              <Heart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs">
                {wishlistData?.items?.length || 0}
              </span>
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-emerald-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-emerald-400"
              aria-label="View Shopping Cart"
              id="header-cart-link"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-xs">
                {cartData?.totalItems || 0}
              </span>
            </Link>

            {/* Divider */}
            <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

            {/* Account Area */}
            {isUserLoading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1.5 pr-2.5 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  id="user-menu-btn"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden max-w-[100px] truncate sm:inline">{user.name}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
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
                            Notifications
                          </Link>

                          <Link
                            href="/account/settings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <UserIcon className="h-4 w-4 text-blue-600" />
                            Account Settings
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
                            Notifications
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

                      {user.role === "ADMIN" && (
                        <>
                          <Link
                            href="/account/notifications"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Bell className="h-4 w-4 text-amber-600" />
                            Notifications
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
                            href="/"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Store className="h-4 w-4 text-emerald-600" />
                            View Store
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
                <Link
                  href="/login"
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  id="header-login-btn"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  id="header-register-btn"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Input bar */}
      <div className="border-t border-zinc-100 px-4 py-2 lg:hidden dark:border-zinc-800">
        <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 p-2 text-white"
            aria-label="Submit search"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className="border-t border-zinc-200 bg-white p-4 lg:hidden dark:border-zinc-800 dark:bg-zinc-950"
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
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-zinc-800 hover:text-emerald-600 dark:text-zinc-200 dark:hover:text-emerald-400"
              >
                All Products
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
                className="block text-emerald-600 dark:text-emerald-400"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
