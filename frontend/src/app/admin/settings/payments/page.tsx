"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Settings,
  DollarSign,
  Lock,
  RefreshCw,
  Sliders,
  BadgeDollarSign,
  ArrowRight,
} from "lucide-react";

export default function AdminPaymentSettingsPage() {
  const [testModeEnabled, setTestModeEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [defaultCommission, setDefaultCommission] = useState("10.0");

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            <Settings className="h-4 w-4" />
            <span>Platform Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-7 w-7 text-emerald-500" />
            <span>Payment Gateways & Financial Settings</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Configure payment methods, test simulation gateway, platform commission rates, and seller payout rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <Zap className="h-3.5 w-3.5" />
            Test Mode Active
          </span>
        </div>
      </div>

      {/* Grid Section 1: Active Test Payment Provider */}
      <div className="rounded-3xl border border-indigo-200/80 bg-indigo-50/40 p-6 sm:p-8 shadow-xs dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                  Test Payment Simulation Gateway
                </h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Operational
                </span>
              </div>
              <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Safe development mode for simulating payment success/failure without real monetary transactions
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={testModeEnabled}
              onChange={(e) => setTestModeEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-zinc-600 peer-checked:bg-emerald-600" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="rounded-2xl border border-indigo-200/60 bg-white p-4 dark:border-indigo-900/30 dark:bg-zinc-900 space-y-1">
            <span className="text-zinc-500 dark:text-zinc-400 font-semibold block text-[11px]">Provider Architecture</span>
            <span className="font-bold text-zinc-900 dark:text-white block">TestPaymentProvider</span>
            <span className="text-[10px] text-zinc-500 block">Replaceable gateway interface</span>
          </div>

          <div className="rounded-2xl border border-indigo-200/60 bg-white p-4 dark:border-indigo-900/30 dark:bg-zinc-900 space-y-1">
            <span className="text-zinc-500 dark:text-zinc-400 font-semibold block text-[11px]">Commission Splitting</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block">10% Admin / 90% Seller</span>
            <span className="text-[10px] text-zinc-500 block">Calculated dynamically per sale</span>
          </div>

          <div className="rounded-2xl border border-indigo-200/60 bg-white p-4 dark:border-indigo-900/30 dark:bg-zinc-900 space-y-1">
            <span className="text-zinc-500 dark:text-zinc-400 font-semibold block text-[11px]">Idempotency Guard</span>
            <span className="font-bold text-zinc-900 dark:text-white block">Active</span>
            <span className="text-[10px] text-zinc-500 block">Prevents duplicate commission</span>
          </div>
        </div>
      </div>

      {/* Grid Section 2: Supported Payment Methods */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
        <div className="border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
          <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
            Supported Checkout Payment Methods
          </h2>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Configure payment options offered to customers at checkout
          </p>
        </div>

        <div className="space-y-4">
          {/* Method 1: Credit / Debit Card */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                    Credit / Debit Card (Stripe Simulated Mode)
                  </h3>
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase">
                    Card
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Accept Visa, Mastercard, AMEX with test simulation trigger on checkout completion page
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cardEnabled}
                onChange={(e) => setCardEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-zinc-600 peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Method 2: Cash on Delivery */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                    Cash on Delivery (COD)
                  </h3>
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
                    COD
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Customer pays cash upon delivery; status updates to COMPLETED on order delivery
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-zinc-600 peer-checked:bg-emerald-600" />
            </label>
          </div>
        </div>
      </div>

      {/* Grid Section 3: Commission & Payout Policy Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Commission Settings */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <BadgeDollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Platform Commission Rate
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Default platform revenue share percentage
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Default Commission Rate (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={defaultCommission}
                  onChange={(e) => setDefaultCommission(e.target.value)}
                  className="w-32 rounded-xl border border-zinc-300 px-3.5 py-2 text-xs font-bold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="font-bold text-zinc-500">% per successful sale</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
              Dynamic rates from active <strong>Seller Plans</strong> override this default if assigned.
            </p>
          </div>
        </div>

        {/* Seller Payout Rules */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Seller Payout Management
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Review & process vendor withdrawal requests
                </p>
              </div>
            </div>

            <Link
              href="/admin/sellers?tab=payouts"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>Manage Payouts</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span>Payout Status Flow:</span>
              <span className="font-bold text-zinc-900 dark:text-white">PENDING → PROCESSING → COMPLETED</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
              <span>Available Balance Rule:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Delivered Paid Orders Only</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Pending Earnings Rule:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">Held Until Order Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
