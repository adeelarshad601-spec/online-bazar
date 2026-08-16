import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSellerPayoutDashboardApi, getSellerPayoutsApi, requestSellerPayoutApi, SellerPayoutDashboardData, SellerPayoutsResponse } from "./payout-api";
import { getVendorOrdersApi, updateVendorOrderStatusApi, VendorOrderDetails, VendorOrdersResponse } from "./orders-api";
import { toast } from "sonner";
import { handleApiError } from "@/lib/api/error";

export const PAYOUT_DASHBOARD_QUERY_KEY = ["sellerPayoutDashboard"];
export const PAYOUTS_QUERY_KEY = ["sellerPayouts"];
export const VENDOR_ORDERS_QUERY_KEY = ["vendorOrders"];

export function useSellerPayoutDashboard() {
  return useQuery<SellerPayoutDashboardData>({
    queryKey: PAYOUT_DASHBOARD_QUERY_KEY,
    queryFn: getSellerPayoutDashboardApi,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSellerPayouts(page: number = 1, limit: number = 10, status?: string) {
  return useQuery<SellerPayoutsResponse>({
    queryKey: [...PAYOUTS_QUERY_KEY, page, limit, status],
    queryFn: () => getSellerPayoutsApi(page, limit, status),
    staleTime: 1000 * 60 * 2,
  });
}

export function useRequestPayoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => requestSellerPayoutApi(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYOUT_DASHBOARD_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PAYOUTS_QUERY_KEY });
      toast.success("Payout request submitted successfully!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useVendorOrders(status?: string) {
  return useQuery<any>({
    queryKey: [...VENDOR_ORDERS_QUERY_KEY, status],
    queryFn: () => getVendorOrdersApi(status),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateVendorOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" }) =>
      updateVendorOrderStatusApi(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_ORDERS_QUERY_KEY });
      toast.success("Order status updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}
