"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Globe,
  Store,
  CreditCard,
  Truck,
  Shield,
  Bell,
  Mail,
  Save,
  CheckCircle2,
  Sliders,
  Sparkles,
  Lock,
  Database,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminGeneralSettingsPage() {
  const [siteName, setSiteName] = useState("Online Bazar");
  const [siteTagline, setSiteTagline] = useState("Your Premium Multi-Vendor E-Commerce Marketplace");
  const [supportEmail, setSupportEmail] = useState("support@onlinebazar.com");
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApproveSellers, setAutoApproveSellers] = useState(false);
  const [autoApproveProducts, setAutoApproveProducts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("General settings saved successfully!");
    }, 600);
  };

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
            <span>General Platform Configuration</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage global marketplace settings, branding, store policies, currencies, and automation controls.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      {/* Settings Sub-Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/settings/shipping"
          className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Shipping Settings
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Zones, rates & thresholds</p>
            </div>
          </div>
          <span className="text-zinc-400 group-hover:text-emerald-600 text-xs font-bold">→</span>
        </Link>

        <Link
          href="/admin/settings/payments"
          className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
                Payment Gateways
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">COD, Stripe & test mode</p>
            </div>
          </div>
          <span className="text-zinc-400 group-hover:text-blue-600 text-xs font-bold">→</span>
        </Link>

        <Link
          href="/admin/settings/roles"
          className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                Roles & Permissions
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Admin & Seller access</p>
            </div>
          </div>
          <span className="text-zinc-400 group-hover:text-indigo-600 text-xs font-bold">→</span>
        </Link>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Section 1: Marketplace Branding */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                1. Identity & Branding
              </h2>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Marketplace title, taglines, and public customer support contacts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Marketplace Title
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-bold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Support Email Address
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Marketplace Tagline
              </label>
              <input
                type="text"
                value={siteTagline}
                onChange={(e) => setSiteTagline(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Currency & Localization */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
            <div className="h-10 w-10 rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                2. Currency & Financial Standards
              </h2>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Default display currency formatting across product catalog and checkout
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-bold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Currency ISO Code
              </label>
              <input
                type="text"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-bold text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Vendor Automation Controls */}
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-200/80 pb-4 dark:border-zinc-800">
            <div className="h-10 w-10 rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center justify-center">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                3. Multi-Vendor Automation Controls
              </h2>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Automated seller onboarding, product moderation policies, and maintenance mode
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 cursor-pointer">
              <div>
                <span className="text-xs font-extrabold text-zinc-900 dark:text-white block">
                  Auto-Approve New Sellers
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                  Automatically approve vendor applications without manual KYC review
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoApproveSellers}
                onChange={(e) => setAutoApproveSellers(e.target.checked)}
                className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 cursor-pointer">
              <div>
                <span className="text-xs font-extrabold text-zinc-900 dark:text-white block">
                  Auto-Approve Vendor Products
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                  Automatically publish newly created seller products without admin moderation
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoApproveProducts}
                onChange={(e) => setAutoApproveProducts(e.target.checked)}
                className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 cursor-pointer">
              <div>
                <span className="text-xs font-extrabold text-amber-900 dark:text-amber-300 block">
                  Marketplace Maintenance Mode
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 block">
                  Temporarily disable store checkout for routine system upgrades
                </span>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="h-5 w-5 rounded text-amber-600 focus:ring-amber-500"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save General Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
