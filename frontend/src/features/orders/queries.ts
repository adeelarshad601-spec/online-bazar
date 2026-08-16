import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomerOrdersApi,
  getOrderByIdApi,
  getPaymentForOrderApi,
  cancelOrderApi,
  CustomerOrdersData,
  OrderDetails,
  OrderPayment,
} from "./api";
import { useCurrentUser } from "@/features/auth/queries";
import { toast } from "sonner";

export const ORDERS_QUERY_KEY = ["orders"];

export function useCustomerOrders(page: number = 1, limit: number = 10) {
  const { data: user } = useCurrentUser();

  return useQuery<CustomerOrdersData>({
    queryKey: [...ORDERS_QUERY_KEY, "list", page, limit],
    queryFn: async () => {
      const res = await getCustomerOrdersApi(page, limit);
      return res.data;
    },
    enabled: Boolean(user && user.role === "CUSTOMER"),
    staleTime: 1000 * 60 * 2,
  });
}

export function useOrderDetails(orderId: string | null) {
  const { data: user } = useCurrentUser();

  return useQuery<OrderDetails>({
    queryKey: [...ORDERS_QUERY_KEY, orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID is required");
      const res = await getOrderByIdApi(orderId);
      return res.data;
    },
    enabled: Boolean(user && orderId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function usePaymentForOrder(orderId: string | null) {
  const { data: user } = useCurrentUser();

  return useQuery<OrderPayment>({
    queryKey: ["payments", "order", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID is required");
      const res = await getPaymentForOrderApi(orderId);
      return res.data;
    },
    enabled: Boolean(user && orderId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => cancelOrderApi(orderId),
    onSuccess: (res, orderId) => {
      toast.success(res.message || "Order cancelled successfully!");
      // Invalidate order list and specific order query
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ORDERS_QUERY_KEY, orderId] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to cancel order. Please try again.";
      toast.error(message);
    },
  });
}
