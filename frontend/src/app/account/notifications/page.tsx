"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  useNotifications,
  useMarkReadMutation,
  useMarkAllReadMutation,
  useDeleteNotificationMutation,
} from "@/features/notifications/queries";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Trash2,
  CheckCheck,
  ShoppingBag,
  CreditCard,
  Package,
  Store,
  Info,
  Loader2,
} from "lucide-react";

function NotificationsContent() {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const { data, isLoading } = useNotifications(page, 10);
  const { mutate: markRead } = useMarkReadMutation();
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllReadMutation();
  const { mutate: deleteNotification } = useDeleteNotificationMutation();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const notifications = data?.notifications || [];
  const pagination = data?.pagination;

  const handleNotificationClick = (notification: (typeof notifications)[number]) => {
    if (!notification.isRead) {
      markRead(notification.id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    } else if (notification.title === "Seller reactivation requested") {
      router.push("/admin/sellers?status=SUSPENDED");
    } else if (notification.title === "New product submitted for approval") {
      router.push("/admin/products?status=PENDING");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ORDER":
        return <ShoppingBag className="h-4 w-4 text-emerald-600" />;
      case "PAYMENT":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case "PRODUCT":
        return <Package className="h-4 w-4 text-purple-600" />;
      case "SELLER":
        return <Store className="h-4 w-4 text-amber-600" />;
      default:
        return <Info className="h-4 w-4 text-zinc-500" />;
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Bell className="h-7 w-7 text-emerald-600" />
            <span>Notifications</span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            System updates, order statuses, and merchant alerts
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            type="button"
            disabled={isMarkingAll}
            onClick={() => markAllRead()}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 shrink-0"
          >
            {isMarkingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />}
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
        {notifications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Bell className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              No Notifications
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              You're all caught up! No notifications to show right now.
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-all cursor-pointer ${
                !item.isRead
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                  : "hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-white border border-zinc-200 shadow-xs dark:bg-zinc-800 dark:border-zinc-700 shrink-0 mt-0.5">
                  {getTypeIcon(item.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                      {item.title}
                    </h4>
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-zinc-400 block pt-0.5">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(item.id);
                }}
                className="text-zinc-400 hover:text-red-500 p-1 shrink-0"
                title="Delete notification"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            Previous
          </button>
          <span className="text-zinc-500">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function AccountNotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
