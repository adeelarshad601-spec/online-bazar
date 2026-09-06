"use client";

import {
  useAdminSellers,
  useApproveSellerMutation,
  useRejectSellerMutation,
  useSuspendSellerMutation,
  useReactivateSellerMutation,
} from "@/features/admin/sellers-queries";
import {
  useAdminPayouts,
  useUpdateAdminPayoutStatusMutation,
} from "@/features/admin/payouts-queries";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Store,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Search,
  Filter,
  CreditCard,
  Clock,
  ArrowRight,
} from "lucide-react";
import StatusFilter from "@/components/ui/StatusFilter";

function AdminPayoutsView() {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const { data, isLoading } = useAdminPayouts(selectedStatus || undefined);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateAdminPayoutStatusMutation();
  const [activeId, setActiveId] = useState<string | null>(null);

  const payouts = data?.payouts || [];

  const handleUpdate = (
    id: string,
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED"
  ) => {
    setActiveId(id);
    updateStatus(
      { id, status },
      {
        onSettled: () => setActiveId(null),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-emerald-500" />
            <span>Seller Payouts & Commissions</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Review and process withdrawal requests submitted by sellers across the marketplace
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 min-w-0">
          <StatusFilter
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
            options={[
              { value: "", label: "All Statuses" },
              { value: "PENDING", label: "PENDING" },
              { value: "PROCESSING", label: "PROCESSING" },
              { value: "COMPLETED", label: "COMPLETED" },
              { value: "FAILED", label: "FAILED" },
            ]}
            icon={<Filter className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Payouts Table */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {payouts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CreditCard className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              No Payout Requests Found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              No seller withdrawal requests match the selected status "{selectedStatus || "All"}".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Seller & Shop</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Net Payout</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {payouts.map((payout) => {
                  const isThisMutating = activeId === payout.id && isUpdating;
                  const shopName = payout.shop?.name || "Unlinked Shop";
                  const sellerName = payout.shop?.seller?.name || "Unknown Merchant";
                  const sellerEmail = payout.shop?.seller?.email || "";

                  return (
                    <tr key={payout.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-4 px-6">
                        <p className="font-bold text-zinc-900 dark:text-white">{shopName}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {sellerName} {sellerEmail && `(${sellerEmail})`}
                        </p>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-zinc-900 dark:text-white">
                        ${Number(payout.amount).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                        ${Number(payout.payoutAmount).toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            payout.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                              : payout.status === "PROCESSING"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300"
                              : payout.status === "PENDING"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300"
                          }`}
                        >
                          {payout.status === "PENDING" && <Clock className="h-3 w-3" />}
                          {payout.status === "COMPLETED" && <CheckCircle2 className="h-3 w-3" />}
                          {payout.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 text-[11px]">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {payout.status === "PENDING" && (
                            <>
                              <button
                                type="button"
                                disabled={isThisMutating}
                                onClick={() => handleUpdate(payout.id, "PROCESSING")}
                                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                              >
                                {isThisMutating ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <ArrowRight className="h-3 w-3" />
                                )}
                                <span>Process</span>
                              </button>
                              <button
                                type="button"
                                disabled={isThisMutating}
                                onClick={() => handleUpdate(payout.id, "FAILED")}
                                className="inline-flex items-center gap-1 rounded-xl bg-red-600/80 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 transition"
                              >
                                {isThisMutating ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {payout.status === "PROCESSING" && (
                            <>
                              <button
                                type="button"
                                disabled={isThisMutating}
                                onClick={() => handleUpdate(payout.id, "COMPLETED")}
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                              >
                                {isThisMutating ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3" />
                                )}
                                <span>Mark Completed</span>
                              </button>
                              <button
                                type="button"
                                disabled={isThisMutating}
                                onClick={() => handleUpdate(payout.id, "FAILED")}
                                className="inline-flex items-center gap-1 rounded-xl bg-red-600/80 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 transition"
                              >
                                {isThisMutating ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {payout.status === "COMPLETED" && (
                            <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Paid Out
                            </span>
                          )}

                          {payout.status === "FAILED" && (
                            <span className="text-[11px] font-semibold text-red-500">
                              Rejected / Failed
                            </span>
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

export default function AdminSellersPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const [selectedStatus, setSelectedStatus] = useState<string>(
    () => searchParams.get("status") || ""
  );
  const { data: sellers = [], isLoading } = useAdminSellers(selectedStatus || undefined);

  const { mutate: approveSeller, isPending: isApproving } = useApproveSellerMutation();
  const { mutate: rejectSeller, isPending: isRejecting } = useRejectSellerMutation();
  const { mutate: suspendSeller, isPending: isSuspending } = useSuspendSellerMutation();
  const { mutate: reactivateSeller, isPending: isReactivating } = useReactivateSellerMutation();

  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isMutating = isApproving || isRejecting || isSuspending || isReactivating;

  if (tab === "payouts") {
    return <AdminPayoutsView />;
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const filteredSellers = sellers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shop?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = (action: "approve" | "reject" | "suspend" | "reactivate", id: string) => {
    setActiveActionId(id);
    const options = { onSettled: () => setActiveActionId(null) };

    if (action === "approve") approveSeller(id, options);
    if (action === "reject") rejectSeller(id, options);
    if (action === "suspend") suspendSeller(id, options);
    if (action === "reactivate") reactivateSeller(id, options);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Store className="h-7 w-7 text-indigo-600" />
            <span>Seller & Application Management</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Review merchant applications, approve sellers, suspend or reactivate accounts
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 min-w-0">
          <StatusFilter
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
            options={[
              { value: "", label: "All Statuses" },
              { value: "PENDING", label: "PENDING" },
              { value: "APPROVED", label: "APPROVED" },
              { value: "REJECTED", label: "REJECTED" },
              { value: "SUSPENDED", label: "SUSPENDED" },
            ]}
            icon={<Filter className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by seller name, email or shop name..."
          className="w-full rounded-xl border border-zinc-300 bg-white pl-10 pr-4 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      {/* Sellers Table */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {filteredSellers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Store className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              No Seller Applications Found
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              No merchant records found matching status "{selectedStatus || "All"}".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Applicant / User</th>
                  <th className="py-3.5 px-4">Shop Name</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">Seller Status</th>
                  <th className="py-3.5 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredSellers.map((seller) => {
                  const isThisMutating = activeActionId === seller.id && isMutating;

                  return (
                    <tr key={seller.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-4 px-6">
                        <p className="font-bold text-zinc-900 dark:text-white">{seller.name}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{seller.email}</p>
                      </td>
                      <td className="py-4 px-4 font-semibold text-zinc-800 dark:text-zinc-200">
                        {seller.shop?.name || <span className="text-zinc-400 italic">No shop yet</span>}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {seller.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            seller.sellerStatus === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : seller.sellerStatus === "PENDING"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : seller.sellerStatus === "SUSPENDED"
                              ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          }`}
                        >
                          {seller.sellerStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {seller.sellerStatus === "PENDING" && (
                            <>
                              <button
                                type="button"
                                disabled={isThisMutating}
                                onClick={() => handleAction("approve", seller.id)}
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {isThisMutating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                disabled={isThisMutating}
                                onClick={() => handleAction("reject", seller.id)}
                                className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                {isThisMutating ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {seller.sellerStatus === "APPROVED" && (
                            <button
                              type="button"
                              disabled={isThisMutating}
                              onClick={() => handleAction("suspend", seller.id)}
                              className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50"
                            >
                              {isThisMutating ? <Loader2 className="h-3 w-3 animate-spin" /> : <AlertTriangle className="h-3 w-3" />}
                              <span>Suspend</span>
                            </button>
                          )}

                          {seller.sellerStatus === "SUSPENDED" && (
                            <button
                              type="button"
                              disabled={isThisMutating}
                              onClick={() => handleAction("reactivate", seller.id)}
                              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {isThisMutating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                              <span>Reactivate Account</span>
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
