"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useSellerStatus, useApplySellerMutation, useRequestSellerReactivationMutation } from "@/features/seller/queries";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Loader2, RefreshCw, Store } from "lucide-react";

function SellerStatusContent() {
  const { data: sellerStatus, isLoading, isError, refetch } = useSellerStatus();
  const { mutate: applySeller, isPending: isApplying } = useApplySellerMutation();
  const {
    mutate: requestReactivation,
    isPending: isRequestingReactivation,
    isSuccess: isReactivationRequested,
  } = useRequestSellerReactivationMutation();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-red-200 bg-red-50/50 p-10 dark:border-red-900/40 dark:bg-red-950/20 space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-red-900 dark:text-red-300">
            Failed to Load Status
          </h2>
          <p className="text-xs text-red-600 dark:text-red-400">
            Could not retrieve seller status details. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const status = sellerStatus?.sellerStatus;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white sm:text-3xl">
          Seller Application Status
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Track your application progress and store activation status
        </p>
      </div>

      {!status && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <Store className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            No Application Found
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            You haven't submitted a seller application yet.
          </p>
          <Link
            href="/seller/apply"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <span>Apply Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {status === "PENDING" && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-8 text-center shadow-xs dark:border-amber-900/40 dark:bg-amber-950/20 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
            <Clock className="h-7 w-7 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">
            Application Under Review
          </h3>
          <p className="text-xs text-amber-700 dark:text-amber-300 max-w-md mx-auto leading-relaxed">
            Your application to become a merchant is pending administrative review. We typically process seller requests within 24–48 hours.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-200/60 px-4 py-1.5 text-[11px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            <span>Status: PENDING</span>
          </div>
        </div>
      )}

      {status === "APPROVED" && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-8 text-center shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
            Application Approved!
          </h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto leading-relaxed">
            Congratulations! Your seller application has been approved by the admin team. You can now access your seller dashboard and start managing your store.
          </p>
          <Link
            href="/seller/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
          >
            <span>Go to Seller Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {status === "REJECTED" && (
        <div className="rounded-3xl border border-red-200 bg-red-50/60 p-8 text-center shadow-xs dark:border-red-900/40 dark:bg-red-950/20 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
            <XCircle className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-red-900 dark:text-red-200">
            Application Rejected
          </h3>
          <p className="text-xs text-red-700 dark:text-red-300 max-w-md mx-auto leading-relaxed">
            Regrettably, your seller application was not approved at this time. If you believe this is in error, please re-apply or contact platform support.
          </p>
          <button
            type="button"
            disabled={isApplying}
            onClick={() => applySeller()}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span>Re-Apply for Seller</span>
          </button>
        </div>
      )}

      {status === "SUSPENDED" && (
        <div className="rounded-3xl border border-zinc-300 bg-zinc-100 p-8 text-center shadow-xs dark:border-zinc-700 dark:bg-zinc-800 space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-zinc-500" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Seller Account Suspended
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            Your seller account has been suspended by administration. Send a reactivation request to the admin team for review. Only an admin can remove this restriction.
          </p>
          <button
            type="button"
            disabled={isRequestingReactivation || isReactivationRequested}
            onClick={() => requestReactivation()}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRequestingReactivation ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span>
              {isRequestingReactivation
                ? "Sending Request..."
                : isReactivationRequested
                  ? "Request Sent"
                  : "Request Reactivation"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function SellerStatusPage() {
  return (
    <ProtectedRoute>
      <SellerStatusContent />
    </ProtectedRoute>
  );
}
