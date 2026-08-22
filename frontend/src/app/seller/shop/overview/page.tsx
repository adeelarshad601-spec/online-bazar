"use client";

import { useMyShop } from "@/features/seller/shop-queries";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, Pencil, Store } from "lucide-react";

export default function SellerShopOverviewPage() {
  const { data: shop, isLoading } = useMyShop();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-amber-50/70 p-10 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
        <h1 className="mt-4 text-xl font-bold text-amber-900 dark:text-amber-200">No Shop Created</h1>
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Create your shop profile to start selling products.</p>
        <Link href="/seller/shop" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-700">
          <Store className="h-4 w-4" />
          Create Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
            <Store className="h-7 w-7 text-emerald-600" />
            Shop Overview
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Review your storefront details and activity.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/seller/shop" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">
            <Pencil className="h-4 w-4" />
            Manage Profile
          </Link>
          <Link href={`/shops/${shop.id}`} target="_blank" className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            <ExternalLink className="h-4 w-4" />
            View Storefront
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          <p className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Status</p>
          <p className="mt-1 text-lg font-black text-emerald-900 dark:text-emerald-200">Active</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold text-zinc-500">Shop Name</p>
          <p className="mt-2 truncate text-lg font-black text-zinc-900 dark:text-white">{shop.name}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-semibold text-zinc-500">Shop Slug</p>
          <p className="mt-2 truncate text-lg font-black text-zinc-900 dark:text-white">/{shop.slug}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">About Your Shop</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{shop.description || "Add a description so customers know what your shop offers."}</p>
        <div className="mt-6 grid gap-3 border-t border-zinc-100 pt-5 text-xs text-zinc-500 dark:border-zinc-800 sm:grid-cols-2">
          <span>Logo: {shop.logo ? "Uploaded" : "Not uploaded"}</span>
          <span>Banner: {shop.banner ? "Uploaded" : "Not uploaded"}</span>
        </div>
      </div>
    </div>
  );
}
