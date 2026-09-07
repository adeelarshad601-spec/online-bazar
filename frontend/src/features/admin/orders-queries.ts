import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminOrdersApi, updateAdminOrderStatusApi, processAdminOrderRefundApi, AdminOrdersResponse } from "./orders-api";
import { useCurrentUser } from "@/features/auth/queries";
import { toast } from "sonner";
import { handleApiError } from "@/lib/api/error";
import { ADMIN_STATS_QUERY_KEY } from "./dashboard-queries";

export const ADMIN_ORDERS_QUERY_KEY = ["adminOrders"];

export function useAdminOrders(page: number = 1, limit: number = 10, status?: string) {
  const { data: user } = useCurrentUser();

  return useQuery<AdminOrdersResponse>({
    queryKey: [...ADMIN_ORDERS_QUERY_KEY, page, limit, status],
    queryFn: () => getAdminOrdersApi(page, limit, status),
    enabled: Boolean(user && user.role === "ADMIN"),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateAdminOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" }) =>
      updateAdminOrderStatusApi(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY });
      toast.success(`Order status updated to ${data.status}`);
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useProcessAdminOrderRefundMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason, deductShipping = true }: { id: string; reason?: string; deductShipping?: boolean }) =>
      processAdminOrderRefundApi(id, { reason, deductShipping }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order return & refund processed successfully!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

