import apiClient from "@/lib/api/client";
import { ApiResponse } from "@/types/auth";

export interface NotificationItem {
  id: string;
  userId: string;
  type: "ORDER" | "PAYMENT" | "PRODUCT" | "SELLER" | "SYSTEM";
  title: string;
  message: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getNotificationsApi(page: number = 1, limit: number = 10): Promise<NotificationsResponse> {
  const response = await apiClient.get<ApiResponse<NotificationsResponse>>("/notifications", {
    params: { page, limit },
  });
  return response.data.data!;
}

export async function getUnreadCountApi(): Promise<{ unreadCount: number }> {
  const response = await apiClient.get<ApiResponse<{ unreadCount: number }>>("/notifications/unread-count");
  return response.data.data!;
}

export async function markNotificationReadApi(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsReadApi(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}

export async function deleteNotificationApi(id: string): Promise<void> {
  await apiClient.delete(`/notifications/${id}`);
}
