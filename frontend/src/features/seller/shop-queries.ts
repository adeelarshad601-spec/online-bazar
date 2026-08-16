import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createShopApi, getMyShopApi, updateShopApi, CreateShopPayload, UpdateShopPayload } from "./shop-api";
import { ShopDetails } from "@/types/shop";
import { toast } from "sonner";
import { handleApiError } from "@/lib/api/error";
import { SELLER_STATUS_QUERY_KEY } from "./queries";

export const MY_SHOP_QUERY_KEY = ["myShop"];

export function useMyShop() {
  return useQuery<ShopDetails | null>({
    queryKey: MY_SHOP_QUERY_KEY,
    queryFn: getMyShopApi,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateShopMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateShopPayload) => createShopApi(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(MY_SHOP_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: MY_SHOP_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SELLER_STATUS_QUERY_KEY });
      toast.success("Shop profile created successfully!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}

export function useUpdateShopMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateShopPayload }) => updateShopApi(id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(MY_SHOP_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: MY_SHOP_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SELLER_STATUS_QUERY_KEY });
      toast.success("Shop profile updated successfully!");
    },
    onError: (error: unknown) => {
      toast.error(handleApiError(error));
    },
  });
}
