"use client";

import { useMyShop } from "@/features/seller/shop-queries";
import { useShopProducts, useDeleteProductMutation } from "@/features/seller/product-queries";
import Link from "next/link";
import { useState } from "react";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default function SellerProductsPage() {
  const { data: shop, isLoading: isShopLoading } = useMyShop();
  const { data: productsData, isLoading: isProductsLoading } = useShopProducts(shop?.id);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProductMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isLoading = isShopLoading || isProductsLoading;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-8 text-center dark:border-amber-900/40 dark:bg-amber-950/20 space-y-4">
        <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
        <h2 className="text-lg font-bold text-amber-900 dark:text-amber-300">
          Shop Profile Required
        </h2>
        <p className="text-xs text-amber-700 dark:text-amber-400 max-w-sm mx-auto">
          You must create a shop profile before adding or managing products.
        </p>
        <Link
          href="/seller/shop"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-700"
        >
          <span>Create Shop Profile</span>
        </Link>
      </div>
    );
  }

  const products = productsData?.products || [];
  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteProduct(id, {
      onSuccess: () => setDeletingId(null),
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Package className="h-7 w-7 text-emerald-600" />
            <span>Product Catalog</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage product listings, inventory stock, pricing and status
          </p>
        </div>

        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title or SKU..."
            className="w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-4 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              No Products Found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              {searchQuery
                ? "No products matched your search criteria."
                : "You haven't added any products to your shop catalog yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredProducts.map((product) => {
                  const isConfirmingDelete = deletingId === product.id;

                  return (
                    <tr key={product.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-zinc-400" />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/products/${product.id}`}
                              target="_blank"
                              className="font-bold text-zinc-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5"
                            >
                              <span>{product.title}</span>
                              <ExternalLink className="h-3 w-3 text-zinc-400" />
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                        {product.sku}
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-900 dark:text-white">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-semibold ${
                            product.stock > 0
                              ? "text-zinc-700 dark:text-zinc-300"
                              : "text-red-500 font-bold"
                          }`}
                        >
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            product.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : product.status === "PENDING"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          }`}
                        >
                          {product.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                          {product.status === "PENDING" && <Clock className="h-3 w-3" />}
                          {product.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                          <span>{product.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isConfirmingDelete ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] text-red-600 font-semibold">Delete?</span>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDelete(product.id)}
                              className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => setDeletingId(null)}
                              className="rounded-lg bg-zinc-200 px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/seller/products/${product.id}/edit`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                              title="Edit product"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeletingId(product.id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400"
                              title="Delete product"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
