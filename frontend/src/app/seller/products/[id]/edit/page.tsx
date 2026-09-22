"use client";

import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateProductMutation } from "@/features/seller/product-queries";
import { getSellerProductByIdApi } from "@/features/seller/product-api";
import { useCategories } from "@/features/products/queries";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ArrowLeft, Loader2, Save, AlertCircle, ImagePlus, X, Plus } from "lucide-react";

interface VariantRow {
  id?: string;
  name: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  stock: number;
}

const updateProductSchema = z.object({
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

  weight: z.number().min(0).optional().nullable(),
  length: z.number().min(0).optional().nullable(),
  width: z.number().min(0).optional().nullable(),
  height: z.number().min(0).optional().nullable(),

  categoryId: z.string().uuid("Please select a valid category"),

  variantColor: z.string().trim().max(80, "Color must be at most 80 characters").optional(),

  variantSize: z.string().trim().max(80, "Size must be at most 80 characters").optional(),
});

type EditProductFormData = z.infer<typeof updateProductSchema>;

function EditProductContent({ productId }: { productId: string }) {
  const router = useRouter();
  const { data: product, isLoading: isProductLoading, isError } = useQuery({
    queryKey: ["sellerProduct", productId],
    queryFn: () => getSellerProductByIdApi(productId),
    enabled: Boolean(productId),
  });
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { mutate: updateProduct, isPending: isSubmitting } = useUpdateProductMutation();
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [variantRows, setVariantRows] = useState<VariantRow[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditProductFormData>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      sku: "",
      price: 0,
      compareAtPrice: undefined,
      stock: 0,
      categoryId: "",
      variantColor: "",
      variantSize: "",
    },
  });

  useEffect(() => {
    if (product) {
      setImagePreviews(product.images?.map((image) => image.url) || []);

      const normalizedVariants = product.variants?.length
        ? product.variants.map((variant) => ({
            id: variant.id,
            name: variant.name || product.title,
            sku: variant.sku || `${product.sku}-1`,
            color:
              variant.options && typeof variant.options === "object" && !Array.isArray(variant.options)
                ? String(variant.options.color || "")
                : "",
            size:
              variant.options && typeof variant.options === "object" && !Array.isArray(variant.options)
                ? String(variant.options.size || "")
                : "",
            price: Number(variant.price ?? product.price ?? 0),
            stock: Number(variant.stock ?? 0),
          }))
        : [
            {
              name: product.title,
              sku: product.sku,
              color: "",
              size: "",
              price: Number(product.price || 0),
              stock: Number(product.stock || 0),
            },
          ];

      setVariantRows(normalizedVariants);
      setValue("title", product.title || "");
      setValue("slug", product.slug || "");
      setValue("description", product.description || "");
      setValue("sku", product.sku || "");
      setValue("price", Number(product.price || 0));
      setValue("compareAtPrice", product.compareAtPrice ? Number(product.compareAtPrice) : undefined);
      setValue("stock", product.stock || 0);
      setValue("weight", (product as any).weight ? Number((product as any).weight) : undefined);
      setValue("length", (product as any).length ? Number((product as any).length) : undefined);
      setValue("width", (product as any).width ? Number((product as any).width) : undefined);
      setValue("height", (product as any).height ? Number((product as any).height) : undefined);
      setValue("categoryId", product.categoryId || product.category?.id || "");
    }
  }, [product, setValue]);

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, 8);
    if (!files.length) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error("Unable to read image"));
            reader.readAsDataURL(file);
          })
      )
    ).then((newImages) => {
      setImagePreviews((current) => [...current, ...newImages].slice(0, 8));
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const addVariantRow = () => {
    setVariantRows((current) => {
      const nextIndex = current.length + 1;

      return [
        ...current,
        {
          name: product?.title || "",
          sku: `${product?.sku || "variant"}-${nextIndex}`,
          color: "",
          size: "",
          price: Number(product?.price || 0),
          stock: 0,
        },
      ];
    });
  };

  const updateVariantRow = <K extends keyof VariantRow>(
    index: number,
    field: K,
    value: VariantRow[K]
  ) => {
    setVariantRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row))
    );
  };

  const onSubmit = (data: EditProductFormData) => {
    updateProduct(
      {
        id: productId,
        payload: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          sku: data.sku,
          price: data.price,
          compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
          stock: data.stock,
          weight: data.weight !== undefined && data.weight !== null ? Number(data.weight) : undefined,
          length: data.length !== undefined && data.length !== null ? Number(data.length) : undefined,
          width: data.width !== undefined && data.width !== null ? Number(data.width) : undefined,
          height: data.height !== undefined && data.height !== null ? Number(data.height) : undefined,
          categoryId: data.categoryId,
          images: imagePreviews,
          variants: variantRows.map((row) => ({
            id: row.id,
            name: row.name || data.title,
            sku: row.sku || data.sku,
            price: Number(row.price || data.price),
            stock: Number(row.stock || 0),
            options: {
              ...(row.color ? { color: row.color } : {}),
              ...(row.size ? { size: row.size } : {}),
            },
          })),
        },
      },
      {
        onSuccess: () => {
          router.push("/seller/products");
        },
      }
    );
  };

  const isLoading = isProductLoading || isCategoriesLoading;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50/70 p-8 text-center space-y-4">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        <h2 className="text-lg font-bold text-red-900">Product Not Found</h2>
        <p className="text-xs text-red-700 max-w-sm mx-auto">
          We couldn't retrieve details for product ID {productId}.
        </p>
        <Link
          href="/seller/products"
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
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
            Edit Product
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Updating specifications for SKU: <strong>{product.sku}</strong>
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Product Images
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {imagePreviews.map((preview, index) => (
                <div key={`${preview}-${index}`} className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <img src={preview} alt={`Product preview ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {imagePreviews.length < 8 && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 text-center text-xs text-zinc-500 hover:border-emerald-500 hover:text-emerald-600 dark:border-zinc-700">
                  <ImagePlus className="mb-2 h-6 w-6" />
                  <span>Add image</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="sr-only" onChange={handleImagesChange} />
                </label>
              )}
            </div>
            <p className="text-[11px] text-zinc-500">Upload up to 8 images. The first image will be the primary product image.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                {...register("title")}
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
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              {errors.slug && (
                <p className="mt-1 text-[11px] text-red-500">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Variant / Size Availability
              </h3>
              <button
                type="button"
                onClick={addVariantRow}
                className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Size / Option
              </button>
            </div>

            <div className="space-y-3">
              {variantRows.map((row, index) => (
                <div
                  key={`${row.id ?? "new"}-${index}`}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/50"
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Label
                      </label>
                      <input
                        type="text"
                        value={row.name}
                        onChange={(event) => updateVariantRow(index, "name", event.target.value)}
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={row.sku}
                        onChange={(event) => updateVariantRow(index, "sku", event.target.value)}
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Color
                      </label>
                      <input
                        type="text"
                        value={row.color}
                        onChange={(event) => updateVariantRow(index, "color", event.target.value)}
                        placeholder="Black"
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Size
                      </label>
                      <input
                        type="text"
                        value={row.size}
                        onChange={(event) => updateVariantRow(index, "size", event.target.value)}
                        placeholder="M"
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Stock
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={row.stock}
                        onChange={(event) => updateVariantRow(index, "stock", Number(event.target.value || 0))}
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-zinc-500">
              Example: add separate rows for S, M, L, XL or different colors so customers can see what is available and what is sold out.
            </p>
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
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              {errors.compareAtPrice && (
                <p className="mt-1 text-[11px] text-red-500">{errors.compareAtPrice.message}</p>
              )}
            </div>
          </div>

          {/* Package Weight & Dimensions */}
          <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Package className="h-4 w-4 text-emerald-600" />
              Package & Shipping Weight
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  disabled={isSubmitting}
                  {...register("weight", { valueAsNumber: true })}
                  placeholder="e.g. 0.5"
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Length (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  disabled={isSubmitting}
                  {...register("length", { valueAsNumber: true })}
                  placeholder="Length"
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Width (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  disabled={isSubmitting}
                  {...register("width", { valueAsNumber: true })}
                  placeholder="Width"
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  disabled={isSubmitting}
                  {...register("height", { valueAsNumber: true })}
                  placeholder="Height"
                  className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                />
              </div>
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
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <EditProductContent productId={resolvedParams.id} />;
}
