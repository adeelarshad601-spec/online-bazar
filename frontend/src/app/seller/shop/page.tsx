"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMyShop, useCreateShopMutation, useUpdateShopMutation } from "@/features/seller/shop-queries";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Globe, Image as ImageIcon, FileText, Loader2, ExternalLink, Save, Upload, X, CheckCircle2 } from "lucide-react";

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

  logoFile: z
    .instanceof(File)
    .optional(),

  bannerFile: z
    .instanceof(File)
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Description is too long")
    .or(z.literal(""))
    .optional(),
});

type ShopFormData = z.infer<typeof shopSchema>;

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Unable to read image file"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Invalid image file"));
      image.onload = () => {
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Unable to process image file"));
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

export default function SellerShopPage() {
  const { data: shop, isLoading } = useMyShop();
  const { mutate: createShop, isPending: isCreating } = useCreateShopMutation();
  const { mutate: updateShop, isPending: isUpdating } = useUpdateShopMutation();

  const isSubmitting = isCreating || isUpdating;

  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

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
      description: "",
    },
  });

  useEffect(() => {
    if (shop) {
      setValue("name", shop.name || "");
      setValue("slug", shop.slug || "");
      setValue("description", shop.description || "");
      if (shop.logo) setLogoPreview(shop.logo);
      if (shop.banner) setBannerPreview(shop.banner);
    }
  }, [shop, setValue]);

  const nameValue = watch("name");
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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("logoFile", file);
      fileToDataUrl(file).then(setLogoPreview).catch(() => setLogoPreview(""));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("bannerFile", file);
      fileToDataUrl(file).then(setBannerPreview).catch(() => setBannerPreview(""));
    }
  };

  const clearLogoPreview = () => {
    setLogoPreview("");
    setValue("logoFile", undefined);
  };

  const clearBannerPreview = () => {
    setBannerPreview("");
    setValue("bannerFile", undefined);
  };

  const onSubmit = async (data: ShopFormData) => {
    let logoBase64: string | undefined;
    let bannerBase64: string | undefined;

    if (data.logoFile) {
      logoBase64 = await fileToDataUrl(data.logoFile);
    }

    if (data.bannerFile) {
      bannerBase64 = await fileToDataUrl(data.bannerFile);
    }

    const payload = {
      name: data.name,
      slug: data.slug,
      logo: logoBase64 || logoPreview || undefined,
      banner: bannerBase64 || bannerPreview || undefined,
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

      {shop && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="font-bold text-emerald-900 dark:text-emerald-200">Shop is active</p>
            <p className="text-emerald-700 dark:text-emerald-300">This account already has one shop: {shop.name}</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-xs">
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
            <h3 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-emerald-600" />
              <span>Shop Branding & Media (File Upload)</span>
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3">
                  Shop Logo
                </label>
                <div className="space-y-3">
                  {logoPreview && (
                    <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearLogoPreview}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center w-full rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-zinc-50 dark:bg-zinc-800/50 p-6 cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-5 w-5 text-zinc-400" />
                      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Click to upload or drag image
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                        PNG, JPG, GIF up to 10MB
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isSubmitting}
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3">
                  Shop Banner
                </label>
                <div className="space-y-3">
                  {bannerPreview && (
                    <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearBannerPreview}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center justify-center w-full rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors bg-zinc-50 dark:bg-zinc-800/50 p-6 cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-5 w-5 text-zinc-400" />
                      <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                        Click to upload or drag image
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-500">
                        PNG, JPG, GIF up to 10MB
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isSubmitting}
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                  </label>
                </div>
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
