import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductApi, updateProductApi, deleteProductApi, CreateProductPayload, UpdateProductPayload } from "./product-api";
import { searchProductsApi } from "@/features/products/api";
import { PRODUCTS_QUERY_KEY } from "@/features/products/queries";
import { toast } from "sonner";
import { handleApiError } from "@/lib/api/error";

export function useShopProducts(shopId?: string) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, "shop", shopId],
    queryFn: () => searchProductsApi({ shopId, limit: 100 }),
    enabled: Boolean(shopId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProductApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success("Product created successfully!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) => updateProductApi(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, data.id] });
      toast.success("Product updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProductApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success("Product deleted successfully!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}
