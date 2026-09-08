"use client";

import { useAdminProducts, useUpdateProductStatusMutation } from "@/features/admin/products-queries";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Loader2,
  ExternalLink,
  MoreHorizontal,
  Eye,
  MessageSquareWarning,
  ChevronLeft,
  ChevronRight,
  Check,
  Boxes,
  Clock3,
  ShieldCheck,
  Ban,
} from "lucide-react";

const PAGE_SIZES = [10, 25, 50];

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get("status") || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [quickMenuId, setQuickMenuId] = useState<string | null>(null);
  const [quickMenuPosition, setQuickMenuPosition] = useState({ top: 12, left: 12 });
  const [revisionProductId, setRevisionProductId] = useState<string | null>(null);
  const [revisionNote, setRevisionNote] = useState("");

  const { data: products = [], isLoading } = useAdminProducts();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateProductStatusMutation();

  const [activeId, setActiveId] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const pendingApproval = products.filter((product) => product.status === "PENDING").length;
    const approved = products.filter((product) => product.status === "APPROVED").length;
    const rejected = products.filter((product) => product.status === "REJECTED").length;

    return { totalProducts, pendingApproval, approved, rejected };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const sku = (p.sku || "").toLowerCase();
      const shopName = (p.shop?.name || "").toLowerCase();
      const matchesSearch =
        title.includes(searchQuery.toLowerCase()) ||
        sku.includes(searchQuery.toLowerCase()) ||
        shopName.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter ? p.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, pageSize, safeCurrentPage]);

  const visibleSelectedCount = paginatedProducts.filter((product) => selectedIds.includes(product.id)).length;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const handleStatusChange = (id: string, newStatus: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED") => {
    setActiveId(id);
    updateStatus(
      { id, status: newStatus },
      {
        onSettled: () => {
          setActiveId(null);
          setQuickMenuId(null);
        },
      }
    );
  };

  const handleBulkUpdate = (newStatus: "APPROVED" | "REJECTED") => {
    if (!selectedIds.length) return;

    selectedIds.forEach((id) => {
      setActiveId(id);
      updateStatus(
        { id, status: newStatus },
        {
          onSettled: () => {
            setActiveId(null);
          },
        }
      );
    });

    setSelectedIds([]);
  };

  const handleRevisionSubmit = () => {
    if (!revisionProductId) return;

    setActiveId(revisionProductId);
    updateStatus(
      { id: revisionProductId, status: "PENDING", feedback: revisionNote.trim() },
      {
        onSettled: () => {
          setActiveId(null);
          setRevisionProductId(null);
          setRevisionNote("");
          setQuickMenuId(null);
        },
      }
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = paginatedProducts.map((product) => product.id);
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id));

    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const statusSummary = [
    {
      label: "Total Products",
      value: metrics.totalProducts,
      accent: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400",
      icon: Boxes,
    },
    {
      label: "Pending Approval",
      value: metrics.pendingApproval,
      accent: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
      icon: Clock3,
    },
    {
      label: "Approved",
      value: metrics.approved,
      accent: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
      icon: ShieldCheck,
    },
    {
      label: "Rejected",
      value: metrics.rejected,
      accent: "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400",
      icon: Ban,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Package className="h-7 w-7 text-indigo-600" />
            <span>Product Moderation Catalog</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Review vendor product submissions, approve listings, or request revisions with actionable feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statusSummary.map(({ label, value, accent, icon: Icon }) => (
          <div key={label} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{label}</span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${accent}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-2xl font-black text-zinc-900 dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, SKU, or shop name..."
              className="w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-4 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkUpdate("APPROVED")}
              disabled={!selectedIds.length}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Bulk Approve
            </button>
            <button
              type="button"
              onClick={() => handleBulkUpdate("REJECTED")}
              disabled={!selectedIds.length}
              className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="h-3.5 w-3.5" />
              Bulk Reject
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No Products Found</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              No products matched your search or moderation filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">
                    <input
                      type="checkbox"
                      checked={paginatedProducts.length > 0 && paginatedProducts.every((product) => selectedIds.includes(product.id))}
                      onChange={toggleSelectAllVisible}
                      className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                      aria-label="Select visible products"
                    />
                  </th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Vendor Shop</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Moderation Status</th>
                  <th className="py-3.5 px-6 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {paginatedProducts.map((product) => {
                  const isThisUpdating = activeId === product.id && isUpdating;
                  const isSelected = selectedIds.includes(product.id);

                  return (
                    <tr key={product.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(product.id)}
                          className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                          aria-label={`Select ${product.title}`}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                            {product.images?.[0]?.url ? (
                              <img src={product.images[0].url} alt={product.title} className="h-full w-full object-cover" />
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
                              : product.status === "REJECTED"
                              ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {product.status || "APPROVED"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="relative flex items-center justify-end">
                          <button
                            type="button"
                            onClick={(event) => {
                              if (quickMenuId === product.id) {
                                setQuickMenuId(null);
                                return;
                              }

                              const buttonRect = event.currentTarget.getBoundingClientRect();
                              const menuHeight = 270;
                              const menuWidth = 256;
                              const spaceAbove = buttonRect.top - 12;
                              const top =
                                spaceAbove >= menuHeight
                                  ? buttonRect.top - menuHeight
                                  : Math.min(window.innerHeight - menuHeight - 12, buttonRect.bottom + 8);

                              setQuickMenuPosition({
                                top: Math.max(12, top),
                                left: Math.min(window.innerWidth - menuWidth - 12, Math.max(12, buttonRect.right - menuWidth)),
                              });
                              setQuickMenuId(product.id);
                            }}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                              quickMenuId === product.id
                                ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"
                                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                            }`}
                            aria-label={`Open quick actions for ${product.title}`}
                            aria-expanded={quickMenuId === product.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>

                          {quickMenuId === product.id && (
                            <div
                              style={{ top: quickMenuPosition.top, left: quickMenuPosition.left }}
                              className="fixed z-[100] w-64 origin-bottom-right rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-[0_14px_35px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-white/5"
                            >
                              <div className="flex items-center justify-between border-b border-zinc-100 px-2.5 pb-2 pt-1 dark:border-zinc-800">
                                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">Product actions</span>
                                <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                  {product.status || "APPROVED"}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickMenuId(null);
                                  window.open(`/products/${product.id}`, "_blank", "noopener,noreferrer");
                                }}
                                className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[11px] font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                              >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                                  <Eye className="h-3.5 w-3.5" />
                                </span>
                                <span>View / Preview Item</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setQuickMenuId(null);
                                  setRevisionProductId(product.id);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[11px] font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                              >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
                                  <MessageSquareWarning className="h-3.5 w-3.5" />
                                </span>
                                <span>Request Revision with Feedback</span>
                              </button>

                              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

                              <button
                                type="button"
                                onClick={() => handleStatusChange(product.id, "APPROVED")}
                                disabled={isThisUpdating}
                                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                              >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </span>
                                <span>Approve product</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(product.id, "REJECTED")}
                                disabled={isThisUpdating}
                                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-[11px] font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40"
                              >
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/50">
                                  <XCircle className="h-3.5 w-3.5" />
                                </span>
                                <span>Reject product</span>
                              </button>
                            </div>
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

      <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-xl border border-zinc-300 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-700 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={safeCurrentPage === 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-bold ${
                page === safeCurrentPage
                  ? "bg-indigo-600 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safeCurrentPage === totalPages}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {revisionProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Request Revision</h3>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                Add feedback for the seller and send the item back for updates.
              </p>
            </div>

            <textarea
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
              rows={4}
              placeholder="Explain the issue and requested improvements..."
              className="w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRevisionProductId(null);
                  setRevisionNote("");
                }}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevisionSubmit}
                disabled={!revisionNote.trim() || isUpdating}
                className="rounded-xl bg-amber-500 px-3 py-2 text-[11px] font-bold text-white hover:bg-amber-600"
              >
                Send Revision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
