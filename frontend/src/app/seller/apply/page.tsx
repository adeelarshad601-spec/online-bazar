"use client";

import { useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCurrentUser } from "@/features/auth/queries";
import { useSellerStatus, useApplySellerMutation } from "@/features/seller/queries";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, CheckCircle2, Clock, XCircle, Loader2, ArrowRight, Sparkles, RefreshCw } from "lucide-react";

function SellerApplyContent() {
  const { data: user } = useCurrentUser();
  const { data: sellerStatus, isLoading: isStatusLoading } = useSellerStatus();
  const { mutate: applySeller, isPending: isApplying, isSuccess: isApplySuccess } = useApplySellerMutation();
  const router = useRouter();
  const handleApply = () => {
    applySeller(undefined);
  };

  // Navigate to status page after successful application
  useEffect(() => {
    if (isApplySuccess) {
      const timer = setTimeout(() => {
        router.push("/seller/status");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isApplySuccess, router]);

  if (isStatusLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  // If already approved as seller
  if (user?.role === "SELLER" || sellerStatus?.sellerStatus === "APPROVED") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-10 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-4">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-300">
            You Are an Approved Seller!
          </h2>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
            Your seller account is active. You can manage your products, shop, and orders from your seller dashboard.
          </p>
          <Link
            href="/seller/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <span>Go to Seller Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // If already pending
  if (sellerStatus?.sellerStatus === "PENDING") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-10 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-4">
          <Clock className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-300">
            Application Under Review
          </h2>
          <p className="text-xs text-amber-700 dark:text-amber-400 max-w-md mx-auto">
            Your seller application is currently pending admin approval. You will be notified once reviewed.
          </p>
          <Link
            href="/seller/status"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-700"
          >
            <span>Check Application Status</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (sellerStatus?.sellerStatus === "REJECTED") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="space-y-4 rounded-3xl border border-red-200 bg-red-50/60 p-10 dark:border-red-900/40 dark:bg-red-950/20">
          <XCircle className="mx-auto h-12 w-12 text-red-600 dark:text-red-400" />
          <h2 className="text-xl font-bold text-red-900 dark:text-red-300">
            Application Rejected
          </h2>
          <p className="mx-auto max-w-md text-xs text-red-700 dark:text-red-400">
            Your seller application was not approved by the admin team. You can submit a new application for review.
          </p>
          <button
            type="button"
            disabled={isApplying}
            onClick={handleApply}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isApplying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Re-Apply for Seller</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <span>Become a Merchant</span>
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white sm:text-4xl">
          Apply to Become a Seller
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto">
          Join Online-Bazar to showcase your products, reach thousands of active buyers, and grow your business with our built-in vendor tools.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        <div className="space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            Applicant Information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Full Name</span>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{user?.name}</p>
            </div>
            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Email Address</span>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Seller Benefits
          </h4>
          <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Create & manage your customized online store</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Publish unlimited products with custom pricing and variants</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Track vendor orders and manage order statuses directly</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Request payout withdrawals and track earnings in real-time</span>
            </li>
          </ul>
        </div>

        <button
          type="button"
          disabled={isApplying}
          onClick={handleApply}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all"
        >
          {isApplying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting Application...</span>
            </>
          ) : (
            <>
              <Store className="h-4 w-4" />
              <span>Submit Seller Application</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function SellerApplyPage() {
  return (
    <ProtectedRoute>
      <SellerApplyContent />
    </ProtectedRoute>
  );
}
