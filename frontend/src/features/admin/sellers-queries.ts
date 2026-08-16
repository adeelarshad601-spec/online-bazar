import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminSellersApi,
  approveSellerApi,
  rejectSellerApi,
  suspendSellerApi,
  reactivateSellerApi,
} from "./sellers-api";
import { useCurrentUser } from "@/features/auth/queries";
import { SellerStatusData } from "@/features/seller/api";
import { toast } from "sonner";
import { handleApiError } from "@/lib/api/error";
import { ADMIN_STATS_QUERY_KEY } from "./dashboard-queries";

export const ADMIN_SELLERS_QUERY_KEY = ["adminSellers"];

export function useAdminSellers(status?: string) {
  const { data: user } = useCurrentUser();

  return useQuery<SellerStatusData[]>({
    queryKey: [...ADMIN_SELLERS_QUERY_KEY, status],
    queryFn: () => getAdminSellersApi(status),
    enabled: Boolean(user && user.role === "ADMIN"),
    staleTime: 1000 * 60 * 2,
  });
}

export function useApproveSellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveSellerApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SELLERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY });
      toast.success("Seller application approved!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useRejectSellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rejectSellerApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SELLERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY });
      toast.success("Seller application rejected");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useSuspendSellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suspendSellerApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SELLERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY });
      toast.success("Seller suspended");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useReactivateSellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reactivateSellerApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_SELLERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY });
      toast.success("Seller reactivated!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}
