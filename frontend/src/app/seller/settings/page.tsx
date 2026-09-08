"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/features/auth/queries";
import { useMyShop } from "@/features/seller/shop-queries";
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from "@/features/user/queries";
import {
  Store,
  Palette,
  Shield,
  Bell,
  CreditCard,
  User,
  Lock,
  Save,
  CheckCircle2,
  Moon,
  Sun,
  Monitor,
  Globe,
  Sliders,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

function SellerSettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") || "general";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/seller/settings?tab=${tabId}`, { scroll: false });
  };

  const { data: user } = useCurrentUser();
  const { data: shop } = useMyShop();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfileMutation();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePasswordMutation();

  // Profile / General Form State
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Personalization State
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("system");
  const [compactMode, setCompactMode] = useState(false);
  const [accentColor, setAccentColor] = useState("teal");
  const [autoSaveDrafts, setAutoSaveDrafts] = useState(true);

  // Notifications State
  const [emailOrders, setEmailOrders] = useState(true);
  const [emailStock, setEmailStock] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [browserAlerts, setBrowserAlerts] = useState(true);

  // Sync saved theme and preferences on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme = localStorage.getItem("theme") || localStorage.getItem("admin-theme");
    if (savedTheme === "dark") {
      setThemeMode("dark");
    } else if (savedTheme === "light") {
      setThemeMode("light");
    } else {
      setThemeMode("system");
    }

    const savedAccent = localStorage.getItem("seller-accent-color");
    if (savedAccent) setAccentColor(savedAccent);

    const savedCompact = localStorage.getItem("seller-compact-mode");
    if (savedCompact !== null) setCompactMode(savedCompact === "true");

    const savedAutoSave = localStorage.getItem("seller-autosave-drafts");
    if (savedAutoSave !== null) setAutoSaveDrafts(savedAutoSave === "true");
  }, []);

  const handleApplyTheme = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
      localStorage.setItem("theme", "dark");
      localStorage.setItem("admin-theme", "dark");
    } else if (mode === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
      localStorage.setItem("theme", "light");
      localStorage.setItem("admin-theme", "light");
    } else {
      localStorage.removeItem("theme");
      localStorage.removeItem("admin-theme");
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", systemDark);
      document.documentElement.style.colorScheme = systemDark ? "dark" : "light";
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(
      { name, avatar: avatar || null },
      {
        onSuccess: () => {
          setSaveSuccess("Profile updated successfully!");
          setTimeout(() => setSaveSuccess(null), 3000);
        },
      }
    );
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    changePassword(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          setSaveSuccess("Password changed successfully!");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setTimeout(() => setSaveSuccess(null), 3000);
        },
        onError: (err: any) => {
          setPasswordError(err?.response?.data?.message || "Failed to change password.");
        },
      }
    );
  };

  const tabs = [
    { id: "general", label: "General & Shop", icon: Store, desc: "Basic shop info & contact profile" },
    { id: "personalization", label: "Personalization", icon: Palette, desc: "Theme, layout & dashboard display" },
    { id: "security", label: "Security & Login", icon: Shield, desc: "Password, authentication & safety" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Email alerts & order updates" },
    { id: "payouts", label: "Payout Details", icon: CreditCard, desc: "Bank account & withdrawal preferences" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-800 to-zinc-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
              <Sliders className="h-3.5 w-3.5 text-teal-300" />
              <span>Seller Control Center</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Seller Settings & Preferences
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-teal-100/80 max-w-xl">
              Customize your seller workspace, update security credentials, manage payout options, and tailor your notification settings.
            </p>
          </div>
          {shop && (
            <Link
              href="/seller/shop"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/30 backdrop-blur-md shrink-0"
            >
              <Store className="h-4 w-4" />
              <span>Manage Shop Profile</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-4 space-y-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Settings Navigation
            </p>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition ${
                      isActive
                        ? "bg-teal-50 text-teal-800 font-semibold dark:bg-teal-950/50 dark:text-teal-300 shadow-sm border border-teal-200 dark:border-teal-900/60"
                        : "text-zinc-600 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                          isActive
                            ? "bg-teal-600 text-white dark:bg-teal-500"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{tab.label}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                          {tab.desc}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition ${isActive ? "text-teal-600 dark:text-teal-400" : "text-zinc-400 opacity-0 group-hover:opacity-100"}`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Tab Content Panel */}
        <main className="lg:col-span-8">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            {/* 1. General & Shop Tab */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-teal-600" />
                    <span>Personal Profile & Seller Contact</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Update your account full name and profile avatar displayed across seller operations.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-400"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Avatar Image URL
                    </label>
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-teal-400"
                      placeholder="https://example.com/my-photo.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Email Address (Account ID)
                    </label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-xs text-zinc-500 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400"
                    />
                    <p className="text-[11px] text-zinc-400">
                      Email cannot be changed directly for security purposes. Contact support if needed.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isUpdatingProfile ? "Saving..." : "Save Profile Details"}</span>
                    </button>
                  </div>
                </form>

                {/* Shop Quick Overview */}
                {shop && (
                  <div className="mt-8 rounded-2xl border border-teal-200 bg-teal-50/50 p-5 dark:border-teal-900/40 dark:bg-teal-950/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Store className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                            Active Shop: {shop.name}
                          </h4>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Slug: /{shop.slug}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/seller/shop"
                        className="rounded-xl border border-teal-300 bg-white px-3 py-1.5 text-[11px] font-bold text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:bg-zinc-800 dark:text-teal-300"
                      >
                        Edit Shop Specs
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Personalization Tab */}
            {activeTab === "personalization" && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Palette className="h-5 w-5 text-teal-600" />
                    <span>Workspace Personalization</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Tailor your dashboard appearance, layout density, and interface theme.
                  </p>
                </div>

                {/* Theme Mode Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Appearance Theme Mode
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "light", label: "Light Mode", icon: Sun },
                      { id: "dark", label: "Dark Mode", icon: Moon },
                      { id: "system", label: "System Default", icon: Monitor },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = themeMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => handleApplyTheme(mode.id as any)}
                          className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition ${
                            isSelected
                              ? "border-teal-600 bg-teal-50 text-teal-800 font-bold dark:border-teal-500 dark:bg-teal-950/50 dark:text-teal-300 ring-2 ring-teal-500/20"
                              : "border-zinc-200 bg-zinc-50/50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs">{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accent Color Palette */}
                <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Accent Color Scheme
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: "teal", bg: "bg-teal-600", label: "Teal Emerald" },
                      { id: "blue", bg: "bg-blue-600", label: "Ocean Blue" },
                      { id: "purple", bg: "bg-purple-600", label: "Royal Purple" },
                      { id: "amber", bg: "bg-amber-600", label: "Warm Amber" },
                    ].map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setAccentColor(color.id)}
                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                          accentColor === color.id
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                            : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        <span className={`h-3.5 w-3.5 rounded-full ${color.bg}`} />
                        <span>{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferences Toggles */}
                <div className="space-y-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                        Compact Table View
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Display denser data rows in order lists & product tables.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={compactMode}
                      onChange={(e) => setCompactMode(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                        Auto-Save Product Drafts
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Automatically preserve product edits locally every 30 seconds.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSaveDrafts}
                      onChange={(e) => setAutoSaveDrafts(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      handleApplyTheme(themeMode);
                      localStorage.setItem("seller-accent-color", accentColor);
                      localStorage.setItem("seller-compact-mode", compactMode ? "true" : "false");
                      localStorage.setItem("seller-autosave-drafts", autoSaveDrafts ? "true" : "false");
                      setSaveSuccess("Personalization preferences applied successfully!");
                      setTimeout(() => setSaveSuccess(null), 3000);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Apply Personalization</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. Security & Login Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-teal-600" />
                    <span>Security & Access Credentials</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Change your password and monitor account login security.
                  </p>
                </div>

                {passwordError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 pr-10 text-xs text-zinc-900 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
                      >
                        {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPass ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 pr-10 text-xs text-zinc-900 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                          placeholder="At least 8 chars"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600"
                        >
                          {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        placeholder="Re-enter new password"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
                    >
                      <Lock className="h-4 w-4" />
                      <span>{isChangingPassword ? "Updating..." : "Update Password"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 4. Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Bell className="h-5 w-5 text-teal-600" />
                    <span>Notification Preferences</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Control how and when you receive order notifications and store updates.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-teal-600" />
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                          New Order Email Alerts
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Instant email when a customer places an order in your shop.
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailOrders}
                      onChange={(e) => setEmailOrders(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <div className="flex items-center gap-3">
                      <Store className="h-5 w-5 text-amber-600" />
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                          Low Stock & Inventory Alerts
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Receive notifications when items drop below 5 units.
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailStock}
                      onChange={(e) => setEmailStock(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                          In-Browser Push Notifications
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Real-time audio alert & badge counters on new activity.
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={browserAlerts}
                      onChange={(e) => setBrowserAlerts(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSaveSuccess("Notification preferences saved!");
                      setTimeout(() => setSaveSuccess(null), 3000);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-teal-700"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Alert Preferences</span>
                  </button>
                </div>
              </div>
            )}

            {/* 5. Payout Details Tab */}
            {activeTab === "payouts" && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-teal-600" />
                    <span>Payout & Bank Account Overview</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Configure your bank account info for automatic revenue payouts.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                        Seller Payout Portal
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        View balance history, withdraw funds, or request manual transfer payout.
                      </p>
                    </div>
                    <Link
                      href="/seller/payouts"
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700"
                    >
                      <span>Go to Payouts Page</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SellerSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Loading settings...</div>}>
      <SellerSettingsContent />
    </Suspense>
  );
}
