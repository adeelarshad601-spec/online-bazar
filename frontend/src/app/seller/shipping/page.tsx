"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMyShop, useUpdateShopMutation } from "@/features/seller/shop-queries";
import { useEffect } from "react";
import Link from "next/link";
import { Truck, Globe, MapPin, Loader2, Save, ArrowLeft, CheckCircle2, ShieldCheck, Building2 } from "lucide-react";

const shippingOriginSchema = z.object({
  pickupAddress: z.string().trim().max(255).optional().or(z.literal("")),
  pickupCity: z.string().trim().min(2, "City is required").max(100),
  pickupState: z.string().trim().max(100).optional().or(z.literal("")),
  pickupCountry: z.string().trim().min(2, "Country is required").max(100),
  pickupPostalCode: z.string().trim().max(20).optional().or(z.literal("")),
});

type ShippingOriginFormData = z.infer<typeof shippingOriginSchema>;

export default function SellerShippingSettingsPage() {
  const { data: shop, isLoading } = useMyShop();
  const { mutate: updateShop, isPending: isUpdating } = useUpdateShopMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ShippingOriginFormData>({
    resolver: zodResolver(shippingOriginSchema),
    defaultValues: {
      pickupAddress: "",
      pickupCity: "Lahore",
      pickupState: "Punjab",
      pickupCountry: "Pakistan",
      pickupPostalCode: "",
    },
  });

  useEffect(() => {
    if (shop) {
      setValue("pickupAddress", (shop as any).pickupAddress || "");
      setValue("pickupCity", (shop as any).pickupCity || "Lahore");
      setValue("pickupState", (shop as any).pickupState || "Punjab");
      setValue("pickupCountry", (shop as any).pickupCountry || "Pakistan");
      setValue("pickupPostalCode", (shop as any).pickupPostalCode || "");
    }
  }, [shop, setValue]);

  const onSubmit = (data: ShippingOriginFormData) => {
    if (!shop) return;
    const payload = {
      name: shop.name,
      slug: shop.slug,
      pickupAddress: data.pickupAddress || undefined,
      pickupCity: data.pickupCity || undefined,
      pickupState: data.pickupState || undefined,
      pickupCountry: data.pickupCountry || undefined,
      pickupPostalCode: data.pickupPostalCode || undefined,
    };
    updateShop({ id: shop.id, payload });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Truck className="h-6 w-6" />
            </div>
            <span>Shipping Pickup Origin</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Configure your shop&apos;s warehouse/origin address. Customer shipping rates are calculated dynamically from this city.
          </p>
        </div>

        <Link
          href="/seller/shop"
          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Shop Profile</span>
        </Link>
      </div>

      {/* Info Card */}
      <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50/60 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-3">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <span>Multi-Vendor Shipping Calculation Engine</span>
        </div>
        <p className="text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
          Online-Bazar uses your pickup origin city to calculate exact delivery fees when customers place an order. If your shop is located in <strong>Lahore</strong> and a customer orders from <strong>Karachi</strong>, the system automatically applies the matched inter-city shipping zone rate for your shop order.
        </p>
      </div>

      {/* Main Settings Form Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-600" />
              <span>Warehouse / Dispatch Location</span>
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Pickup City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isUpdating}
                  {...register("pickupCity")}
                  placeholder="e.g. Lahore, Karachi, Faisalabad"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-bold text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                {errors.pickupCity && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.pickupCity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Pickup State / Province
                </label>
                <input
                  type="text"
                  disabled={isUpdating}
                  {...register("pickupState")}
                  placeholder="e.g. Punjab, Sindh, KPK"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Street / Warehouse Address
                </label>
                <input
                  type="text"
                  disabled={isUpdating}
                  {...register("pickupAddress")}
                  placeholder="e.g. Warehouse 14, Industrial Area"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Postal / Zip Code
                </label>
                <input
                  type="text"
                  disabled={isUpdating}
                  {...register("pickupPostalCode")}
                  placeholder="e.g. 54000"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isUpdating}
                {...register("pickupCountry")}
                placeholder="Pakistan"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-bold text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Origin Location...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Shipping Origin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
