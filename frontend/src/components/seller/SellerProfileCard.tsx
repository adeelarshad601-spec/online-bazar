"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { useCurrentUser, useLogout } from "@/features/auth/queries";
import { useSellerStatus } from "@/features/seller/queries";
import { useUnreadCount } from "@/features/notifications/queries";
import { useRouter } from "next/navigation";
import {
  User,
  Settings,
  LogOut,
  Gift,
  ChevronUp,
  Settings2,
  HelpCircle,
  Palette,
  Bell,
} from "lucide-react";
import { useState } from "react";

export default function SellerProfileCard() {
  const { data: user } = useCurrentUser();
  const { data: sellerStatus } = useSellerStatus();
  const { mutate: logout } = useLogout();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { data: unreadData } = useUnreadCount();

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isProfileOpen]);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push("/login");
      },
    });
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "S";
  const unreadCount = unreadData?.unreadCount || 0;

  const menuItems = [
    {
      icon: Palette,
      label: "Personalization",
      href: "/seller/settings?tab=personalization",
    },
    {
      icon: User,
      label: "Profile",
      href: "/account/settings?tab=profile",
    },
    {
      icon: Settings2,
      label: "Settings",
      href: "/seller/settings?tab=general",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/account/notifications",
    },
    {
      icon: HelpCircle,
      label: "Help",
      href: "/seller/help",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Collapsible Profile Section */}
      <div
        ref={profileMenuRef}
        className="relative rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 overflow-hidden"
      >
        {/* Profile Trigger Button */}
        <button
          type="button"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-700/50 text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-sm flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                userInitial
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                {user?.name || "Seller"}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {sellerStatus?.shop?.name || "Personal account"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isProfileOpen && unreadCount > 0 && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
            <ChevronUp
              className={`h-5 w-5 text-zinc-400 dark:text-zinc-500 transition-transform flex-shrink-0 ${
                isProfileOpen ? "" : "rotate-180"
              }`}
            />
          </div>
        </button>

        {/* Expanded Menu - Slides down from button */}
        {isProfileOpen && (
          <div className="border-t border-zinc-100 dark:border-zinc-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Menu Items */}
            <div className="space-y-1 p-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-emerald-50 dark:text-zinc-300 dark:hover:bg-zinc-700/50"
                  >
                    <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>{item.label}</span>
                    {item.label === "Notifications" && unreadCount > 0 && (
                      <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-black text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-100 dark:border-zinc-700" />

            {/* Logout Button */}
            <div className="p-2">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Plans Button */}
      <Link
        href="/seller/upgrade"
        className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 transition hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/20 dark:hover:bg-amber-950/40"
      >
        <div className="flex items-center gap-2 text-left">
          <Gift className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
              Upgrade Now
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              View Plans
            </p>
          </div>
        </div>
        <ChevronUp className="h-4 w-4 -rotate-90 text-amber-600 dark:text-amber-400 flex-shrink-0" />
      </Link>
    </div>
  );
}
