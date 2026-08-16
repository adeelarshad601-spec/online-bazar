import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applySellerApi, getSellerStatusApi, SellerStatusData } from "./api";
import { useCurrentUser } from "@/features/auth/queries";
import { CURRENT_USER_QUERY_KEY } from "@/features/auth/queries";
import { toast } from "sonner";
import { handleApiError } from "@/lib/api/error";

export const SELLER_STATUS_QUERY_KEY = ["sellerStatus"];

export function useSellerStatus() {
  const { data: user } = useCurrentUser();

  return useQuery<SellerStatusData>({
    queryKey: SELLER_STATUS_QUERY_KEY,
    queryFn: getSellerStatusApi,
    enabled: Boolean(user),
    staleTime: 1000 * 60 * 5,
  });
}

export function useApplySellerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applySellerApi,
    onSuccess: (data) => {
      queryClient.setQueryData(SELLER_STATUS_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: SELLER_STATUS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      toast.success("Seller application submitted successfully!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}
