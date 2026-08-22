import Image from "next/image";
import { ShopDetails } from "@/types/shop";
import { Store, ShieldCheck, Calendar, UserCheck, ShoppingBag } from "lucide-react";

interface ShopHeaderProps {
  shop: ShopDetails;
  totalProducts?: number;
}

export default function ShopHeader({ shop, totalProducts = 0 }: ShopHeaderProps) {
  const formattedDate = new Date(shop.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-900" id="seller-shop-header">
      {/* Banner Cover Area */}
      <div className="relative h-44 w-full bg-linear-to-r from-emerald-800 via-teal-800 to-zinc-900 sm:h-56">
        {shop.banner && (
          <Image
            src={shop.banner}
            alt={`${shop.name} banner`}
            fill
            priority
            className="object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Profile Info Overlay & Details */}
      <div className="relative px-6 pb-6 pt-0 sm:px-8">
        <div className="-mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Logo Avatar */}
          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-teal-100 text-teal-800 shadow-xl dark:border-zinc-900 dark:bg-teal-950 dark:text-teal-300">
            {shop.logo ? (
              <Image src={shop.logo} alt={shop.name} fill className="object-cover" />
            ) : (
              <Store className="h-12 w-12 stroke-[1.5]" />
            )}
          </div>

          {/* Stats Badge Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-xs dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
              <ShoppingBag className="h-4 w-4" />
              <span>{totalProducts} Products in Shop</span>
            </div>
          </div>
        </div>

        {/* Name & Metadata */}
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
              {shop.name}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Seller
            </span>
          </div>

          {shop.description && (
            <p className="max-w-3xl text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              {shop.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-1 dark:text-zinc-400">
            {shop.seller && (
              <div className="flex items-center gap-2">
                <div className="relative h-6 w-6 overflow-hidden rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
                  {shop.seller.avatar ? (
                    <Image src={shop.seller.avatar} alt={shop.seller.name} fill className="object-cover" />
                  ) : (
                    <UserCheck className="m-1 h-4 w-4 text-emerald-600" />
                  )}
                </div>
                <span>Owner: <strong className="text-zinc-700 dark:text-zinc-200">{shop.seller.name}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" />
              <span>Seller Since {formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
