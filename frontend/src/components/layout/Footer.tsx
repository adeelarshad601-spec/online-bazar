import Link from "next/link";
import Logo from "@/components/ui/logo";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Mail,
  Phone,
  MapPin,
  Heart,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      {/* Value Proposition Badges */}
      <div className="border-b border-zinc-100 bg-zinc-50/50 py-8 dark:border-zinc-800/80 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Fast Nationwide Delivery</h4>
                <p className="text-[11px] text-zinc-500">Tracked shipping on all orders</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Buyer Protection</h4>
                <p className="text-[11px] text-zinc-500">100% secure payment guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Easy Returns</h4>
                <p className="text-[11px] text-zinc-500">Hassle-free 7-day return policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Dedicated Support</h4>
                <p className="text-[11px] text-zinc-500">24/7 customer assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" showSubtitle />
            <p className="max-w-sm text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Online-Bazar is a premier multi-vendor e-commerce marketplace connecting thousands of local sellers with millions of customers worldwide.
            </p>
            <div className="space-y-2 text-xs font-medium text-zinc-500">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>Marketplace Headquarters, Central Commerce District</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-600" />
                <span>+1 800-ONLINE-BAZAR</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600" />
                <span>support@onlinebazar.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Customer Center
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/products" className="hover:text-emerald-600 hover:underline">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-emerald-600 hover:underline">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-emerald-600 hover:underline">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-emerald-600 hover:underline">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link href="/account/notifications" className="hover:text-emerald-600 hover:underline">
                  Notifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Seller Portal Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Seller Portal
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/seller/apply" className="font-semibold text-emerald-600 hover:underline dark:text-emerald-400">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/seller" className="hover:text-emerald-600 hover:underline">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/seller/plans" className="hover:text-emerald-600 hover:underline">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/shops" className="hover:text-emerald-600 hover:underline">
                  All Seller Shops
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Top Categories
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link href="/products?category=Electronics" className="hover:text-emerald-600 hover:underline">
                  Electronics & Gadgets
                </Link>
              </li>
              <li>
                <Link href="/products?category=Fashion" className="hover:text-emerald-600 hover:underline">
                  Fashion & Apparel
                </Link>
              </li>
              <li>
                <Link href="/products?category=Home" className="hover:text-emerald-600 hover:underline">
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link href="/products?category=Beauty" className="hover:text-emerald-600 hover:underline">
                  Beauty & Personal Care
                </Link>
              </li>
              <li>
                <Link href="/products?category=Sports" className="hover:text-emerald-600 hover:underline">
                  Sports & Outdoors
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-6 text-xs text-zinc-500 sm:flex-row dark:border-zinc-800">
          <p>© {new Date().getFullYear()} Online-Bazar Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
            <span>for Multi-Vendor Commerce</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
