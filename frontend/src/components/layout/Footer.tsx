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
  ArrowRight,
  Store,
  Users,
  CreditCard,
  MessageCircle,
  Camera,
  Play,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      {/* Value Proposition Badges */}
      <div className="border-b border-zinc-100 bg-zinc-50/70 py-7 dark:border-zinc-800/80 dark:bg-zinc-900/45">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Fast Nationwide Delivery</h4>
                <p className="text-[11px] text-zinc-500">Tracked shipping on all orders</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Buyer Protection</h4>
                <p className="text-[11px] text-zinc-500">100% secure payment guarantee</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Easy Returns</h4>
                <p className="text-[11px] text-zinc-500">Hassle-free 7-day return policy</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
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

      {/* Seller Marketplace CTA */}
      <div className="border-b border-emerald-900/20 bg-zinc-950 text-white dark:border-emerald-500/20 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Grow your business with Online-Bazar</p>
              <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-400">
                Reach more customers, manage your shop, and build your brand on a trusted marketplace.
              </p>
            </div>
          </div>
          <Link
            href="/seller/apply"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-bold text-zinc-950 transition-colors hover:bg-emerald-400"
          >
            Start selling
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand Col */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-4">
            <Logo size="md" showSubtitle />
            <p className="max-w-sm text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              A trusted multi-vendor marketplace where customers discover great products and independent sellers grow their businesses.
            </p>
            <div className="space-y-2 text-xs font-medium text-zinc-500 dark:text-zinc-500">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span>Central Commerce District</span>
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
            <div className="flex items-center gap-2 pt-1">
              <Link href="https://facebook.com" aria-label="Online-Bazar on Facebook" className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40">
                <MessageCircle className="h-4 w-4" />
              </Link>
              <Link href="https://instagram.com" aria-label="Online-Bazar on Instagram" className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40">
                <Camera className="h-4 w-4" />
              </Link>
              <Link href="https://youtube.com" aria-label="Online-Bazar on YouTube" className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40">
                <Play className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
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
          <div className="lg:col-span-2">
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
              <li>
                <Link href="/support" className="hover:text-emerald-600 hover:underline">
                  Seller Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="lg:col-span-2">
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

          {/* Marketplace Promise */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Marketplace Promise
            </h3>
            <ul className="mt-4 space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Verified seller community</span>
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Secure checkout</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Buyer-first protection</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-6 text-[11px] text-zinc-500 sm:flex-row dark:border-zinc-800">
          <p >© {new Date().getFullYear()} Online-Bazar Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Developed by</span>
            <Link
              href="https://mradeel.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-600 transition-colors hover:text-emerald-500 hover:underline dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Adeel Arshad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
