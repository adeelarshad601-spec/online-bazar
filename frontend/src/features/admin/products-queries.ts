import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminProductsApi, updateProductStatusApi } from "./products-api";
import { PRODUCTS_QUERY_KEY } from "@/features/products/queries";
import { ADMIN_STATS_QUERY_KEY } from "./dashboard-queries";
import { toast } from "sonner";
import { handleApiError } from "@/lib/api/error";
import { Product } from "@/types/product";

export const ADMIN_PRODUCTS_QUERY_KEY = ["adminProducts"];

export function useAdminProducts() {
  return useQuery<Product[]>({
    queryKey: ADMIN_PRODUCTS_QUERY_KEY,
    queryFn: getAdminProductsApi,
    staleTime: 1000 * 30,
  });
}

export function useUpdateProductStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" }) =>
      updateProductStatusApi(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_STATS_QUERY_KEY });
      toast.success(`Product status updated to ${data.status}`);
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}
