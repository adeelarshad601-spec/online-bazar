"use client";

import { useSellerPayoutDashboard, useSellerPayouts, useRequestPayoutMutation } from "@/features/seller/dashboard-queries";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

const payoutSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
});

type PayoutFormData = z.infer<typeof payoutSchema>;

export default function SellerPayoutsPage() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const { data: dashboard, isLoading: isDashboardLoading } = useSellerPayoutDashboard();
  const status = searchParams.get("status") || undefined;
  const { data: payoutsData, isLoading: isPayoutsLoading } = useSellerPayouts(page, 10, status);
  const { mutate: requestPayout, isPending: isRequesting } = useRequestPayoutMutation();

  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PayoutFormData>({
    resolver: zodResolver(payoutSchema),
    defaultValues: { amount: 0 },
  });

  const isLoading = isDashboardLoading || isPayoutsLoading;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const availableBalance = Number(dashboard?.balance || 0);

  const onSubmit = (data: PayoutFormData) => {
    requestPayout(data.amount, {
      onSuccess: () => {
        reset();
        setShowForm(false);
      },
    });
  };

  const payouts = payoutsData?.payouts || [];
  const pagination = payoutsData?.pagination;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-emerald-600" />
            <span>Payouts & Earnings</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track revenue payouts, available balance, and request funds withdrawal
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Request Payout</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Lifetime Earnings</span>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
            ${Number(dashboard?.totalEarnings || 0).toFixed(2)}
          </p>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-2">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Available Balance</span>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
            ${availableBalance.toFixed(2)}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Payout Requests Count</span>
          <p className="text-2xl font-black text-zinc-900 dark:text-white">
            {dashboard?.payoutRequests || 0}
          </p>
        </div>
      </div>

      {/* Request Payout Form Drawer */}
      {showForm && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Withdraw Earnings Request
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Enter the amount you wish to withdraw to your registered payout account. Maximum available: ${availableBalance.toFixed(2)}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-full sm:w-64">
              <input
                type="number"
                step="0.01"
                disabled={isRequesting}
                {...register("amount", { valueAsNumber: true })}
                placeholder="Enter amount (e.g. 50.00)"
                className="w-full rounded-xl border border-zinc-300 px-4 py-2 text-xs text-zinc-900 focus:border-emerald-500 focus:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              {errors.amount && (
                <p className="mt-1 text-[11px] text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isRequesting}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isRequesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                <span>Submit Request</span>
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payout History Table */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Payout History
          </h2>
        </div>

        {payouts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CreditCard className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              No Payout History
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              You haven't requested any payout withdrawals yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Payout ID</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Commission</th>
                  <th className="py-3.5 px-4">Net Payout</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="py-4 px-6 font-mono text-[11px] font-bold text-zinc-900 dark:text-white">
                      #{payout.id.slice(0, 8)}
                    </td>
                    <td className="py-4 px-4 font-semibold text-zinc-700 dark:text-zinc-300">
                      ${Number(payout.amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-zinc-500">
                      ${Number(payout.commission).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      ${Number(payout.payoutAmount).toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          payout.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : payout.status === "FAILED"
                            ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-500 text-[11px]">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              Previous
            </button>
            <span className="text-zinc-500">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
