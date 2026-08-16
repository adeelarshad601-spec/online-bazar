"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMyShop, useCreateShopMutation, useUpdateShopMutation } from "@/features/seller/shop-queries";
import { useEffect } from "react";
import Link from "next/link";
import { Store, Globe, Image as ImageIcon, FileText, Loader2, ExternalLink, Save } from "lucide-react";

const shopSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters"),

  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(100, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens only (e.g. my-awesome-shop)"
    ),

  logo: z
    .string()
    .trim()
    .url("Logo must be a valid URL")
    .or(z.literal(""))
    .optional(),

  banner: z
    .string()
    .trim()
    .url("Banner must be a valid URL")
    .or(z.literal(""))
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .or(z.literal(""))
    .optional(),
});

type ShopFormData = z.infer<typeof shopSchema>;

export default function SellerShopPage() {
  const { data: shop, isLoading } = useMyShop();
  const { mutate: createShop, isPending: isCreating } = useCreateShopMutation();
  const { mutate: updateShop, isPending: isUpdating } = useUpdateShopMutation();

  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      banner: "",
      description: "",
    },
  });

  useEffect(() => {
    if (shop) {
      setValue("name", shop.name || "");
      setValue("slug", shop.slug || "");
      setValue("logo", shop.logo || "");
      setValue("banner", shop.banner || "");
      setValue("description", shop.description || "");
    }
  }, [shop, setValue]);

  const nameValue = watch("name");
  // Auto generate slug if creating new shop
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("name", val);
    if (!shop) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setValue("slug", generatedSlug);
    }
  };

  const onSubmit = (data: ShopFormData) => {
    const payload = {
      name: data.name,
      slug: data.slug,
      logo: data.logo || undefined,
      banner: data.banner || undefined,
      description: data.description || undefined,
    };

    if (shop) {
      updateShop({ id: shop.id, payload });
    } else {
      createShop(payload);
    }
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Store className="h-7 w-7 text-emerald-600" />
            <span>{shop ? "Manage Shop Profile" : "Create Your Shop"}</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {shop
              ? "Update your store branding, description and slug"
              : "Set up your storefront details to start selling"}
          </p>
        </div>

        {shop && (
          <Link
            href={`/shops/${shop.id}`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 shrink-0"
          >
            <Globe className="h-4 w-4 text-emerald-600" />
            <span>View Live Storefront</span>
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
          </Link>
        )}
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-xs">
              General Details
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  {...register("name")}
                  onChange={handleNameChange}
                  placeholder="e.g. Acme Tech World"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                {errors.name && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Shop Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  {...register("slug")}
                  placeholder="acme-tech-world"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                {errors.slug && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Shop Description
              </label>
              <textarea
                rows={4}
                disabled={isSubmitting}
                {...register("description")}
                placeholder="Tell customers about your shop and the products you specialize in..."
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              {errors.description && (
                <p className="mt-1 text-[11px] text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Media Section */}
          <div className="space-y-4 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-emerald-600" />
              <span>Shop Branding & Media (Image URLs)</span>
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Logo URL
                </label>
                <input
                  type="url"
                  disabled={isSubmitting}
                  {...register("logo")}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                {errors.logo && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.logo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Banner URL
                </label>
                <input
                  type="url"
                  disabled={isSubmitting}
                  {...register("banner")}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
                {errors.banner && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.banner.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Shop Profile...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{shop ? "Save Changes" : "Create Shop"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
