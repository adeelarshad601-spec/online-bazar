"use client";

import { useProducts } from "@/features/products/queries";
import { useUpdateProductStatusMutation } from "@/features/admin/products-queries";
import { useState } from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Loader2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export default function AdminProductsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: products = [], isLoading } = useProducts();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateProductStatusMutation();

  const [activeId, setActiveId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shop?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: any) => {
    setActiveId(id);
    updateStatus(
      { id, status: newStatus },
      {
        onSettled: () => setActiveId(null),
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Package className="h-7 w-7 text-indigo-600" />
            <span>Product Moderation Catalog</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Review vendor product submissions, approve listings, or change product status
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, SKU, or shop name..."
          className="w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-4 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      {/* Products Table */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              No Products Found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              No products matched your search or moderation filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-4">Vendor Shop</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Moderation Status</th>
                  <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredProducts.map((product) => {
                  const isThisUpdating = activeId === product.id && isUpdating;

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
                              className="font-bold text-zinc-900 dark:text-white hover:text-indigo-600 flex items-center gap-1.5"
                            >
                              <span>{product.title}</span>
                              <ExternalLink className="h-3 w-3 text-zinc-400" />
                            </Link>
                            <span className="text-[11px] font-mono text-zinc-400">SKU: {product.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-zinc-800 dark:text-zinc-200">
                        {product.shop?.name || "Independent"}
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-900 dark:text-white">
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            product.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : product.status === "PENDING"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          }`}
                        >
                          {product.status || "APPROVED"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {product.status !== "APPROVED" && (
                            <button
                              type="button"
                              disabled={isThisUpdating}
                              onClick={() => handleStatusChange(product.id, "APPROVED")}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {isThisUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                              <span>Approve</span>
                            </button>
                          )}

                          {product.status !== "REJECTED" && (
                            <button
                              type="button"
                              disabled={isThisUpdating}
                              onClick={() => handleStatusChange(product.id, "REJECTED")}
                              className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {isThisUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
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
