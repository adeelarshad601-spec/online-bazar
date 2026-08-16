"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMyShop } from "@/features/seller/shop-queries";
import { useCreateProductMutation } from "@/features/seller/product-queries";
import { useCategories } from "@/features/products/queries";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react";

const productSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters long")
    .max(150, "Title must not exceed 150 characters"),

  slug: z
    .string()
    .trim()
    .min(2, "Slug is required")
    .max(180, "Slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens only"
    ),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters long"),

  sku: z
    .string()
    .trim()
    .min(2, "SKU is required")
    .max(100, "SKU is too long"),

  price: z.number().positive("Price must be greater than 0"),

  compareAtPrice: z
    .number()
    .positive("Compare price must be greater than 0")
    .optional(),

  stock: z.number().int().min(0, "Stock cannot be negative"),

  categoryId: z.string().uuid("Please select a valid category"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const { data: shop, isLoading: isShopLoading } = useMyShop();
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { mutate: createProduct, isPending: isSubmitting } = useCreateProductMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      sku: "",
      price: 0,
      compareAtPrice: undefined,
      stock: 0,
      categoryId: "",
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("title", val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setValue("slug", generatedSlug);
  };

  const onSubmit = (data: ProductFormData) => {
    if (!shop?.id) return;

    createProduct(
      {
        title: data.title,
        slug: data.slug,
        description: data.description,
        sku: data.sku,
        price: data.price,
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
        stock: data.stock,
        shopId: shop.id,
        categoryId: data.categoryId,
      },
      {
        onSuccess: () => {
          router.push("/seller/products");
        },
      }
    );
  };

  const isLoading = isShopLoading || isCategoriesLoading;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-8 text-center space-y-4">
        <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
        <h2 className="text-lg font-bold text-amber-900">Shop Profile Required</h2>
        <p className="text-xs text-amber-700 max-w-sm mx-auto">
          Please create a shop before adding products.
        </p>
        <Link
          href="/seller/shop"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-700"
        >
          <span>Create Shop</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <Link
          href="/seller/products"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
            Add New Product
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Publish a new product to your shop catalog
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                {...register("title")}
                onChange={handleTitleChange}
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              {errors.title && (
                <p className="mt-1 text-[11px] text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                {...register("slug")}
                placeholder="wireless-noise-cancelling-headphones"
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              {errors.slug && (
                <p className="mt-1 text-[11px] text-red-500">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                disabled={isSubmitting}
                {...register("categoryId")}
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-[11px] text-red-500">{errors.categoryId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                {...register("sku")}
                placeholder="HD-NC-001"
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              {errors.sku && (
                <p className="mt-1 text-[11px] text-red-500">{errors.sku.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                disabled={isSubmitting}
                {...register("stock", { valueAsNumber: true })}
                placeholder="50"
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              {errors.stock && (
                <p className="mt-1 text-[11px] text-red-500">{errors.stock.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                disabled={isSubmitting}
                {...register("price", { valueAsNumber: true })}
                placeholder="99.99"
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              {errors.price && (
                <p className="mt-1 text-[11px] text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Compare At Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                disabled={isSubmitting}
                {...register("compareAtPrice", { valueAsNumber: true })}
                placeholder="129.99"
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              {errors.compareAtPrice && (
                <p className="mt-1 text-[11px] text-red-500">{errors.compareAtPrice.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              disabled={isSubmitting}
              {...register("description")}
              placeholder="Provide a detailed overview of product features and specifications..."
              className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            {errors.description && (
              <p className="mt-1 text-[11px] text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Publishing Product...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Publish Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
