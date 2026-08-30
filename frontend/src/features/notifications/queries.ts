import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationsApi,
  getUnreadCountApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
  NotificationsResponse,
} from "./api";
import { useCurrentUser } from "@/features/auth/queries";
import { toast } from "sonner";
import { handleApiError } from "@/lib/api/error";

export const NOTIFICATIONS_QUERY_KEY = ["notifications"];
export const UNREAD_COUNT_QUERY_KEY = ["unreadCount"];

export function useNotifications(page: number = 1, limit: number = 10) {
  const { data: user } = useCurrentUser();

  return useQuery<NotificationsResponse>({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, page, limit],
    queryFn: () => getNotificationsApi(page, limit),
    enabled: Boolean(user),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 15,
    refetchOnWindowFocus: true,
  });
}

export function useUnreadCount() {
  const { data: user } = useCurrentUser();

  return useQuery<{ unreadCount: number }>({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: getUnreadCountApi,
    enabled: Boolean(user),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 15,
    refetchOnWindowFocus: true,
  });
}

export function useMarkReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationReadApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });
}

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
      toast.success("All notifications marked as read");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotificationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
      toast.success("Notification deleted");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}
