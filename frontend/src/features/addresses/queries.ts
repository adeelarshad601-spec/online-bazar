import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserAddressesApi,
  createUserAddressApi,
  deleteUserAddressApi,
  UserAddressItem,
  UserAddressInput,
} from "./api";
import { toast } from "sonner";

export const USER_ADDRESSES_QUERY_KEY = ["user", "addresses"];

export function useUserAddresses(enabled: boolean = true) {
  return useQuery<{ success: boolean; data: UserAddressItem[] }>({
    queryKey: USER_ADDRESSES_QUERY_KEY,
    queryFn: getUserAddressesApi,
    enabled,
  });
}

export function useCreateUserAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserAddressInput) => createUserAddressApi(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_ADDRESSES_QUERY_KEY });
      toast.success(data.message || "Address saved successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save address");
    },
  });
}

export function useDeleteUserAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUserAddressApi(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_ADDRESSES_QUERY_KEY });
      toast.success(data.message || "Address deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete address");
    },
  });
}
